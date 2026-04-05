# AI Browser Feedback Loop

## Purpose

Define the deterministic dev loop surface and browser observability needed for automated feedback.

## Requirements

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

### Requirement: Console and UI event observability
The dev loop page SHALL expose interactions that emit browser console messages suitable for automated verification.

#### Scenario: Capturing console output
- **GIVEN** an automation agent is connected to the browser
- **WHEN** it triggers the dev loop page “console signals” actions
- **THEN** it can retrieve the emitted console messages and validate severity and text

### Requirement: UI color/token inspection
The dev loop page SHALL expose a way to inspect computed UI colors (derived from CSS variables/tokens) for automated checks.

#### Scenario: Reading computed colors
- **GIVEN** the dev loop page is loaded
- **WHEN** an automation agent evaluates computed styles for the token swatches
- **THEN** it can read the computed color values in a standard format (e.g. `rgb(...)` or `hsl(...)`)

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
