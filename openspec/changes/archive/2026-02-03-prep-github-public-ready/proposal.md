## Why

The repo is a strong technical demo but it is not yet packaged for public review. A public-facing presentation needs clear positioning, a polished README, and predictable project hygiene so someone can evaluate it quickly without guesswork.

## What Changes

- Add a public-facing README with quickstart, highlights, and demo flow.
- Add badges, demo media (GIF/screenshot), and a live demo link to the README.
- Add repo hygiene files (license, contributing guidance, code of conduct, security contact, changelog or release notes template).
- Add GitHub issue templates and a pull request template.
- Add repo tooling files for consistency (`.editorconfig`, Node/PNPM version pin).
- Add a simple repo layout diagram or tree view in the README.
- Add automation to generate README assets (demo media and repo layout) without manual editing.
- Add a simple “project signals” section (status, requirements, supported platforms, known limitations).
- Ensure demo commands are consistent, documented, and easy to follow.

## Capabilities

### New Capabilities
- `repo-readiness`: Define the required documentation and repo hygiene artifacts for a public-facing project.

### Modified Capabilities
- (none)

## Impact

- Root docs: `README.md`, `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md` (or equivalent).
- Repo metadata: `.editorconfig`, `.nvmrc` and/or `.tool-versions`.
- GitHub templates: `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md`.
- README assets: demo GIF/screenshot, repo layout diagram (e.g. `docs/` or `public/`).
- Automation scripts/commands for asset generation (e.g. `scripts/` or `Justfile` targets).
- Developer experience docs under `knowledge/` and `openspec/` may be referenced or summarized.
- No runtime code changes expected, mostly documentation and metadata.
