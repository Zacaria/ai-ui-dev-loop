import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const appDir = path.join(repoRoot, "apps", "web");
const host = process.env.DEMO_HOST ?? "127.0.0.1";
const port = Number(process.env.DEMO_PORT ?? 3000);
const devLoopUrl = process.env.DEMO_URL ?? `http://${host}:${port}/dev-loop`;
const timeoutMs = Number(process.env.ACTIVATE_TIMEOUT_MS ?? 30_000);

const argSet = new Set(process.argv.slice(2));
const options = {
  json: argSet.has("--json"),
  noInstall: argSet.has("--no-install"),
  keepServer: argSet.has("--keep-server"),
};

function createState(name, ready, summary, details = {}) {
  return { name, ready, summary, ...details };
}

function printLine(line = "") {
  if (!options.json) {
    console.log(line);
  }
}

function trimOutput(text, maxLength = 600) {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}...`;
}

function listMissingPaths(paths) {
  return paths.filter((target) => !fs.existsSync(target));
}

function markNextStep(nextSteps, step) {
  if (!nextSteps.includes(step)) {
    nextSteps.push(step);
  }
}

function detectNodeModulesState() {
  const required = [
    path.join(repoRoot, "node_modules"),
    path.join(appDir, "node_modules"),
  ];

  return {
    installed: listMissingPaths(required).length === 0,
    required,
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCommand(command, args, { cwd = repoRoot, env, inherit = false } = {}) {
  return new Promise((resolve) => {
    const stdout = [];
    const stderr = [];
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
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

async function waitForUrl(url, timeout, control = { cancelled: false }) {
  const startedAt = Date.now();
  while (!control.cancelled && Date.now() - startedAt < timeout) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) {
        return true;
      }
    } catch {
      // Retry until timeout.
    }

    await wait(500);
  }

  return false;
}

async function ensureDependencies(nextSteps) {
  const installState = detectNodeModulesState();
  if (installState.installed) {
    return createState(
      "dependency-ready",
      true,
      "Dependencies are installed.",
      { action: "reused" }
    );
  }

  if (options.noInstall) {
    markNextStep(nextSteps, "Run `pnpm install` from the repository root.");
    return createState(
      "dependency-ready",
      false,
      "Dependencies are missing.",
      { action: "skipped-install", missing: listMissingPaths(installState.required) }
    );
  }

  printLine("Installing repository dependencies with `pnpm install`...");
  const installResult = await runCommand("pnpm", ["install"], {
    cwd: repoRoot,
    inherit: !options.json,
  });

  if (installResult.code !== 0) {
    markNextStep(nextSteps, "Fix dependency installation errors, then re-run `pnpm activate`.");
    return createState(
      "dependency-ready",
      false,
      "Dependency installation failed.",
      { action: "install-failed", stderr: trimOutput(installResult.stderr) }
    );
  }

  return createState(
    "dependency-ready",
    true,
    "Dependencies are installed.",
    { action: "installed" }
  );
}

async function ensurePlaywright(nextSteps) {
  const probeScript = [
    "const fs = require('node:fs');",
    "const { chromium } = require('@playwright/test');",
    "const executablePath = chromium.executablePath();",
    "if (!executablePath) process.exit(1);",
    "console.log(executablePath);",
    "process.exit(fs.existsSync(executablePath) ? 0 : 1);",
  ].join("");

  const probe = await runCommand(
    "pnpm",
    ["-C", appDir, "exec", "node", "-e", probeScript],
    { cwd: repoRoot }
  );

  if (probe.code === 0) {
    return createState(
      "playwright-ready",
      true,
      "Playwright browser binaries are available.",
      { browserExecutable: probe.stdout.trim() }
    );
  }

  if (options.noInstall) {
    markNextStep(nextSteps, "Run `pnpm -C apps/web exec playwright install chromium`.");
    return createState(
      "playwright-ready",
      false,
      "Playwright browser binaries are missing.",
      { action: "skipped-install", stderr: trimOutput(probe.stderr || probe.stdout) }
    );
  }

  printLine("Installing Playwright Chromium browser...");
  const install = await runCommand(
    "pnpm",
    ["-C", appDir, "exec", "playwright", "install", "chromium"],
    {
      cwd: repoRoot,
      inherit: !options.json,
    }
  );

  if (install.code !== 0) {
    markNextStep(nextSteps, "Install Playwright browsers manually, then re-run `pnpm activate`.");
    return createState(
      "playwright-ready",
      false,
      "Playwright browser installation failed.",
      { action: "install-failed", stderr: trimOutput(install.stderr) }
    );
  }

  const reprobe = await runCommand(
    "pnpm",
    ["-C", appDir, "exec", "node", "-e", probeScript],
    { cwd: repoRoot }
  );

  return createState(
    "playwright-ready",
    reprobe.code === 0,
    reprobe.code === 0
      ? "Playwright browser binaries are available."
      : "Playwright browser installation did not produce a usable executable.",
    {
      action: "installed",
      browserExecutable: reprobe.stdout.trim(),
      stderr: trimOutput(reprobe.stderr),
    }
  );
}

async function checkMcpReadiness(nextSteps) {
  const codexVersion = await runCommand("codex", ["--version"], { cwd: repoRoot });
  if (codexVersion.code !== 0) {
    markNextStep(nextSteps, "Install the Codex CLI or verify it is on PATH if you want Codex-native MCP control.");
    return createState(
      "mcp-ready",
      false,
      "Codex CLI was not detected, so Codex-native MCP readiness could not be confirmed.",
      { stderr: trimOutput(codexVersion.stderr) }
    );
  }

  const mcpList = await runCommand("codex", ["mcp", "list"], { cwd: repoRoot });
  const combinedOutput = `${mcpList.stdout}\n${mcpList.stderr}`;
  const detected = /playwright|mcp-server-playwright/i.test(combinedOutput);

  if (!detected) {
    markNextStep(
      nextSteps,
      "Configure a global Playwright MCP server in Codex, then re-run `pnpm doctor:loop`."
    );
  }

  return createState(
    "mcp-ready",
    detected,
    detected
      ? "Codex MCP output includes a Playwright server."
      : "Codex MCP output did not include a Playwright server.",
    { codexVersion: trimOutput(codexVersion.stdout), codexMcpList: trimOutput(combinedOutput) }
  );
}

async function checkFallbackReadiness(nextSteps) {
  const serverVersion = await runCommand("mcp-server-playwright", ["--version"], {
    cwd: repoRoot,
  });

  if (serverVersion.code !== 0) {
    markNextStep(
      nextSteps,
      "Install `mcp-server-playwright` if you want to use the sidecar MCP fallback."
    );
  }

  return createState(
    "fallback-ready",
    serverVersion.code === 0,
    serverVersion.code === 0
      ? "The sidecar MCP server command is available."
      : "The sidecar MCP server command is not available on PATH.",
    { serverVersion: trimOutput(serverVersion.stdout || serverVersion.stderr) }
  );
}

async function ensureAppReachable(nextSteps) {
  const existing = await waitForUrl(devLoopUrl, 2_000);
  if (existing) {
    return createState(
      "app-ready",
      true,
      "The dev loop is already reachable.",
      { url: devLoopUrl, action: "reused-existing-server" }
    );
  }

  let stdout = "";
  let stderr = "";
  const control = { cancelled: false };
  const child = spawn("pnpm", ["-C", appDir, "dev"], {
    cwd: repoRoot,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout?.on("data", (chunk) => {
    stdout += chunk.toString("utf8");
  });
  child.stderr?.on("data", (chunk) => {
    stderr += chunk.toString("utf8");
  });

  const exitPromise = new Promise((resolve) => {
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });

  const readyPromise = waitForUrl(devLoopUrl, timeoutMs, control);
  const winner = await Promise.race([
    readyPromise.then((ready) => ({ type: "ready", ready })),
    exitPromise.then((code) => ({ type: "exit", code })),
  ]);
  control.cancelled = true;

  const teardown = async () => {
    if (options.keepServer) return;
    if (!child.killed) {
      child.kill("SIGTERM");
      await Promise.race([exitPromise, wait(2_000)]);
    }
  };

  if (winner.type === "ready" && winner.ready) {
    await teardown();
    return createState(
      "app-ready",
      true,
      "The repo can start the local dev server and reach `/dev-loop`.",
      { url: devLoopUrl, action: "started-local-server" }
    );
  }

  await teardown();
  markNextStep(nextSteps, "Run `pnpm dev` and confirm the app can bind to 127.0.0.1:3000.");

  return createState(
    "app-ready",
    false,
    "The repo could not verify that `/dev-loop` is reachable.",
    {
      url: devLoopUrl,
      stdout: trimOutput(stdout),
      stderr: trimOutput(stderr),
      reason: winner.type === "exit" ? `dev-server-exited:${winner.code}` : "timeout",
    }
  );
}

function determineOverall(states) {
  const appReady = states["app-ready"]?.ready;
  const playwrightReady = states["playwright-ready"]?.ready;
  const mcpReady = states["mcp-ready"]?.ready;
  const fallbackReady = states["fallback-ready"]?.ready;

  if (appReady && playwrightReady && (mcpReady || fallbackReady)) {
    return "ready";
  }

  if (appReady || playwrightReady || mcpReady || fallbackReady) {
    return "partial";
  }

  return "not-ready";
}

function renderHumanSummary(report) {
  printLine("AI Loop Activation");
  printLine("");
  printLine(`Overall: ${report.overall.toUpperCase()}`);
  printLine("");

  for (const state of report.states) {
    printLine(`- ${state.name}: ${state.ready ? "ready" : "not-ready"}`);
    printLine(`  ${state.summary}`);
  }

  if (report.checkpoints.length > 0) {
    printLine("");
    printLine("Checkpoints:");
    for (const checkpoint of report.checkpoints) {
      printLine(`- ${checkpoint}`);
    }
  }

  if (report.nextSteps.length > 0) {
    printLine("");
    printLine("Next steps:");
    for (const step of report.nextSteps) {
      printLine(`- ${step}`);
    }
  }
}

async function main() {
  const nextSteps = [];
  const states = [];

  const dependencyState = await ensureDependencies(nextSteps);
  states.push(dependencyState);

  if (!dependencyState.ready) {
    const report = {
      overall: "not-ready",
      states,
      checkpoints: [`Expected dev loop URL: ${devLoopUrl}`],
      nextSteps,
    };

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      renderHumanSummary(report);
    }

    process.exitCode = 1;
    return;
  }

  const [appState, playwrightState, mcpState, fallbackState] = await Promise.all([
    ensureAppReachable(nextSteps),
    ensurePlaywright(nextSteps),
    checkMcpReadiness(nextSteps),
    checkFallbackReadiness(nextSteps),
  ]);

  states.push(appState, playwrightState, mcpState, fallbackState);

  const overall = determineOverall(
    Object.fromEntries(states.map((state) => [state.name, state]))
  );

  if (overall === "ready") {
    markNextStep(nextSteps, "Run `pnpm dev` to start the app for interactive work.");
    markNextStep(nextSteps, `Open \`${devLoopUrl}\` in your browser.`);
    if (mcpState.ready) {
      markNextStep(nextSteps, "Use Codex browser tools against `/dev-loop`.");
    } else if (fallbackState.ready) {
      markNextStep(nextSteps, "Run `pnpm mcp:verify` to verify the sidecar MCP path.");
    }
  }

  const report = {
    overall,
    states,
    checkpoints: [
      `Expected dev loop URL: ${devLoopUrl}`,
      `Root activation command: pnpm activate`,
      `Verification-only command: pnpm doctor:loop`,
    ],
    nextSteps,
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    renderHumanSummary(report);
  }

  process.exitCode = overall === "ready" ? 0 : overall === "partial" ? 2 : 1;
}

await main();
