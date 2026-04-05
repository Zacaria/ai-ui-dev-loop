## ADDED Requirements

### Requirement: Validation documentation consistency
The README SHALL document validation commands that match the repository's supported scripts and CI coverage.

#### Scenario: Reviewer checks validation guidance
- **WHEN** a reviewer reads the README validation section
- **THEN** the listed commands correspond to the validation flow maintained by the repository

### Requirement: Generated repo metadata accuracy
Generated repo layout content SHALL reflect the tracked repository structure after regeneration.

#### Scenario: Maintainer refreshes generated repo layout content
- **WHEN** a maintainer runs the documented repo layout generation command
- **THEN** the generated output matches the current tracked repository structure and is ready to embed in the README
