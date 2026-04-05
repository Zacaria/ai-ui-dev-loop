## ADDED Requirements

### Requirement: Repeatable live-demo publication workflow
The repository SHALL define a repeatable workflow for publishing the app to a public host.

#### Scenario: Maintainer prepares to publish
- **WHEN** a maintainer follows the documented publication workflow
- **THEN** the repo provides the required deployment steps, prerequisites, and verification points needed to publish the live demo

### Requirement: Public deployment verification
The live-demo workflow SHALL verify that the public deployment exposes the expected app routes.

#### Scenario: Maintainer verifies the public deployment
- **WHEN** the live demo is published
- **THEN** the maintainer can verify the public site root, `/dev-loop`, and the health endpoint from the published deployment

### Requirement: Explicit external prerequisite reporting
The publication workflow SHALL identify platform authentication or project-linking requirements that the repository itself cannot satisfy automatically.

#### Scenario: Deployment is blocked on platform access
- **WHEN** the maintainer lacks required hosting-platform access or authentication
- **THEN** the workflow reports that missing prerequisite before deployment is attempted
