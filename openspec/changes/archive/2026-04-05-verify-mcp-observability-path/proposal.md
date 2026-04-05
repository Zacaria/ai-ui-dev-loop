## Why

The repo already demonstrates local MCP-driven browser automation, but that path is still closer to a demo script than a supported verification contract. The biggest remaining gap is deterministic observability: console inspection exists, network inspection is only optional, and maintainers do not yet have a repo-owned command that clearly proves the MCP sidecar path is healthy.

## What Changes

- Strengthen the `/dev-loop` surface with an explicit, deterministic network probe action that automation can trigger and inspect.
- Turn the current sidecar MCP script into a verification workflow with machine-readable output and clear success or failure semantics.
- Document the supported observability path, including the boundary between Codex-native MCP usage and the repo-owned sidecar verification flow.
- Add a clear root-level command path for maintainers who want to verify MCP/browser observability after activation.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `ai-browser-feedback-loop`: expand the dev-loop contract to cover deterministic network observability and a repo-owned sidecar verification workflow.
- `repo-readiness`: document the supported MCP verification command and the expected observability checks alongside existing validation guidance.

## Impact

- `apps/web/app/dev-loop/*`
- `apps/web/e2e/dev-loop.spec.ts`
- `apps/web/scripts/mcp-dev-loop.mjs`
- root `package.json` and maintainers' command surface
- README and `knowledge/` troubleshooting/setup docs
