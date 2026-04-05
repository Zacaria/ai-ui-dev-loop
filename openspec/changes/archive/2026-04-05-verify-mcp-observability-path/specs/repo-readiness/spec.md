## MODIFIED Requirements

### Requirement: Validation documentation consistency
The README SHALL document validation commands that match the repository's supported scripts and CI coverage, and it SHALL distinguish the repo-owned MCP observability verification path from the standard lint, build, and Playwright validation flow.

#### Scenario: Reviewer checks validation guidance
- **WHEN** a reviewer reads the README validation section
- **THEN** the listed commands correspond to the validation flow maintained by the repository

#### Scenario: Maintainer checks MCP verification guidance
- **WHEN** a maintainer looks for the supported MCP/browser observability workflow
- **THEN** the docs identify the repo-owned verification command, the required prerequisites, and the boundary between sidecar verification and Codex-native MCP usage
