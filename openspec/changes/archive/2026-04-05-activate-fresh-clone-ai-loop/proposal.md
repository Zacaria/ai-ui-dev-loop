## Why

The repo now has a stable app and validation path, but the project's core promise is still not activatable from a fresh clone. A new user can run the app, but they still have to manually assemble the MCP/browser setup and interpret multiple docs before they can experience the full AI-assisted dev loop.

## What Changes

- Add a first-class activation flow that bootstraps local prerequisites, checks Playwright/browser readiness, and verifies the deterministic `/dev-loop` target.
- Add a guided MCP readiness check so users can tell whether Codex browser tooling or the sidecar MCP script will work on their machine before they start debugging manually.
- Consolidate the onboarding docs into a single "fresh clone to working loop" path with explicit success/failure checkpoints.
- Expose the activation flow through a small set of root-level commands so the repo has a clear "do this first" entrypoint.

## Capabilities

### New Capabilities
- `fresh-clone-activation`: A bootstrap and self-check workflow that takes a user from fresh clone to a verified local AI-assisted browser loop.

### Modified Capabilities
- `ai-browser-feedback-loop`: The browser feedback loop requirements must include a supported readiness path for MCP-driven usage, not just the existence of the `/dev-loop` surface.
- `repo-readiness`: The documentation must provide a single coherent activation path for first-time users, including prerequisite checks and expected outcomes.

## Impact

- Root-level task automation and verification commands, likely under `package.json`, `Justfile`, and/or `scripts/`.
- Browser automation setup helpers and self-check scripts under `apps/web/scripts/` or shared repo scripts.
- Documentation updates across `README.md` and `knowledge/` to converge on one activation path.
