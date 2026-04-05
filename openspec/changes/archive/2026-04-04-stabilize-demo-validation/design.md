## Context

The current repo already satisfies the intended demo surface: a Next.js app with a deterministic `/dev-loop` page, theme switching, Playwright E2E coverage, and public-facing documentation. The remaining gaps are operational rather than product-level: the production build fails when font assets cannot be fetched from Google, Playwright startup relies on server defaults that do not hold in restricted environments, and generated documentation can drift from the tracked repository state.

This change touches multiple parts of the repo at once: app shell typography, Playwright server startup, CI validation, and generated docs. That makes the implementation cross-cutting enough to benefit from an explicit design before coding.

## Goals / Non-Goals

**Goals:**
- Make `pnpm build` succeed without requiring external network access for fonts.
- Make Playwright's local server startup deterministic by binding to an explicit loopback host and expected port.
- Ensure CI and local validation cover the production build path so regressions are caught before merge.
- Bring generated repo metadata and README validation guidance back into sync with the actual repository state.

**Non-Goals:**
- Redesign the UI or expand the dev loop feature surface.
- Replace Playwright with a different test runner or browser automation model.
- Introduce deployment infrastructure or a public demo host.

## Decisions

### 1. Use an offline-safe font strategy
The app will stop relying on `next/font/google` for runtime build success. The preferred implementation is to move to a local or system-backed font stack that preserves the existing CSS-variable pattern without requiring outbound network fetches during `next build`.

Rationale:
- This directly addresses the current build failure mode in restricted environments.
- It avoids hiding a known reproducibility problem behind CI-only network access.
- It keeps the app lightweight and suitable for a template repo.

Alternatives considered:
- Vendor local Geist font files and use `next/font/local`.
  - Pros: preserves the current typeface.
  - Cons: adds binary assets and maintenance overhead to a minimal template.
- Keep `next/font/google` and document that network access is required.
  - Rejected because it leaves the build path non-reproducible.

### 2. Make automation server binding explicit
The Playwright `webServer` command will explicitly bind the app to `127.0.0.1` on a known port rather than relying on framework defaults. The same host/port expectations should be reflected in docs and any related scripts.

Rationale:
- The current failure mode came from binding assumptions, not the test logic itself.
- A loopback-only host is better aligned with local automation and sandboxed environments.
- Explicit config makes failures easier to reason about than implicit defaults.

Alternatives considered:
- Continue using the default `pnpm dev` command.
  - Rejected because the default host behavior is environment-dependent.
- Switch E2E to a production server instead of dev server.
  - Deferred; useful later, but unnecessary to solve the immediate reliability issue.

### 3. Add production build validation to the normal check path
CI and the documented validation flow will include a production build check. The exact command can remain `pnpm build`, with repo-level scripts updated only if that improves clarity.

Rationale:
- The current CI would not catch the build regression that already exists.
- Build validation is low-cost and materially improves confidence in a public template.

Alternatives considered:
- Keep CI limited to lint and E2E.
  - Rejected because it misses a critical path that users will run locally.

### 4. Treat generated repo metadata as part of repo readiness
The README repo tree and any generated metadata files will be refreshed as part of this change, and the documented validation section will be updated to match the supported commands.

Rationale:
- This repo is demo-first and documentation-heavy; stale generated assets undermine trust.
- Keeping docs aligned with the tracked state makes future state reviews cheaper and clearer.

## Risks / Trade-offs

- [Typography drift] → Moving away from Google-hosted Geist may slightly change the visual appearance; mitigate by preserving CSS variables and choosing a deliberate fallback stack.
- [Environment-specific test behavior] → Explicit loopback binding may surface assumptions in scripts or docs; mitigate by updating all references together.
- [Longer CI runtime] → Adding a build step increases job duration; mitigate by keeping the change scoped and reusing existing dependency caching.
- [Docs drift recurring] → Generated files can go stale again after future edits; mitigate by documenting regeneration commands and refreshing generated assets in the same PR when structure changes.
