# Live Demo Publication

This repository's hosting platform for the public demo is Vercel.

The repo owns the publication workflow, verification checks, and maintainer docs. Your Vercel account still owns authentication, team access, and project linkage.

## Exact external action you may need to take

If `pnpm live-demo:doctor` reports blocked authentication or linkage, the exact first-publish actions are:

1. Authenticate Vercel.
2. If you use the Codex Vercel connector, sign in there until Vercel MCP calls stop returning `Auth required`.
3. If you use the CLI, run `vercel login`.
4. Link the app once from `apps/web` with `vercel link`.

After that, the repo-owned flow can continue.

## Repo-owned publication workflow

Run these commands from the repository root:

```bash
pnpm live-demo:doctor
pnpm live-demo:deploy
pnpm live-demo:verify -- https://<public-alias>
```

What each command does:

- `pnpm live-demo:doctor`: checks for Vercel CLI availability, authentication, project linkage, and optional git remote state
- `pnpm live-demo:deploy`: runs a deployment from `apps/web` using the linked Vercel project and prints the preferred public alias when one exists
- `pnpm live-demo:verify -- https://<public-alias>`: verifies the public root, `/dev-loop`, and `/api/health`

## Verification contract

A published demo is considered healthy when all of these pass:

- `/` returns a successful page containing `AI-assisted UI dev loop template`
- `/dev-loop` returns a successful page containing `/dev-loop`
- `/api/health` returns JSON with `{ "ok": true }`

## Notes

- The Vercel link files created by `vercel link` are local machine state and are intentionally ignored via `.gitignore`.
- This repo currently has no `origin` remote, so the default publication path is CLI-driven preview deploys rather than git-push deploys.
- Prefer verifying the stable alias that `pnpm live-demo:deploy` prints rather than the raw deployment hostname.
- Current public live demo: `https://dev-loop-beta.vercel.app`
