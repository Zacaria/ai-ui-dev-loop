# Tasks: Add Next.js + shadcn template with AI browser dev loop

## 1. Scaffold app (apps/web)
- [x] Create a `pnpm-workspace.yaml` and root `package.json` appropriate for a single app at `apps/web`.
- [x] Scaffold Next.js App Router app at `apps/web` (TypeScript + Tailwind).
- [x] Add basic repo docs (`README.md`) describing how to install, run, and test.

## 2. Add shadcn/ui + theme toggle
- [x] Initialize shadcn/ui in `apps/web` using the default preset (Tailwind + CSS vars).
- [x] Add `next-themes` provider and a theme toggle component.
- [x] Ensure the app renders correctly in both light and dark themes.

## 3. Add “dev loop” page (deterministic UI surface)
- [x] Add a `/dev-loop` page containing stable, accessible UI elements for automation (button, input, dialog/toast).
- [x] Add a “console signals” section that produces `console.log`/`warn` and a handled error.
- [x] Add a “colors/tokens” section that renders swatches and exposes computed CSS values for automation assertions.

## 4. Add Playwright automation (repo-local)
- [x] Add Playwright to `apps/web` and configure it to run against the local dev server.
- [x] Add a smoke test that:
  - [x] navigates to `/dev-loop`
  - [x] performs UI interactions
  - [x] asserts console messages are captured
  - [x] reads computed colors for a small set of tokens and asserts they match expected format (e.g. `rgb(...)`/`hsl(...)`)

## 5. Document Codex + Playwright MCP configuration (working setup)
- [x] Create `knowledge/codex-playwright-mcp.md` documenting:
  - [x] the working Codex MCP server config (how to add/check)
  - [x] how to connect via the Playwright MCP Bridge (if applicable)
  - [x] how to use Codex Playwright MCP tools to navigate/click/read console
  - [x] troubleshooting notes (adapted from `knowledge/browser-feedback-loop.md`)

## 6. Validation
- [ ] Run `openspec validate add-nextjs-shadcn-ai-dev-loop --strict --no-interactive`.
- [x] In apply stage, verify:
  - [x] `pnpm -C apps/web dev` starts
  - [x] `pnpm -C apps/web lint` passes (if configured)
  - [x] `pnpm -C apps/web test` / `pnpm -C apps/web playwright test` passes
