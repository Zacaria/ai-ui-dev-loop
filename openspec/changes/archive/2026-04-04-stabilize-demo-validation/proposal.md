## Why

The repo already has the intended demo surface, but its validation story is not yet reproducible enough for a public template. The production build currently depends on external font fetches, browser automation startup is sensitive to host binding assumptions, and generated docs can drift from the tracked repo state.

## What Changes

- Replace the current font setup with an offline-safe approach so the web app can build in restricted environments.
- Make local app startup for automation explicit and deterministic, including loopback host and port assumptions used by Playwright.
- Expand validation so the repo checks the production build path in addition to lint and E2E coverage.
- Refresh generated repo metadata and README guidance so the documented validation flow matches the tracked project state.

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `web-ui-template`: The template app must build successfully without requiring external font downloads during production builds.
- `ai-browser-feedback-loop`: The dev loop automation flow must start against a deterministic local server configuration that works in constrained environments.
- `ci-test-pipeline`: CI must validate the production build path in addition to existing lint and E2E checks.
- `repo-readiness`: Generated repo layout and validation documentation must stay aligned with the actual tracked files and supported commands.

## Impact

- Affected code under `apps/web/` for font configuration, app startup, and Playwright configuration.
- Root scripts and CI workflow updates under `package.json`, `.github/workflows/`, and related validation commands.
- Documentation and generated assets under `README.md`, `docs/`, and supporting scripts.
