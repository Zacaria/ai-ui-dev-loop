# Contributing

Thanks for your interest in contributing! This repo is designed as a clear, public-facing demo, so contributions should keep changes focused and easy to review.

## Quickstart

```bash
pnpm install
pnpm dev
```

Open `http://127.0.0.1:3000/dev-loop`.

## Useful Commands

```bash
pnpm lint
pnpm -C apps/web e2e
pnpm mcp:verify
pnpm live-demo:doctor
pnpm live-demo:deploy
pnpm live-demo:verify -- https://dev-loop-beta.vercel.app
pnpm assets:demo
pnpm assets:tree
```

## Guidelines

- Keep PRs small and scoped to a single improvement.
- Update README and docs if behavior or commands change.
- Prefer stable, deterministic UI interactions in the dev-loop page.

## Pull Requests

- Use the PR template and describe the change clearly.
- Include screenshots for UI changes when possible.
- Ensure `pnpm lint` passes before requesting review.

## CI

GitHub Actions runs lint and Playwright E2E tests on PRs and pushes to the default branch.

## Published Demo

Use `docs/live-demo-publication.md` for the tracked Vercel publication workflow and public verification checks.

Use `docs/github-pages.md` for the static GitHub Pages explainer workflow.
