set shell := ["bash", "-euo", "pipefail", "-c"]

root := justfile_dir()

default:
    @just --list

[group("setup")]
@setup:
    pnpm -C "{{root}}" install

[group("setup")]
@activate:
    pnpm -C "{{root}}" activate

[group("setup")]
@doctor-loop:
    pnpm -C "{{root}}" doctor:loop

[group("deploy")]
@live-demo-doctor:
    pnpm -C "{{root}}" live-demo:doctor

[group("deploy")]
@live-demo-deploy:
    pnpm -C "{{root}}" live-demo:deploy

[group("deploy")]
@live-demo-verify url:
    pnpm -C "{{root}}" live-demo:verify -- "{{url}}"

[group("dev")]
@dev port="3000": setup
    pnpm -C "{{root}}/apps/web" exec next dev --hostname 127.0.0.1 -p "{{port}}"

[group("checks")]
@lint: setup
    pnpm -C "{{root}}" lint

[group("checks")]
@build: setup
    pnpm -C "{{root}}" build

[group("checks")]
@e2e: setup
    pnpm -C "{{root}}/apps/web" e2e

[group("demo")]
@mcp-verify: setup
    pnpm -C "{{root}}" --silent mcp:verify

[group("demo")]
@mcp-dev-loop: setup
    pnpm -C "{{root}}" --silent mcp:dev-loop

[group("cleanup")]
@clean:
    rm -rf "{{root}}/apps/web/.next" "{{root}}/apps/web/test-results" "{{root}}/apps/web/playwright-report"
