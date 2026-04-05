## ADDED Requirements

### Requirement: Deterministic dev loop page
The system SHALL provide a deterministic page intended for automation and inspection (e.g. `/dev-loop`) containing stable, accessible UI elements.

#### Scenario: Automation can reliably identify UI elements
- **GIVEN** the dev loop page is loaded
- **WHEN** an automation agent queries elements by role and accessible name
- **THEN** it can find and interact with the page’s primary controls

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
