## 1. Dev-loop observability surface

- [x] 1.1 Add a deterministic network-probe interaction to `/dev-loop` that targets the health endpoint and exposes the latest result in the UI.
- [x] 1.2 Extend Playwright E2E coverage so the dev-loop test validates the network probe alongside existing interaction and color checks.

## 2. MCP sidecar verification workflow

- [x] 2.1 Refactor `apps/web/scripts/mcp-dev-loop.mjs` into a verifier that asserts console, network, and computed-style expectations instead of only printing raw results.
- [x] 2.2 Add a clear root-level command surface for MCP observability verification and ensure the verifier returns structured output with distinct failure categories.

## 3. Documentation and readiness guidance

- [x] 3.1 Update README and `knowledge/` docs to describe the supported MCP verification path, prerequisites, and failure boundaries.
- [x] 3.2 Validate the new workflow where the environment allows it and align the change artifacts with the final command/documentation names.
