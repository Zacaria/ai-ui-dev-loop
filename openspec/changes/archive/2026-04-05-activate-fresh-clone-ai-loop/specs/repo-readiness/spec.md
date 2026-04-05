## MODIFIED Requirements

### Requirement: Documented demo workflow
The documentation SHALL describe the dev loop demo flow, including the URL to open, the command(s) to run locally, and the first-run activation path for prerequisite verification.

#### Scenario: Developer follows the demo steps
- **WHEN** a developer follows the documented demo flow
- **THEN** they can open the app at the documented URL and trigger the dev loop successfully

#### Scenario: First-time user follows the activation path
- **WHEN** a first-time user follows the documented activation path from the repository root
- **THEN** they can determine whether the app, Playwright tooling, and MCP/browser integration are ready on their machine without guessing the next step
