# Repo Readiness

## Purpose

Define the documentation and repo hygiene expectations for a public-facing demo project.

## Requirements

### Requirement: Public-facing README structure
The repository README SHALL include a concise, public-facing structure with an overview, quickstart, demo flow, validation, and links to deeper docs.

#### Scenario: Reviewer opens README
- **WHEN** a reviewer lands on the README
- **THEN** they can identify the project purpose, how to run it, and where to learn more within the first screen of content

### Requirement: Documented demo workflow
The documentation SHALL describe the dev loop demo flow, including the URL to open, the command(s) to run locally, and the first-run activation path for prerequisite verification.

#### Scenario: Developer follows the demo steps
- **WHEN** a developer follows the documented demo flow
- **THEN** they can open the app at the documented URL and trigger the dev loop successfully

#### Scenario: First-time user follows the activation path
- **WHEN** a first-time user follows the documented activation path from the repository root
- **THEN** they can determine whether the app, Playwright tooling, and MCP/browser integration are ready on their machine without guessing the next step

### Requirement: Project signals section
The README SHALL include a “Project signals” section stating project status, prerequisites, supported platforms, and known limitations.

#### Scenario: Reviewer checks project signals
- **WHEN** a reviewer reads the Project signals section
- **THEN** they can understand the expected environment and any caveats without scanning other docs

### Requirement: Community health files
The repository SHALL include standard community health files: LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, and CHANGELOG (or release notes equivalent).

#### Scenario: Reviewer inspects repo root
- **WHEN** a reviewer checks the repository root
- **THEN** they can find the community health files with clear guidance

### Requirement: Doc links to deeper references
The README SHALL link to existing technical references (e.g., `knowledge/` docs) for troubleshooting and advanced setup.

#### Scenario: User needs troubleshooting guidance
- **WHEN** a user needs more detail than the README provides
- **THEN** they can follow a link to the appropriate reference document

### Requirement: README badges
The README SHALL include a badges row that at minimum displays the project license and runtime/tooling versions.

#### Scenario: Reviewer scans badges
- **WHEN** a reviewer looks at the top of the README
- **THEN** they can identify the license and expected runtime/tooling versions from badges

### Requirement: Demo media asset
The README SHALL embed a demo GIF or screenshot that lives in the repository.

#### Scenario: Reviewer evaluates the demo
- **WHEN** a reviewer views the README
- **THEN** they can see a visual demo of the UI without running the project

### Requirement: Live demo link section
The README SHALL include a Live Demo section that provides a URL or states that a live demo is not yet available, and once the demo is published it SHALL point to the public deployment and verification path.

#### Scenario: Reviewer looks for a live demo
- **WHEN** a reviewer checks the Live Demo section
- **THEN** they can determine whether a live demo is available and where to access it

#### Scenario: Reviewer opens a published live demo
- **WHEN** the live demo has been published
- **THEN** the README provides the public URL and enough context to understand which routes or checks represent a healthy deployment

### Requirement: Repo layout overview
The README SHALL include a brief repo layout section with a tree or diagram explaining key folders.

#### Scenario: Reviewer wants to understand structure
- **WHEN** a reviewer scans the repo layout section
- **THEN** they can identify the main app location and supporting docs

### Requirement: GitHub templates
The repository SHALL include issue templates and a pull request template under `.github/`.

#### Scenario: Contributor opens a new issue or PR
- **WHEN** a contributor starts a new issue or pull request
- **THEN** they are guided by the repository templates

### Requirement: Repo metadata consistency files
The repository SHALL include `.editorconfig` and a runtime/tooling version pin file (e.g., `.nvmrc` or `.tool-versions`).

#### Scenario: Developer sets up tooling
- **WHEN** a developer prepares their environment
- **THEN** they can align editor settings and runtime versions from the repo files

### Requirement: Automated README asset generation
The repository SHALL include a script or command that can generate README demo media and the repo layout section without manual editing.

#### Scenario: Maintainer refreshes README assets
- **WHEN** a maintainer runs the documented asset generation command
- **THEN** the demo media and repo layout assets are regenerated and ready to embed in README

### Requirement: Validation documentation consistency
The README SHALL document validation commands that match the repository's supported scripts and CI coverage, and it SHALL distinguish the repo-owned MCP observability verification path from the standard lint, build, and Playwright validation flow.

#### Scenario: Reviewer checks validation guidance
- **WHEN** a reviewer reads the README validation section
- **THEN** the listed commands correspond to the validation flow maintained by the repository

#### Scenario: Maintainer checks MCP verification guidance
- **WHEN** a maintainer looks for the supported MCP/browser observability workflow
- **THEN** the docs identify the repo-owned verification command, the required prerequisites, and the boundary between sidecar verification and Codex-native MCP usage

### Requirement: Generated repo metadata accuracy
Generated repo layout content SHALL reflect the tracked repository structure after regeneration.

#### Scenario: Maintainer refreshes generated repo layout content
- **WHEN** a maintainer runs the documented repo layout generation command
- **THEN** the generated output matches the current tracked repository structure and is ready to embed in the README
