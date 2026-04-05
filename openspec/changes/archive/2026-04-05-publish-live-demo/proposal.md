## Why

The repo now supports a verified local activation flow, but it still lacks the public surface that turns a demo project into an activable asset. Without a live URL, reviewers cannot experience the core loop immediately, and the README's "Not available yet" live-demo state remains the clearest gap between internal readiness and external usability.

## What Changes

- Add a tracked publication workflow for deploying the app to a public preview or production host.
- Define the repo-owned deployment prerequisites, including platform authentication, project linkage, and expected health checks.
- Update the README so the Live Demo section can point to a real URL once deployment is established.
- Add the minimal repo scaffolding or documentation needed to make repeatable public deployment straightforward.

## Capabilities

### New Capabilities
- `live-demo-publication`: A repeatable workflow for publishing and verifying a public live demo of the dev-loop app.

### Modified Capabilities
- `repo-readiness`: The repo readiness contract must cover how a reviewer discovers and verifies the public live demo once it exists.

## Impact

- Deployment-related config or docs at the repo root.
- README updates for live-demo publication and verification.
- Optional Vercel or platform-specific project linkage and deployment verification steps.
