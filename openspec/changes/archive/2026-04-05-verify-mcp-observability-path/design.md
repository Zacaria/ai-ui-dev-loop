## Context

The current repo offers two related but different browser-loop stories:

- a readiness story (`pnpm activate` / `pnpm doctor:loop`) that tells a user whether the local pieces appear available
- a sidecar demo (`pnpm mcp:dev-loop`) that exercises the browser through `mcp-server-playwright`

That sidecar script already reads console output, colors, and network requests, but it does not yet behave like a supported verifier. It lacks explicit pass/fail semantics, and the app itself does not expose a deterministic network action on `/dev-loop`; the script can only report whatever network it happens to observe.

## Goals / Non-Goals

**Goals:**
- Make the sidecar MCP path deterministic enough to serve as a maintained verification workflow.
- Give `/dev-loop` an explicit network interaction that is stable, inspectable, and testable.
- Ensure maintainers can distinguish setup failures, MCP tool failures, and observability assertion failures.
- Document one supported path for MCP/browser observability that the repo can actually own.

**Non-Goals:**
- Make Codex-native MCP calls universally reliable across all user environments.
- Add GitHub CI that depends on a user's global Codex MCP configuration.
- Introduce a broader product surface beyond what is needed for observability verification.
- Replace Playwright E2E with MCP-driven verification.

## Decisions

### 1. Add an explicit network probe to `/dev-loop`

The dev-loop page should expose a stable control that triggers a fetch to `/api/health`, records the result in the UI, and emits a predictable console signal.

Rationale:
- A user-facing control makes the network event intentional and reproducible.
- The same interaction can be covered by Playwright E2E and by the MCP sidecar verifier.

Alternative considered:
- Auto-fetching on page load. Rejected because it couples verification to initial page timing and makes network capture less explicit.

### 2. Treat the sidecar script as the repo-owned verification path

The supported automated observability workflow should be the `mcp-server-playwright` sidecar path, not Codex-native MCP calls. The sidecar script should produce a structured summary and return a non-zero exit code when required assertions fail.

Rationale:
- The repo can directly own and invoke the sidecar process.
- Codex-native MCP availability depends on global client configuration and environment-specific transport behavior.

Alternative considered:
- Making Codex-native MCP the only supported verification path. Rejected because the repo cannot reliably automate or validate that path across environments.

### 3. Separate readiness from verification

`pnpm activate` should remain a readiness workflow, while MCP observability should gain its own verification command surface. Readiness answers "can I likely run the loop"; verification answers "did the observability assertions actually pass".

Rationale:
- This keeps activation fast and understandable.
- It avoids implying that global MCP observability has already been proven when only prerequisites were checked.

Alternative considered:
- Folding full MCP verification into activation. Rejected because it makes activation heavier and conflates setup with end-to-end proof.

### 4. Standardize verifier outcomes

The sidecar verification path should distinguish at least these failure classes:
- configuration missing
- MCP/tool execution failure
- assertion failure

Rationale:
- Maintainers need failure categories that map to concrete next actions.
- This reduces ambiguity in docs and makes the command more automation-friendly.

## Risks / Trade-offs

- [MCP server version skew] → The sidecar may still behave differently across `mcp-server-playwright` versions; mitigate by documenting the supported path and surfacing tool-level failures clearly.
- [Extra UI surface] → Adding a network probe slightly expands `/dev-loop`; mitigate by keeping it explicitly demo-only and deterministic.
- [False confidence in Codex-native MCP] → Users may still assume the repo validates Codex-native browser tools; mitigate by documenting that the sidecar path is the supported verifier and Codex-native MCP remains an environment-specific integration.
- [Verification overlap] → Playwright E2E and MCP sidecar checks will overlap on some signals; mitigate by using Playwright for app behavior and MCP verification for observability-specific assertions.
