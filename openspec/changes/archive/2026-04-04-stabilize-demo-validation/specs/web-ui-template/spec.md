## MODIFIED Requirements

### Requirement: Next.js + shadcn template app
The repository SHALL provide a Next.js web app at `apps/web` using App Router, TypeScript, Tailwind CSS, and shadcn/ui, and the app SHALL support production builds without requiring external network font downloads.

#### Scenario: Developer starts the template
- **GIVEN** dependencies are installed via `pnpm`
- **WHEN** the developer runs the web dev server
- **THEN** the app loads in a browser without errors

#### Scenario: Developer builds in a restricted environment
- **GIVEN** dependencies are installed and external font providers are unavailable
- **WHEN** the developer runs the production build
- **THEN** the build completes successfully using offline-safe typography assets or system-backed font configuration
