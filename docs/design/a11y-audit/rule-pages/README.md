# Accessibility audit rule pages

Handbook Markdown siblings for the **Forge Website Accessibility Auditor**.

| File | Role |
|------|------|
| `*.md` | Per-rule handbook (Before/After HTML fences) |
| `rule-pages.manifest.json` | Build status (`current` / `stale` / `missing`) |
| `RULE_PAGE_SCHEMA.md` | Authoring contract |

Regenerate bootstrap pages: `python3 generator/bootstrap_a11y_rule_pages.py`

Compiled to `showcase/a11y-audit-rules/*.html` by `python3 generator/build-showcase.py`.
