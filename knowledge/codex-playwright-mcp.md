# Codex + Playwright MCP (working setup for this repo)

This repo is designed to be driven by an AI through a real browser:
- interact with UI elements
- read browser console output
- inspect computed styles/colors (shadcn tokens)
- inspect deterministic network requests

The deterministic target page is: `http://127.0.0.1:3000/dev-loop`.

## Start Here

From the repository root, run:

```bash
pnpm activate
```

This reports whether the repo is:
- `dependency-ready`
- `app-ready`
- `playwright-ready`
- `mcp-ready`
- `fallback-ready`

If you only want a non-mutating readiness check, run:

```bash
pnpm doctor:loop
```

## 0) Verify the MCP server is configured in Codex

This repo assumes you already have the Playwright MCP server configured globally (Codex does not currently support a repo-local MCP config).

Verify:

```bash
codex mcp list
```

Expected (example from this machine):

```
Name        Command                Args           Status
playwright  mcp-server-playwright  --extension    enabled
```

Notes:
- This machine is using `mcp-server-playwright` v0.0.55 (`mcp-server-playwright --version`).
- Some MCP clients will show `Transport closed` with this version; use the sidecar demo below in that case.

## 1) Run the app

From repo root:

```bash
pnpm activate
pnpm dev
```

Open:
- `http://127.0.0.1:3000/dev-loop`

## 2) Use Codex browser tools (when available)

If your Codex environment can successfully call Playwright MCP tools, you can:
- navigate to the dev loop page
- click buttons / type input
- fetch console messages
- evaluate computed styles (colors)

If Codex returns `Transport closed`, use the sidecar script below (it talks to the MCP server directly over stdio).

## 3) Sidecar MCP verification (works even if Codex tool calls fail)

This repo includes a script that:
- starts `mcp-server-playwright` in headless mode
- navigates to `/dev-loop`
- emits console signals
- runs the deterministic network probe against `/api/health?probe=dev-loop`
- reads a computed color (`--background`) before/after switching theme
- verifies console, network, and computed-style expectations
- returns structured JSON and a non-zero exit code when the verification fails

Prereq:
- `mcp-server-playwright` available on PATH (installed via `@playwright/mcp`)

Run:

```bash
pnpm dev
pnpm mcp:verify
```

Optional env vars:

```bash
DEMO_URL="http://127.0.0.1:3000/dev-loop" pnpm mcp:verify
MCP_SERVER_CMD="mcp-server-playwright" pnpm mcp:verify
```

Compatibility alias:

```bash
pnpm mcp:dev-loop
```

## 4) Troubleshooting

See `knowledge/browser-feedback-loop.md` for background on common Playwright MCP issues (including `Transport closed`) and the Chrome extension (“Playwright MCP Bridge”) flow.
