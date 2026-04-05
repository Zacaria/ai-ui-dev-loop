## Context

The repo already has lint and Playwright E2E scripts but no CI. GitHub Actions is the expected CI system for public repos and should run on PRs and pushes. Playwright tests require browser binaries and a web server; lint only needs Node/pnpm.

## Goals / Non-Goals

**Goals:**
- Run `pnpm lint` and `pnpm -C apps/web e2e` on pull requests and pushes to the default branch.
- Use consistent Node/pnpm versions and caching to keep CI fast.
- Install Playwright browser dependencies needed for headless tests.

**Non-Goals:**
- Deployments or release automation.
- Running MCP demo automation in CI.
- Multi-OS or matrix coverage beyond a single Linux runner.

## Decisions

- **Use GitHub Actions with a single workflow** targeting `ubuntu-latest`.
  - *Alternative:* Multi-OS matrix. Rejected to keep CI simple and fast.
- **Use `actions/setup-node` + pnpm setup** with cache enabled.
  - *Alternative:* Manual cache steps. Rejected for maintainability.
- **Install Playwright browser dependencies via `playwright install --with-deps`** in CI.
  - *Alternative:* Pre-baked containers. Rejected due to repo simplicity.

## Risks / Trade-offs

- **Risk:** Playwright downloads increase CI time. → **Mitigation:** Use caching and keep a single browser (Chromium).
- **Risk:** Port conflicts in CI. → **Mitigation:** Let Playwright webServer manage the port as configured.
- **Risk:** Tests are flaky on CI. → **Mitigation:** Keep single worker and deterministic tests.
