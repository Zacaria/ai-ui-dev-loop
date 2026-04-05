## Why

Running tests locally is not enough for a public repo. CI ensures every PR and push runs the same checks, preventing regressions and giving contributors fast feedback.

## What Changes

- Add a GitHub Actions workflow to run lint and Playwright E2E tests on pushes and pull requests.
- Configure Node/pnpm setup and caching for consistent, fast builds.
- Ensure Playwright browser dependencies are installed in CI.

## Capabilities

### New Capabilities
- `ci-test-pipeline`: Automated CI pipeline that runs lint and E2E tests for this repo on GitHub Actions.

### Modified Capabilities
- (none)

## Impact

- New workflow file under `.github/workflows/`.
- CI environment configuration (Node, pnpm, Playwright browser install).
- Optional README badge or docs note for CI status.
