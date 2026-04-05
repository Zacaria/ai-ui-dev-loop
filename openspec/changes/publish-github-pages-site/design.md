## Context

The repo already has two public surfaces:

- the source repository itself
- the Vercel-hosted live demo

What is still missing is a public explainer page designed for first contact. README is repo-centric and assumes a code host context; the Vercel app is product-centric and assumes the visitor already knows why the repo exists. GitHub Pages is a good fit for a stable, low-maintenance explainer because it can ship directly from tracked static files.

## Goals / Non-Goals

**Goals:**
- Publish a static GitHub Pages site from this repository.
- Explain what the project is, why it matters, and how to use it.
- Link clearly to the Vercel live demo, repo docs, and local commands.
- Keep the publishing path lightweight and independent of the app runtime.

**Non-Goals:**
- Build a second application framework or duplicate the full Next.js app.
- Replace the README or Vercel demo as primary technical references.
- Add a CMS, search system, or dynamic content pipeline.
- Introduce a design system separate from the repo's existing visual language.

## Decisions

### 1. Use a static site in `docs/`

The GitHub Pages site should be plain static assets in `docs/` so it can be published directly by GitHub Actions without a build step.

Rationale:
- Minimal operational overhead.
- Easy to review and maintain inside the repo.
- Works well with the existing `docs/assets/` screenshot content.

Alternative considered:
- Generating Pages output from the Next.js app. Rejected because it introduces app/runtime coupling and unnecessary deployment complexity.

### 2. Position the site as an explainer, not a duplicate docs portal

The GitHub Pages site should answer:
- what this repo is
- why an AI-assisted UI dev loop is useful
- how to try it locally or via the live demo

Detailed troubleshooting and implementation docs should remain in README and `knowledge/`.

Rationale:
- Keeps the site concise and useful for first-time visitors.
- Avoids creating a second documentation source that can drift.

### 3. Deploy through a dedicated Pages workflow

Publishing should use a dedicated `pages.yml` workflow with GitHub's Pages actions and the `docs/` directory as the artifact source.

Rationale:
- Matches GitHub's recommended Pages deployment path.
- Keeps CI and Pages concerns separate.

### 4. Make the remaining external step explicit

The repo can include the workflow and static site, but if the GitHub repository has not yet enabled Pages via GitHub Actions, that repository setting remains an external requirement.

Rationale:
- The local repo cannot mutate repository settings.
- This keeps the boundary between repo-owned configuration and account-owned activation clear.

## Risks / Trade-offs

- [Content drift] → The explainer page could diverge from README; mitigate by keeping it concise and linking back to the canonical docs.
- [Double maintenance] → Adding a second public surface creates upkeep; mitigate by limiting scope to high-level presentation and stable commands.
- [Pages not enabled in repo settings] → The workflow may need a one-time repository setting change; mitigate by documenting the exact action required.
- [Static-site limitation] → No dynamic previews or interactive widgets; mitigate by linking prominently to the Vercel live demo for actual interaction.
