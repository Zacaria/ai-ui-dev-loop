# GitHub Pages

This repository includes a static GitHub Pages site published from `docs/` by [`.github/workflows/pages.yml`](/Users/zacariachtatar/repos/ai-ui-dev-loop/.github/workflows/pages.yml).

Expected project-page URL for this repository shape:

- `https://<owner>.github.io/<repo>/`
- for `zacariahtatar/ai-ui-dev-loop`, that is typically `https://zacariahtatar.github.io/ai-ui-dev-loop/`

## One external action you may need

If the Pages workflow runs but the site does not publish, the exact repository-level action is:

1. Open GitHub repository settings.
2. Go to `Settings -> Pages`.
3. Set the source to `GitHub Actions`.

After that, pushes to `main` can publish the explainer automatically.
