## ADDED Requirements

### Requirement: Static GitHub Pages explainer
The repository SHALL include a static GitHub Pages site that explains the project purpose, value, and supported usage paths.

#### Scenario: Visitor opens the explainer page
- **WHEN** a visitor lands on the GitHub Pages site
- **THEN** they can understand what the project is, why it exists, and where to go next

### Requirement: Explainer links to core entrypoints
The GitHub Pages site SHALL link to the live demo, the repository, and the supported local activation and verification paths.

#### Scenario: Visitor wants to try the project
- **WHEN** a visitor reads the explainer page
- **THEN** they can find the live demo URL, the repository URL, and the key local commands needed to use the project

### Requirement: Pages publishing workflow
The repository SHALL provide a GitHub Actions workflow that publishes the static explainer page through GitHub Pages.

#### Scenario: Maintainer pushes updates to the default branch
- **WHEN** the GitHub Pages workflow runs successfully
- **THEN** the tracked static site content is published through GitHub Pages

### Requirement: Explicit Pages activation prerequisite
The repository SHALL document any repository-level GitHub Pages setting that must be enabled outside the codebase.

#### Scenario: Pages workflow is configured but the repository is not activated
- **WHEN** a maintainer needs to complete GitHub Pages setup
- **THEN** the docs identify the exact external GitHub setting required to finish activation
