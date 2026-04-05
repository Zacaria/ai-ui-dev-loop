# apps/web

Next.js App Router demo app for the AI UI dev loop template.

First-time users should start from the repository root with `pnpm activate`.

## Local commands

```bash
pnpm activate
pnpm doctor:loop
pnpm dev
pnpm mcp:verify
pnpm build
pnpm lint
pnpm e2e
```

The development server binds to `http://127.0.0.1:3000`.

The published live demo is currently available at `https://dev-loop-beta.vercel.app`.

Open `http://127.0.0.1:3000/dev-loop` for the deterministic automation surface.

The supported sidecar observability check is `pnpm mcp:verify` from the repository root.

## Notes

- The app uses an offline-safe system font stack so `pnpm build` works in restricted environments.
- Playwright config expects the dev loop surface at `http://127.0.0.1:3000/dev-loop`.
- Root-level commands in the repository proxy to this app and provide the supported first-run activation path.
- Live-demo publication is driven from the repository root via `pnpm live-demo:*` commands.
- The app-level `pnpm mcp:dev-loop` script remains as a compatibility alias; the supported repo-owned path is root `pnpm mcp:verify`.

## Key files

- `app/dev-loop/*`: deterministic UI surface for automation
- `e2e/dev-loop.spec.ts`: Playwright coverage for core interactions
- `scripts/mcp-dev-loop.mjs`: MCP-driven observability verifier
