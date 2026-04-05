# Design: Next.js + shadcn template with AI browser feedback loop

## Overview
This change creates a small, reproducible environment for AI-assisted UI work:
1) A clean Next.js + shadcn baseline app (`apps/web`).
2) A purpose-built “dev loop” page that exposes deterministic UI elements for automation and inspection.
3) A documented Playwright MCP setup for Codex to autonomously navigate, interact, and read browser signals (console/network/style).

The goal is a tight loop: make a UI change → run/refresh → have automation verify interactions + console output + key visual invariants.

## Repo Layout
- `apps/web`: Next.js App Router app (TypeScript + Tailwind).
- `knowledge/`: human-readable docs for the browser feedback loop, including a “known issues / troubleshooting” section.

## UI Baseline (shadcn/ui)
- Use default shadcn init (Tailwind + CSS variables) and include `next-themes`.
- Provide a theme toggle component in the app shell so the automation can validate both themes.

## “Dev Loop” Page
Add a dedicated page (e.g. `/dev-loop`) with:
- A small set of shadcn components (button, input, dialog, toast) with stable accessible labels.
- A “log” action that emits `console.log`, `console.warn`, and an intentional handled error to demonstrate console capture.
- A color/tokens section that renders swatches for key CSS variables (background/foreground/primary/etc.) so automation can assert computed styles.

This page is intentionally deterministic and is treated like a test fixture.

## Automation Strategy
Two layers:
1) **Playwright E2E** inside the repo to validate the dev loop without Codex.
2) **Codex + Playwright MCP** to demonstrate autonomous browser control and observability:
   - Navigate to the dev server URL
   - Perform interactions
   - Retrieve console messages
   - Read computed styles/colors

If the MCP integration is unreliable in some environments, documentation SHOULD include a fallback “sidecar” approach (directly talking to the Playwright MCP server), but we will optimize for the user’s currently working Codex configuration.

## Documentation
Document:
- Prereqs (Node/pnpm, Chrome extension if used).
- The current working Codex MCP Playwright configuration steps (commands to add/verify the server, restart guidance).
- How to run the local dev server and run the automated demo checks.

## Trade-offs / Notes
- Repository-local MCP configuration may not be supported by Codex today; documentation will reflect that and rely on the user’s existing global MCP configuration.
- The dev loop page is a deliberate “testing surface” to make autonomous inspection reproducible and stable.
