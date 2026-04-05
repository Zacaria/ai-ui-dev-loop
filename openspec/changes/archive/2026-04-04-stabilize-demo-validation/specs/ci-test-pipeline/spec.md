## ADDED Requirements

### Requirement: Production build step
The CI workflow SHALL run `pnpm build` and fail the job on build errors.

#### Scenario: Workflow validates the production build
- **WHEN** the workflow reaches the production build step
- **THEN** it executes the repository build command before completing the validation job

#### Scenario: Build failures stop CI
- **WHEN** the production build command exits with an error
- **THEN** the workflow job fails
