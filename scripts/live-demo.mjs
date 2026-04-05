import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const appDir = path.join(repoRoot, "apps", "web");

const rawArgs = process.argv.slice(2);
const command = rawArgs[0] ?? "prereqs";
const argSet = new Set(rawArgs.slice(1));
const positionalArgs = rawArgs
  .slice(1)
  .filter((arg) => arg !== "--json" && arg !== "--");
const options = {
  json: argSet.has("--json"),
};

function printLine(line = "") {
  if (!options.json) {
    console.log(line);
  }
}

function createCheck(name, ready, summary, details = {}) {
  return { name, ready, summary, ...details };
}

function trimOutput(text, maxLength = 600) {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}...`;
}

function normalizeBaseUrl(input) {
  const value = input.endsWith("/") ? input.slice(0, -1) : input;
  return new URL(value);
}

function extractDeploymentUrl(text) {
  const matches = text.match(/https:\/\/[A-Za-z0-9.-]+\.vercel\.app(?:\/[^\s]*)?/g);
  return matches?.[0] ?? null;
}

function extractAliases(text) {
  const matches = text.match(/https:\/\/[A-Za-z0-9.-]+\.vercel\.app/g);
  return matches ? [...new Set(matches)] : [];
}

async function runCommand(commandName, args, { cwd = repoRoot, inherit = false } = {}) {
  return new Promise((resolve) => {
    const stdout = [];
    const stderr = [];
    const child = spawn(commandName, args, {
      cwd,
      stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    });

    if (!inherit) {
      child.stdout?.on("data", (chunk) => stdout.push(chunk));
      child.stderr?.on("data", (chunk) => stderr.push(chunk));
    }

    child.on("error", (error) => {
      resolve({
        code: 1,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: error.message,
      });
    });

    child.on("close", (code) => {
      resolve({
        code: code ?? 1,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      });
    });
  });
}

function readLinkState() {
  const candidates = [
    path.join(appDir, ".vercel", "project.json"),
    path.join(appDir, ".vercel", "repo.json"),
    path.join(repoRoot, ".vercel", "project.json"),
    path.join(repoRoot, ".vercel", "repo.json"),
  ];

  for (const target of candidates) {
    if (!fs.existsSync(target)) continue;

    try {
      const raw = fs.readFileSync(target, "utf8");
      return {
        ready: true,
        summary: "Vercel project linkage is present.",
        path: target,
        data: JSON.parse(raw),
      };
    } catch (error) {
      return {
        ready: false,
        summary: "A Vercel link file exists but could not be parsed.",
        path: target,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return {
    ready: false,
    summary: "No Vercel project linkage was found for this repo or app.",
    path: null,
  };
}

async function gatherPrereqs() {
  const nextSteps = [];
  const cli = await runCommand("vercel", ["--version"], { cwd: repoRoot });
  const cliReady = cli.code === 0;

  const cliCheck = createCheck(
    "vercel-cli-ready",
    cliReady,
    cliReady
      ? "Vercel CLI is available."
      : "Vercel CLI is not available on PATH.",
    { version: trimOutput(cli.stdout), stderr: trimOutput(cli.stderr) }
  );

  let authCheck = createCheck(
    "vercel-auth-ready",
    false,
    "Vercel authentication could not be checked because the CLI is unavailable."
  );

  if (!cliReady) {
    nextSteps.push("Install the Vercel CLI and ensure `vercel` is on PATH.");
  } else {
    const whoami = await runCommand("vercel", ["whoami"], { cwd: repoRoot });
    const authenticated = whoami.code === 0;
    authCheck = createCheck(
      "vercel-auth-ready",
      authenticated,
      authenticated
        ? "Vercel authentication is available."
        : "Vercel authentication is missing.",
      {
        account: trimOutput(whoami.stdout),
        stderr: trimOutput(whoami.stderr),
      }
    );

    if (!authenticated) {
      nextSteps.push(
        "Authenticate Vercel. Use the Codex Vercel connector sign-in flow or run `vercel login`."
      );
    }
  }

  const linkState = readLinkState();
  const linkCheck = createCheck(
    "vercel-link-ready",
    linkState.ready,
    linkState.summary,
    {
      path: linkState.path,
      projectId: linkState.data?.projectId,
      orgId: linkState.data?.orgId,
      error: linkState.error,
    }
  );

  if (!linkState.ready) {
    nextSteps.push(
      "Link the app once from `apps/web` with `vercel link`, then re-run `pnpm live-demo:doctor`."
    );
  }

  const gitRemote = await runCommand("git", ["remote", "get-url", "origin"], {
    cwd: repoRoot,
  });
  const gitRemoteReady = gitRemote.code === 0;
  const gitRemoteCheck = createCheck(
    "git-remote-ready",
    gitRemoteReady,
    gitRemoteReady
      ? "Git remote origin is configured."
      : "No git remote origin is configured.",
    { remote: trimOutput(gitRemote.stdout), stderr: trimOutput(gitRemote.stderr) }
  );

  if (!gitRemoteReady) {
    nextSteps.push(
      "Optional: add a git remote if you want future Vercel git-push deploys instead of CLI deploys."
    );
  }

  return {
    platform: "vercel",
    appDir,
    ready: cliReady && authCheck.ready && linkCheck.ready,
    checks: [cliCheck, authCheck, linkCheck, gitRemoteCheck],
    nextSteps,
  };
}

function emit(result, exitCode = 0) {
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  }
  process.exitCode = exitCode;
}

async function runPrereqs() {
  const report = await gatherPrereqs();

  if (!options.json) {
    printLine(`Live demo platform: ${report.platform}`);
    printLine(`App directory: ${path.relative(repoRoot, report.appDir)}`);
    printLine(`Status: ${report.ready ? "READY" : "BLOCKED"}`);
    printLine();
    for (const check of report.checks) {
      printLine(`${check.ready ? "OK" : "BLOCKED"} ${check.name}: ${check.summary}`);
      if (check.path) {
        printLine(`  path: ${path.relative(repoRoot, check.path)}`);
      }
      if (check.account) {
        printLine(`  account: ${check.account}`);
      }
      if (check.remote) {
        printLine(`  remote: ${check.remote}`);
      }
      if (check.stderr) {
        printLine(`  detail: ${check.stderr}`);
      }
    }
    if (report.nextSteps.length > 0) {
      printLine();
      printLine("Next steps:");
      for (const step of report.nextSteps) {
        printLine(`- ${step}`);
      }
    }
  }

  emit(report, report.ready ? 0 : 1);
}

async function runDeployPreview() {
  const report = await gatherPrereqs();
  if (!report.ready) {
    if (!options.json) {
      printLine("Live demo deployment is blocked by missing prerequisites.");
      printLine("Run `pnpm live-demo:doctor` to see the current blockers.");
    }
    emit(
      {
        status: "blocked",
        summary: "Live demo deployment is blocked by missing prerequisites.",
        prereqs: report,
      },
      1
    );
    return;
  }

  printLine("Deploying preview from `apps/web` with `vercel deploy --yes --no-wait`...");
  const deploy = await runCommand("vercel", ["deploy", "--yes", "--no-wait"], {
    cwd: appDir,
    inherit: !options.json,
  });

  const combinedOutput = `${deploy.stdout}\n${deploy.stderr}`;
  const deploymentUrl = extractDeploymentUrl(combinedOutput);
  let aliases = [];

  if (deploy.code === 0 && deploymentUrl) {
    const inspect = await runCommand("vercel", ["inspect", new URL(deploymentUrl).hostname], {
      cwd: appDir,
    });
    aliases = extractAliases(`${inspect.stdout}\n${inspect.stderr}`).filter(
      (alias) => alias !== deploymentUrl
    );
  }

  const preferredUrl = aliases[0] ?? deploymentUrl;

  if (!options.json) {
    if (deploy.code === 0) {
      printLine();
      printLine("Preview deployment started.");
      if (preferredUrl) {
        printLine(`Preferred public URL: ${preferredUrl}`);
        printLine(`Next: pnpm live-demo:verify -- ${preferredUrl}`);
      }
    } else {
      printLine();
      printLine("Preview deployment failed.");
      if (deploy.stderr) {
        printLine(trimOutput(deploy.stderr));
      }
    }
  }

  emit(
    {
      status: deploy.code === 0 ? "started" : "failed",
      deploymentUrl,
      preferredUrl,
      aliases,
      stdout: trimOutput(deploy.stdout, 2_000),
      stderr: trimOutput(deploy.stderr, 2_000),
    },
    deploy.code === 0 ? 0 : 1
  );
}

async function verifyEndpoint(baseUrl, route, assertion) {
  const target = new URL(route, baseUrl).toString();

  try {
    const response = await fetch(target, { method: "GET" });
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok) {
      return createCheck(
        target,
        false,
        `Received HTTP ${response.status}.`,
        { status: response.status }
      );
    }

    if (assertion.type === "json") {
      const body = await response.json();
      const ready = body?.ok === true;
      return createCheck(
        target,
        ready,
        ready ? "Health endpoint returned `{ ok: true }`." : "Health endpoint body did not match `{ ok: true }`.",
        { status: response.status, body }
      );
    }

    const body = await response.text();
    const ready = body.includes(assertion.contains);
    return createCheck(
      target,
      ready,
      ready
        ? `Page contains expected marker: ${assertion.contains}`
        : `Page is reachable but missing expected marker: ${assertion.contains}`,
      { status: response.status, contentType, snippet: trimOutput(body, 300) }
    );
  } catch (error) {
    return createCheck(
      target,
      false,
      "Request failed.",
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
}

async function runVerify() {
  const baseInput = positionalArgs[0];
  if (!baseInput) {
    if (!options.json) {
      printLine("Usage: node scripts/live-demo.mjs verify <base-url> [--json]");
    }
    emit(
      {
        status: "error",
        summary: "A base URL is required for live demo verification.",
      },
      1
    );
    return;
  }

  const baseUrl = normalizeBaseUrl(baseInput);
  const checks = await Promise.all([
    verifyEndpoint(baseUrl, "/", {
      type: "text",
      contains: "AI-assisted UI dev loop template",
    }),
    verifyEndpoint(baseUrl, "/dev-loop", {
      type: "text",
      contains: "/dev-loop",
    }),
    verifyEndpoint(baseUrl, "/api/health", {
      type: "json",
    }),
  ]);

  const ready = checks.every((check) => check.ready);
  const result = {
    status: ready ? "ready" : "failed",
    baseUrl: baseUrl.toString(),
    checks,
  };

  if (!options.json) {
    printLine(`Verification target: ${result.baseUrl}`);
    printLine(`Status: ${ready ? "READY" : "FAILED"}`);
    printLine();
    for (const check of checks) {
      printLine(`${check.ready ? "OK" : "FAILED"} ${check.name}: ${check.summary}`);
    }
  }

  emit(result, ready ? 0 : 1);
}

switch (command) {
  case "prereqs":
    await runPrereqs();
    break;
  case "deploy-preview":
    await runDeployPreview();
    break;
  case "verify":
    await runVerify();
    break;
  default:
    printLine("Supported commands: prereqs, deploy-preview, verify");
    process.exitCode = 1;
}
