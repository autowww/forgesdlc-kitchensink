# UX audit rule handbook pages

Per-rule Markdown sources for the Kitchen Sink showcase handbook (`showcase/ux-audit-rules/`).

## Files

| File | Role |
|------|------|
| `<rule-id-kebab>.md` | Canonical page content (agent-written via `npm run pagegen`) |
| `rule-pages.manifest.json` | Generated status manifest (`current` / `stale` / `missing`) |
| `RULE_PAGE_SCHEMA.md` | Required sections and front matter |

## Refresh workflow

```bash
cd tools/website-ux-auditor
npm run blend-rules
npm run pagegen -- --lane both --max-rules 30 --concurrency 3   # repeat until dry-run is empty
npm run pagegen:manifest

cd ../..
python3 generator/build-showcase.py
```

Use `--concurrency 2` or `3` to run multiple Cursor agents in parallel (default `1`).
Start with `2` and increase to `3` if stable; the orchestrator caps at `4`.
Set `FORGE_UX_PAGE_GEN_CONCURRENCY` for a default when the flag is omitted.

## Versioning

Each `.md` file must include front matter with `page_version` matching the computed
`contentVersion` for that rule. When the registry, implementation module, or lane doc
version changes, the page becomes **stale** and `pagegen` will queue it for a new agent run.
