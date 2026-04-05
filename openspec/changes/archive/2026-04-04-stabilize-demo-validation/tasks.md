## 1. Offline-safe build configuration

- [x] 1.1 Replace the current Google-font-based app shell typography with an offline-safe font configuration in `apps/web/app/layout.tsx` and any supporting styles.
- [x] 1.2 Verify the web app still renders correctly in development with the updated typography configuration.
- [x] 1.3 Run `pnpm build` and confirm the production build no longer depends on external font downloads.

## 2. Deterministic local automation startup

- [x] 2.1 Update the Playwright `webServer` setup to bind the app to an explicit loopback host and known port.
- [x] 2.2 Align any related scripts or commands so the documented dev-loop URL and the automation base URL match.
- [x] 2.3 Run the Playwright suite in an environment where the local server can start and confirm the dev loop flow still passes.

## 3. Validation and CI coverage

- [x] 3.1 Add the production build command to the repository's normal validation flow and any root scripts that should expose it.
- [x] 3.2 Update `.github/workflows/ci.yml` so CI runs the production build in addition to lint and E2E checks.
- [x] 3.3 Re-run the supported local validation commands and record any environment-specific limitations that remain.

## 4. Documentation and generated metadata

- [x] 4.1 Update `README.md` so the validation section and local workflow guidance match the supported commands and automation URL assumptions.
- [x] 4.2 Regenerate the repo layout output and refresh any embedded generated content that drifted from the tracked repository state.
- [x] 4.3 Review related docs for consistency and remove stale references introduced by the previous validation setup.
