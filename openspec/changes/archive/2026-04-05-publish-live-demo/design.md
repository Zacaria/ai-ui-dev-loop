## Context

The repo now supports a local activation flow and deterministic validation, but the public-facing demo path still ends at "Not available yet." The next activation gap is no longer product behavior; it is publication. The repo needs a repeatable path from local-ready to publicly reachable so a reviewer can try the asset without setting up the toolchain first.

This work has one important boundary: the repository can define deployment prerequisites, commands, verification, and documentation, but actual platform authentication and ownership must come from the user or organization account.

## Goals / Non-Goals

**Goals:**
- Define and implement the repo-owned steps needed to publish the app to a public host.
- Make the README's Live Demo section point to a real deployment once publication is complete.
- Ensure deployment verification includes both application reachability and the expected `/dev-loop` target.
- Keep the deployment workflow repeatable for future updates.

**Non-Goals:**
- Build a multi-environment release system.
- Replace the current app hosting stack.
- Hide platform authentication requirements behind unclear automation.
- Expand the demo surface beyond what is needed for public access.

## Decisions

### 1. Treat live-demo publication as a tracked workflow
Publication should be expressed as a repo workflow with explicit prerequisites, deployment steps, and verification steps rather than an informal one-off deployment.

Rationale:
- This makes the live demo maintainable after the first publish.
- It turns the deployment into part of the project asset, not just a temporary hosting event.

### 2. Separate repo-owned setup from platform-owned auth
The repo can own deployment commands, documentation, and health verification. Platform authentication, team selection, and project ownership must remain explicit external prerequisites.

Rationale:
- This is the same boundary already established for Codex MCP configuration.
- It keeps the repo portable across environments and accounts.

### 3. Verify public deployment through concrete URLs
The public publication flow should validate at least:
- the main site URL
- the `/dev-loop` path
- the health endpoint

Rationale:
- A "successful deployment" is not enough if the deterministic loop surface is broken publicly.
- These checks are the minimum required to claim the asset is activable by an external reviewer.

## Risks / Trade-offs

- [Platform auth blocker] → The repo cannot self-complete publication without access to a hosting account; mitigate by surfacing auth as the first prerequisite.
- [Public/demo drift] → The deployed asset can lag behind the repo; mitigate by documenting a repeatable redeploy path and verification checklist.
- [Operational overhead] → A live demo introduces maintenance expectations; mitigate by keeping the deployment flow minimal and tied to the existing validation path.
