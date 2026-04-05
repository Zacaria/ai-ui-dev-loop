# Project Context

## Purpose
Provide a minimal, well-documented template for an AI-assisted UI development loop:
- Next.js (App Router) + TypeScript + Tailwind
- shadcn/ui components + theme toggle
- Playwright automation + Playwright MCP (via Codex) to inspect UI, capture console/network events, and interact with the browser autonomously

## Tech Stack
- Next.js (App Router), React, TypeScript
- Tailwind CSS, shadcn/ui, next-themes
- Playwright (tests + MCP-driven automation)
- pnpm workspaces

## Project Conventions

### Code Style
- Prefer straightforward, minimal implementations first; add complexity only when required.
- Keep changes tightly scoped to user-visible outcomes.
- Use TypeScript and follow existing framework defaults (Next.js App Router patterns).

### Architecture Patterns
- Monorepo layout with the web app in `apps/web`.
- App Router pages/components colocated under `apps/web/app`.
- Use shadcn/ui for UI primitives and `next-themes` for theme switching.

### Testing Strategy
- Playwright E2E tests for user flows and UI behavior.
- Provide a reproducible “dev loop” walkthrough that demonstrates browser automation, console capture, and UI color inspection.

### Git Workflow
- Not specified (template repo); keep changes in small, reviewable increments.

## Domain Context
- This repo is intentionally “demo-first”: it exists to showcase an AI-assisted UI dev loop more than a specific product domain.

## Important Constraints
- Codex runs with restricted network access in some environments; dependency installs and downloads may require explicit approval.
- The Playwright MCP configuration is expected to be provided via the user’s existing Codex MCP setup (documented in-repo); repository-local MCP config may not be supported.

## External Dependencies
- Optional: Chrome + “Playwright MCP Bridge” extension for connecting the Playwright MCP server to a real browser session.
