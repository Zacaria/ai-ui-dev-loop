import { spawn, spawnSync } from "node:child_process";
import readline from "node:readline";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const url = process.env.DEMO_URL ?? "http://127.0.0.1:3000/dev-loop";
const command = process.env.MCP_SERVER_CMD ?? "mcp-server-playwright";

const EXIT_CODES = {
  ok: 0,
  config: 2,
  tooling: 3,
  assertion: 4,
};

class JsonLinesStdioClientTransport {
  constructor({ command, args = [], env, cwd } = {}) {
    this._command = command;
    this._args = args;
    this._env = env;
    this._cwd = cwd;
    this._process = null;
    this.onmessage = undefined;
    this.onclose = undefined;
    this.onerror = undefined;
  }

  async start() {
    if (this._process) throw new Error("Transport already started");

    this._process = spawn(this._command, this._args, {
      stdio: ["pipe", "pipe", "inherit"],
      env: { ...process.env, ...this._env },
      cwd: this._cwd,
    });

    this._process.on("error", (error) => this.onerror?.(error));
    this._process.on("close", () => this.onclose?.());

    const rl = readline.createInterface({
      input: this._process.stdout,
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        this.onmessage?.(JSON.parse(trimmed));
      } catch (error) {
        this.onerror?.(error);
      }
    });
  }

  async send(message) {
    if (!this._process?.stdin) throw new Error("Not connected");
    this._process.stdin.write(`${JSON.stringify(message)}\n`);
  }

  async close() {
    if (!this._process) return;
    this._process.stdin?.end();
    this._process.kill("SIGTERM");
    this._process = null;
  }
}

function printResult(result, code) {
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = code;
}

function failure(category, summary, details = {}) {
  return {
    status: "error",
    category,
    summary,
    ...details,
  };
}

function extractJsonFromToolText(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (fenced?.[1]) return JSON.parse(fenced[1]);

  const resultSection = text.match(/### Result\s*([\s\S]*?)(?:\n### |\s*$)/);
  if (resultSection?.[1]) return JSON.parse(resultSection[1].trim());

  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return JSON.parse(trimmed);

  return text;
}

function parseToolPayload(result) {
  if (!result) return result;
  if (!Array.isArray(result.content)) return result;

  const text = result.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n")
    .trim();

  if (!text) return result;

  try {
    return extractJsonFromToolText(text);
  } catch {
    return text;
  }
}

function collectObjects(value, predicate, matches = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectObjects(item, predicate, matches);
    }
    return matches;
  }

  if (!value || typeof value !== "object") return matches;

  if (predicate(value)) {
    matches.push(value);
  }

  for (const child of Object.values(value)) {
    collectObjects(child, predicate, matches);
  }

  return matches;
}

function normalizeConsoleMessages(payload) {
  if (typeof payload === "string") {
    return payload
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^\[[A-Z]+\]/.test(line))
      .map((line) => {
        const match = line.match(/^\[([A-Z]+)\]\s+([\s\S]+?)(?:\s+@\s+https?:\/\/.*)?$/);
        return {
          type: match?.[1]?.toLowerCase() ?? "unknown",
          text: match?.[2] ?? line,
        };
      });
  }

  const messages = collectObjects(
    payload,
    (value) =>
      typeof value.text === "string" &&
      (typeof value.type === "string" || typeof value.level === "string")
  );

  return messages.map((message) => ({
    type: String(message.type ?? message.level ?? "unknown"),
    text: String(message.text),
  }));
}

function normalizeNetworkRequests(payload) {
  if (typeof payload === "string") {
    return payload
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^\[[A-Z]+\]\s+https?:\/\//.test(line))
      .map((line) => {
        const match = line.match(
          /^\[([A-Z]+)\]\s+(https?:\/\/\S+)\s+=>\s+\[(\d{3})\]/
        );
        return {
          url: match?.[2] ?? line,
          method: match?.[1] ?? "GET",
          status: match?.[3] ? Number(match[3]) : null,
        };
      });
  }

  const requests = collectObjects(
    payload,
    (value) =>
      typeof value.url === "string" &&
      (typeof value.method === "string" ||
        typeof value.status === "number" ||
        typeof value.statusCode === "number")
  );

  return requests.map((request) => ({
    url: String(request.url),
    method: request.method ? String(request.method) : "GET",
    status:
      typeof request.status === "number"
        ? request.status
        : typeof request.statusCode === "number"
          ? request.statusCode
          : null,
  }));
}

async function ensureTargetReachable(targetUrl) {
  try {
    const response = await fetch(targetUrl, { method: "GET" });
    if (!response.ok) {
      return failure("config", "The local dev-loop URL is not reachable.", {
        url: targetUrl,
        status: response.status,
        nextSteps: [
          "Run `pnpm dev` from the repository root.",
          "Confirm `http://127.0.0.1:3000/dev-loop` loads in a browser.",
        ],
      });
    }
  } catch (error) {
    return failure("config", "The local dev-loop URL is not reachable.", {
      url: targetUrl,
      error: error instanceof Error ? error.message : String(error),
      nextSteps: [
        "Run `pnpm dev` from the repository root.",
        "Confirm `http://127.0.0.1:3000/dev-loop` loads in a browser.",
      ],
    });
  }

  return null;
}

function ensureServerCommandAvailable(serverCommand) {
  const check = spawnSync(serverCommand, ["--version"], {
    encoding: "utf8",
  });

  if (check.error || check.status !== 0) {
    return failure("config", "The sidecar MCP server command is not available.", {
      command: serverCommand,
      error: check.error?.message ?? (check.stderr || check.stdout || "").trim(),
      nextSteps: [
        "Install `mcp-server-playwright` or set `MCP_SERVER_CMD` to a working command.",
      ],
    });
  }

  return {
    command: serverCommand,
    version: (check.stdout || check.stderr || "").trim(),
  };
}

function createChecks({
  actions,
  consoleMessages,
  networkRequests,
}) {
  const consoleTexts = consoleMessages.map((message) => message.text);
  const requiredConsoleSignals = [
    "dev-loop:console:log",
    "dev-loop:console:warn",
    "dev-loop:console:handled-error",
    "dev-loop:network:probe:200:true",
  ];

  const missingConsoleSignals = requiredConsoleSignals.filter(
    (signal) => !consoleTexts.some((text) => text.includes(signal))
  );

  const probeRequests = networkRequests.filter((request) =>
    request.url.includes("/api/health?probe=dev-loop")
  );

  const colorsLookValid =
    typeof actions.bgBefore === "string" &&
    typeof actions.bgAfter === "string" &&
    /\w+\(.+\)/.test(actions.bgBefore) &&
    /\w+\(.+\)/.test(actions.bgAfter) &&
    actions.bgBefore !== actions.bgAfter;

  const checks = {
    consoleSignals: {
      ok: missingConsoleSignals.length === 0,
      required: requiredConsoleSignals,
      missing: missingConsoleSignals,
      observedCount: consoleMessages.length,
    },
    networkProbe: {
      ok:
        actions.probe?.ok === true &&
        actions.probe?.status === 200 &&
        typeof actions.probe?.uiResult === "string" &&
        actions.probe.uiResult.includes("status=200") &&
        actions.probe.uiResult.includes("ok=true") &&
        probeRequests.length > 0,
      action: actions.probe,
      observedRequests: probeRequests,
    },
    computedColors: {
      ok: colorsLookValid,
      bgBefore: actions.bgBefore,
      bgAfter: actions.bgAfter,
      themeTarget: actions.themeTarget,
    },
    counter: {
      ok: actions.counterValue === "1",
      value: actions.counterValue,
    },
  };

  return checks;
}

function summarizeFailures(checks) {
  return Object.entries(checks)
    .filter(([, value]) => value.ok === false)
    .map(([name]) => name);
}

const transport = new JsonLinesStdioClientTransport({
  command,
  args: ["--headless", "--console-level", "debug", "--snapshot-mode", "none"],
});

const client = new Client({ name: "ai-ui-dev-loop", version: "0.0.0" });

const targetFailure = await ensureTargetReachable(url);
if (targetFailure) {
  printResult(targetFailure, EXIT_CODES.config);
} else {
  const serverCheck = ensureServerCommandAvailable(command);
  if ("status" in serverCheck) {
    printResult(serverCheck, EXIT_CODES.config);
  } else {
    try {
      await client.connect(transport);

      await client.callTool({
        name: "browser_navigate",
        arguments: { url },
      });

      const actionsResult = await client.callTool({
        name: "browser_run_code",
        arguments: {
          code: `async (page) => {
            await page.getByRole('heading', { name: '/dev-loop' }).waitFor();
            await page.getByLabel('Name').fill('Codex');
            await page.getByRole('button', { name: 'Emit console signals' }).click();

            const probeResponsePromise = page.waitForResponse((response) =>
              response.url().includes('/api/health?probe=dev-loop') &&
              response.request().method() === 'GET'
            );
            await page.getByTestId('btn-network-probe').click();
            const probeResponse = await probeResponsePromise;
            await page.getByTestId('network-probe-result').waitFor();

            await page.getByTestId('counter-inc').click();
            await page.getByTestId('counter-inc').click();
            await page.getByTestId('counter-dec').click();
            const counterValue = await page.getByTestId('counter-value').textContent();
            const probeUiResult = await page.getByTestId('network-probe-result').textContent();
            await page.getByRole('button', { name: 'Refresh computed colors' }).click();

            const bgBefore = await page.locator('[data-token="--background"]').evaluate((el) => {
              return getComputedStyle(el).backgroundColor;
            });

            const prefersDark = await page.locator('html').evaluate((el) => {
              return el.classList.contains('dark');
            });
            const themeTarget = prefersDark ? 'Light' : 'Dark';
            await page.getByTestId('theme-toggle').click();
            await page.getByText(themeTarget, { exact: true }).click();
            await page.getByRole('button', { name: 'Refresh computed colors' }).click();

            const bgAfter = await page.locator('[data-token="--background"]').evaluate((el) => {
              return getComputedStyle(el).backgroundColor;
            });

            const lastAction = await page.getByTestId('last-action').textContent();
            return {
              url: page.url(),
              lastAction,
              counterValue,
              bgBefore,
              bgAfter,
              themeTarget: themeTarget.toLowerCase(),
              probe: {
                url: probeResponse.url(),
                status: probeResponse.status(),
                ok: probeResponse.ok(),
                uiResult: probeUiResult,
              },
            };
          }`,
        },
      });

      const consoleMessagesResult = await client.callTool({
        name: "browser_console_messages",
        arguments: { level: "debug" },
      });

      const networkResult = await client.callTool({
        name: "browser_network_requests",
        arguments: { includeStatic: false },
      });

      const actions = parseToolPayload(actionsResult);
      if (!actions || typeof actions !== "object" || Array.isArray(actions)) {
        printResult(
          failure("tooling", "The MCP sidecar did not return a structured action summary.", {
            rawActions: actions,
          }),
          EXIT_CODES.tooling
        );
      } else {
        const rawConsolePayload = parseToolPayload(consoleMessagesResult);
        const rawNetworkPayload = parseToolPayload(networkResult);
        const consoleMessages = normalizeConsoleMessages(rawConsolePayload);
        const networkRequests = normalizeNetworkRequests(rawNetworkPayload);

        const checks = createChecks({ actions, consoleMessages, networkRequests });
        const failedChecks = summarizeFailures(checks);

        if (failedChecks.length > 0) {
          printResult(
            failure("assertion", "The MCP observability verification failed.", {
              url,
              failedChecks,
              checks,
              serverVersion: serverCheck.version,
              raw: {
                console: rawConsolePayload,
                network: rawNetworkPayload,
              },
            }),
            EXIT_CODES.assertion
          );
        } else {
          printResult(
            {
              status: "ok",
              category: "success",
              summary:
                "The MCP sidecar verified console, network, and computed-style observability.",
              url,
              checks,
              serverVersion: serverCheck.version,
              observed: {
                consoleMessages,
                networkRequests,
                actions,
              },
            },
            EXIT_CODES.ok
          );
        }
      }
    } catch (error) {
      printResult(
        failure("tooling", "The MCP sidecar workflow could not complete.", {
          url,
          command,
          error: error instanceof Error ? error.message : String(error),
          nextSteps: [
            "Confirm `mcp-server-playwright` works locally.",
            "Re-run `pnpm mcp:verify` after fixing the MCP server setup.",
          ],
        }),
        EXIT_CODES.tooling
      );
    } finally {
      await transport.close();
    }
  }
}
