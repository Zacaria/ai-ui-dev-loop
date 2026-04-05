# Browser Feedback Loop Troubleshooting

This repo's supported first-run path is:

```bash
pnpm activate
```

Use this document when `pnpm activate` or `pnpm doctor:loop` reports partial readiness and you need to understand which part of the browser loop is missing.

The deterministic local target for this repo is:

- `http://127.0.0.1:3000/dev-loop`

## Readiness states

The activation flow reports these states:

- `dependency-ready`: repository dependencies are installed
- `app-ready`: the repo can start the local app and reach `/dev-loop`
- `playwright-ready`: Playwright browser binaries are available
- `mcp-ready`: Codex appears to have a Playwright MCP server configured
- `fallback-ready`: the sidecar `mcp-server-playwright` command is available

The overall result is:

- `READY`: app + Playwright + at least one MCP path are available
- `PARTIAL`: some pieces work, but not the full AI/browser loop
- `NOT READY`: the repo cannot verify the local loop

## Typical recovery path

1. Run `pnpm activate`
2. Fix the first missing state it reports
3. Re-run `pnpm doctor:loop`
4. Once readiness is acceptable, start the app with `pnpm dev`

## Common failures

### `dependency-ready` is not ready

Cause:
- Dependencies have not been installed yet, or installation failed.

Fix:

```bash
pnpm install
pnpm doctor:loop
```

### `app-ready` is not ready

Cause:
- The dev server could not start
- Port `3000` is already taken
- The current environment blocks local port binding

Fix:

```bash
pnpm dev
```

Then verify:

- `http://127.0.0.1:3000/dev-loop`

If the server cannot bind locally, free port `3000` or run outside the sandboxed environment.

### `playwright-ready` is not ready

Cause:
- Playwright browser binaries are missing.

Fix:

```bash
pnpm -C apps/web exec playwright install chromium
pnpm doctor:loop
```

### `mcp-ready` is not ready

Cause:
- Codex CLI is not installed
- Codex is installed, but no Playwright MCP server is configured globally

Verify:

```bash
codex --version
codex mcp list
```

What you want to see:
- a Playwright entry
- or a command that resolves to `mcp-server-playwright`

If it is missing, follow the setup notes in `knowledge/codex-playwright-mcp.md`.

### `fallback-ready` is not ready

Cause:
- `mcp-server-playwright` is not available on PATH

Fix:
- Install the Playwright MCP server using your preferred method
- Re-run `pnpm doctor:loop`

## Sidecar fallback

If `mcp-ready` is false but `fallback-ready` is true, the repo can still verify the browser observability path through the sidecar workflow:

```bash
pnpm dev
pnpm mcp:verify
```

This path is useful when Codex-native MCP calls are unavailable but the local MCP server works.

Expected checks:

- console signals
- deterministic network probe against `/api/health?probe=dev-loop`
- computed color change after a theme switch

Compatibility alias:

```bash
pnpm mcp:dev-loop
```

## Validation notes

- `pnpm validate` checks lint, build, and Playwright E2E
- In sandboxed environments that block local port binding, browser-based checks must run outside the sandbox

## Known constraints

- The repo can detect MCP-related readiness, but it cannot directly mutate a user's global Codex MCP configuration
- The supported repo-owned verifier is the sidecar `pnpm mcp:verify` path, not Codex-native MCP calls
- Some MCP client and server combinations may still require the Chrome bridge extension or environment-specific setup
