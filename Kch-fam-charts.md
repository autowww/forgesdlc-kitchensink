# Kch — Data charts family

BI-standard analytical charts governed by `js/forge-data-charts.md` contract v2.

## Scope

- JSON-driven SVG/HTML renderers in `js/charts/*`
- Mount helper `render_ks_chart_mount` with `data-ks-hash`, insight lines, and optional `data-ks-chart-group`
- Showcase hub **Dch** and category pages (comparison, trend, part-to-whole, distribution, correlation, KPI, tables, filters)
- Static tier **Dcs** and API tier **Dca**

## Out of scope

- Map visuals (deferred)
- Server-side filter round-trip (Lenses follow-up)

## Verification

- `node --test tools/charts/tests/renderers.test.mjs`
- `python3 generator/build-showcase.py`
