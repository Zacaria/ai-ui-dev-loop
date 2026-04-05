import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const appsWebDir = path.resolve(scriptDir, "..");
const port = Number(process.env.DEMO_PORT ?? 3000);
const url = process.env.DEMO_URL ?? `http://127.0.0.1:${port}/dev-loop`;
const outputPath = process.env.OUTPUT_PATH ?? path.join(repoRoot, "docs", "assets", "dev-loop.png");
const command = process.env.MCP_SERVER_CMD ?? "mcp-server-playwright";
const startDevServer = process.env.START_DEV_SERVER !== "0";

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

    const rl = await import("node:readline").then((mod) =>
      mod.createInterface({ input: this._process.stdout, crlfDelay: Infinity })
    );

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

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(targetUrl, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(targetUrl, { method: "GET" });
      if (res.ok) return true;
    } catch {
      // ignore until timeout
    }
    await sleep(500);
  }
  return false;
}

async function ensureDevServer() {
  const alreadyRunning = await waitForServer(url, 3000);
  if (alreadyRunning || !startDevServer) return null;

  const devProcess = spawn(
    "pnpm",
    [
      "-C",
      appsWebDir,
      "exec",
      "next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
    stdio: "inherit",
      env: process.env,
    }
  );

  const ready = await waitForServer(url, 30000);
  if (!ready) {
    devProcess.kill("SIGTERM");
    throw new Error(`Dev server did not become ready at ${url}`);
  }

  return devProcess;
}

const transport = new JsonLinesStdioClientTransport({
  command,
  args: ["--headless", "--console-level", "error", "--snapshot-mode", "none"],
  cwd: repoRoot,
});

const client = new Client({ name: "ai-ui-dev-loop", version: "0.0.0" });
let devProcess;

try {
  mkdirSync(path.dirname(outputPath), { recursive: true });
  devProcess = await ensureDevServer();

  await client.connect(transport);

  await client.callTool({
    name: "browser_navigate",
    arguments: { url },
  });

  const outputPathJson = JSON.stringify(outputPath);
  const runCode = `async (page) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.getByRole('heading', { name: '/dev-loop' }).waitFor();
    await page.getByLabel('Name').fill('Codex');
    await page.getByRole('button', { name: 'Refresh computed colors' }).click();
    await page.waitForTimeout(250);
    await page.screenshot({ path: ${outputPathJson}, fullPage: true });
    return { outputPath: ${outputPathJson} };
  }`;

  await client.callTool({
    name: "browser_run_code",
    arguments: { code: runCode },
  });

  console.log(`Saved demo screenshot to ${outputPath}`);
} catch (error) {
  console.error("Failed to generate demo media:", error);
  console.error("If Playwright browsers are missing, run: pnpm -C apps/web exec playwright install chromium");
  process.exitCode = 1;
} finally {
  await transport.close();
  if (devProcess) {
    devProcess.kill("SIGTERM");
  }
}
