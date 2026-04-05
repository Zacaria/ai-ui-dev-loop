## ADDED Requirements

### Requirement: CI triggers on PRs and default branch pushes
The system SHALL run CI checks on pull requests and on pushes to the default branch.

#### Scenario: Pull request opened
- **WHEN** a pull request targets the default branch
- **THEN** the CI workflow runs lint and E2E tests

#### Scenario: Push to default branch
- **WHEN** a commit is pushed to the default branch
- **THEN** the CI workflow runs lint and E2E tests

### Requirement: Consistent Node and pnpm setup
The CI workflow SHALL install the repository's pinned Node and pnpm versions with caching enabled.

#### Scenario: Workflow starts
- **WHEN** the workflow job starts
- **THEN** Node and pnpm are installed using the pinned versions and dependency cache is restored

### Requirement: Linting step
The CI workflow SHALL run `pnpm lint` and fail the job on lint errors.

#### Scenario: Lint failures
- **WHEN** lint errors are present
- **THEN** the workflow job fails

### Requirement: Playwright E2E step
The CI workflow SHALL install Playwright browser dependencies and run `pnpm -C apps/web e2e`.

#### Scenario: E2E tests run
- **WHEN** the workflow reaches the E2E step
- **THEN** Playwright browsers are installed and tests execute headlessly
