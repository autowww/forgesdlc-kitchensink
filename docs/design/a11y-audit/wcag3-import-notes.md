# WCAG 3.0 catalog import notes

- **Source TR:** https://www.w3.org/TR/wcag-3.0/
- **Snapshot:** `2025-05-import` (curated requirements in `wcag3-outcomes-catalog.json`)
- **Profiles:** `wcag30bronze`, `wcag30silver`, `wcag30gold` only — no `wcag30a` / `wcag30aa` / `wcag30aaa` aliases

## Refresh workflow

1. Update requirements in `wcag3-outcomes-catalog.json` when the W3C draft changes materially.
2. `cd tools/website-a11y-auditor && node scripts/import-wcag3-draft-catalog.mjs`
3. `npm run blend-rules`
4. `npm run sync-wcag-md`
5. `node validate-standards-pack.mjs --pack wcag30bronze --strict` (and silver, gold)

## Automation proxy

Forge axe/DET packs use WCAG 2.2 tag bundles as a proxy (`wcag22aa` for Bronze/Silver, `wcag22aaa` for Gold). This is documented in [wcag-3.0-profiles.md](wcag-3.0-profiles.md).
