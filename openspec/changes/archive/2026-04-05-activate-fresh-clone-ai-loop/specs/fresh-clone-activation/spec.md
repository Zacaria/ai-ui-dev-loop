## ADDED Requirements

### Requirement: Root activation entrypoint
The repository SHALL provide a root-level activation entrypoint that guides a user from fresh clone to a verified local dev-loop setup.

#### Scenario: User starts from a fresh clone
- **WHEN** a user follows the documented activation command from the repository root
- **THEN** the repository runs the setup and verification steps needed to determine whether the local loop can start successfully

### Requirement: Readiness report
The activation flow SHALL report distinct readiness states for app startup, Playwright/browser automation, and MCP-driven usage.

#### Scenario: Activation succeeds partially
- **WHEN** some activation prerequisites are available but MCP-driven usage is not fully ready
- **THEN** the repository reports the working states, the missing states, and the supported fallback path

#### Scenario: Activation detects missing prerequisites
- **WHEN** a required local prerequisite is unavailable
- **THEN** the repository reports what is missing and the next action needed to continue

### Requirement: Deterministic success checkpoints
The activation flow SHALL verify the deterministic `/dev-loop` target and report the expected local URL and next commands.

#### Scenario: Activation verifies the local target
- **WHEN** the local activation flow completes its checks
- **THEN** it confirms whether `http://127.0.0.1:3000/dev-loop` is reachable and tells the user what to run next
