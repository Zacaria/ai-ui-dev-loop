# Change: Add Next.js + shadcn template with AI browser dev loop

## Why
We want a minimal template project that demonstrates an AI-assisted UI development loop end-to-end: build a modern UI app, then use browser automation (Playwright + Playwright MCP via Codex) to iterate by observing UI behavior, console output, and visual styling (colors/tokens).

## What Changes
- Scaffold a Next.js app at `apps/web` using App Router, TypeScript, Tailwind, and `pnpm`.
- Add shadcn/ui with a theme toggle (light/dark) and a small “dev loop” page designed for automation and inspection.
- Add Playwright automation (tests and/or scripts) that exercises the dev loop page and captures:
  - UI interactions (clicks, typing, navigation)
  - browser console events
  - computed UI colors (CSS variables / token usage)
- Document the working Codex + Playwright MCP setup and troubleshooting (based on `knowledge/browser-feedback-loop.md`), including how to verify connectivity and how to run the demo loop.

## Impact
- Affected specs (new capabilities):
  - `web-ui-template`
  - `ai-browser-feedback-loop`
- Affected code areas (during apply stage):
  - `apps/web/*` (Next.js app)
  - `knowledge/*` or `docs/*` (setup + walkthrough)
  - Playwright configuration/tests under `apps/web/*`

## Non-Goals
- Building a real product feature set (this is a template + demo loop).
- Supporting multiple app frameworks; the baseline is Next.js App Router.
