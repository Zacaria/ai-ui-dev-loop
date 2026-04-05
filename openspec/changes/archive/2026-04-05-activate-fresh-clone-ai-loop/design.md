## Context

The repo now succeeds at its local app and validation responsibilities, but its highest-level promise is still not turnkey: "AI-assisted UI development loop" currently requires global MCP configuration, Playwright/browser availability, and manual interpretation of several docs. The repository cannot fully control external Codex configuration, so the design needs to separate what the repo can own from what it can only detect and explain.

This change cuts across root commands, scripts, onboarding docs, and browser-loop requirements. It is not a new product feature; it is an activation layer that turns the existing demo into a predictable first-run experience.

## Goals / Non-Goals

**Goals:**
- Give a fresh-clone user one clear entrypoint to bootstrap and verify the local loop.
- Provide an explicit readiness report for app startup, Playwright browser availability, MCP server availability, and known fallback paths.
- Reduce setup ambiguity by converging docs and commands on one activation flow.
- Make failure states actionable by reporting what is missing and what to do next.

**Non-Goals:**
- Automatically mutate a user’s global Codex MCP configuration.
- Guarantee success for every external MCP client/version combination.
- Replace the existing dev loop page or test surface.
- Introduce hosted infrastructure as part of activation.

## Decisions

### 1. Activation must be repo-owned, not environment-assumed
The repo will provide a first-class activation command that runs checks the repo can own directly: dependency installation status, app startability, Playwright browser readiness, and dev-loop reachability. MCP/Codex integration will be verified through explicit detection and clear reporting, not by assuming it already works.

Rationale:
- The repo can reliably check local files, commands, and HTTP reachability.
- Global Codex configuration is outside the repo’s control.
- A readiness report is more honest and more debuggable than implicit assumptions.

Alternatives considered:
- Keep setup as pure documentation.
  - Rejected because it leaves users to discover missing prerequisites manually.
- Attempt to auto-write global MCP config.
  - Rejected because it exceeds the repo’s authority and portability.

### 2. Provide graded readiness states, not binary success/failure
The activation flow should distinguish between:
- app-ready
- playwright-ready
- mcp-ready
- fallback-ready (sidecar path available)

Rationale:
- The mission can still partially succeed even when Codex-native MCP calls are unavailable.
- Users need to know whether they can proceed with the sidecar flow or need deeper environment work.

### 3. Keep the activation entrypoint simple and root-level
The repo should expose a small set of root-level commands, likely one bootstrap-oriented command and one verification-oriented command, rather than scattering first-run steps across `apps/web` and `knowledge/`.

Rationale:
- Fresh-clone users should not need to know internal repo structure before they can start.
- Root-level entrypoints align with the project’s role as a template.

### 4. Make docs report expected checkpoints
The onboarding path should tell the user what success looks like at each stage: app URL reachable, Playwright installed, MCP server detected, sidecar script usable, and which next command to run.

Rationale:
- A checklist with concrete success states reduces setup churn.
- This lets the repo serve as both demo and diagnostic tool.

## Risks / Trade-offs

- [False confidence from partial readiness] → Users may treat "fallback-ready" as fully activated; mitigate by naming readiness states clearly and documenting their limits.
- [Environment fragmentation] → MCP and browser tooling vary across machines; mitigate by reporting detected state instead of hardcoding a narrow environment assumption.
- [More scripts to maintain] → Activation helpers add maintenance surface; mitigate by keeping them thin wrappers around existing commands and checks.
- [Doc drift] → Activation commands and docs can diverge over time; mitigate by making docs point to the same root-level commands used in verification.
