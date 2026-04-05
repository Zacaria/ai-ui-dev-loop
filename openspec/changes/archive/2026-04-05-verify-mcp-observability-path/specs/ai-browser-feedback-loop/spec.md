## MODIFIED Requirements

### Requirement: Deterministic dev loop page
The system SHALL provide a deterministic page intended for automation and inspection (e.g. `/dev-loop`) containing stable, accessible UI elements, including a deterministic network-probe interaction.

#### Scenario: Automation can reliably identify UI elements
- **GIVEN** the dev loop page is loaded
- **WHEN** an automation agent queries elements by role and accessible name
- **THEN** it can find and interact with the page’s primary controls

#### Scenario: Automation triggers a deterministic network probe
- **GIVEN** the dev loop page is loaded
- **WHEN** an automation agent triggers the documented network-probe control
- **THEN** the page performs the expected request to the health endpoint and exposes the latest probe result in the UI

## ADDED Requirements

### Requirement: Deterministic network observability
The dev loop workflow SHALL expose deterministic network activity suitable for automated verification.

#### Scenario: Inspecting network activity
- **GIVEN** an automation agent is connected to the browser
- **WHEN** it triggers the dev loop network probe
- **THEN** it can observe a request associated with the documented health-check path and verify its outcome

### Requirement: Repo-owned MCP sidecar verification
The repository SHALL provide a supported sidecar-based MCP verification workflow for browser observability.

#### Scenario: Sidecar verification succeeds
- **GIVEN** the local app is reachable and the sidecar MCP server is available
- **WHEN** a maintainer runs the documented MCP verification command
- **THEN** the command verifies required console, network, and computed-style expectations and exits successfully with structured output

#### Scenario: Sidecar verification fails clearly
- **GIVEN** the sidecar verification command cannot complete successfully
- **WHEN** the workflow exits
- **THEN** it reports whether the failure was caused by missing configuration, MCP/tool execution, or an observability assertion mismatch
