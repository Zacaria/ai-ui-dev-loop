## ADDED Requirements

### Requirement: Next.js + shadcn template app
The repository SHALL provide a Next.js web app at `apps/web` using App Router, TypeScript, Tailwind CSS, and shadcn/ui.

#### Scenario: Developer starts the template
- **GIVEN** dependencies are installed via `pnpm`
- **WHEN** the developer runs the web dev server
- **THEN** the app loads in a browser without errors

### Requirement: Theme toggle
The web app SHALL provide a theme toggle that switches between light and dark themes using shadcn/ui-compatible tokens (CSS variables).

#### Scenario: Switching themes updates UI
- **GIVEN** the app is open
- **WHEN** the user toggles the theme
- **THEN** visible UI colors change to the selected theme
