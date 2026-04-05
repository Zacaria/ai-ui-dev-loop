## MODIFIED Requirements

### Requirement: Deterministic local automation startup
The system SHALL provide a deterministic local server configuration for dev loop automation using an explicit loopback host and known port, and it SHALL provide a readiness path for MCP-driven or sidecar-driven browser usage.

#### Scenario: Playwright starts the local app server
- **WHEN** local automation starts the app for E2E or MCP-driven inspection
- **THEN** the server binds to an explicit loopback host and expected port that matches the automation configuration

#### Scenario: Documentation and automation share one base URL
- **WHEN** a developer follows the documented dev loop flow or runs the Playwright suite
- **THEN** both target the same local base URL without relying on implicit framework defaults

#### Scenario: User checks browser-loop readiness
- **WHEN** a user runs the documented readiness or activation flow for browser automation
- **THEN** the repo reports whether Codex-native MCP usage is ready, whether the sidecar path is ready, or what prerequisite is still missing
