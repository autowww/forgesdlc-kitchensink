# Data charts — BI mapping matrix

Maps Power BI / Tableau standard categories to KS `kind` ids. Maps are out of scope.

| BI category | PBI / Tableau | KS kinds |
|-------------|---------------|----------|
| Comparison | Clustered/stacked bar & column | `commit_weekly`, `commit_daily`, `loc_*`, `compliance_bars`, `column_clustered`, `column_stacked`, `column_stacked_100`, `bar_stacked`, `bar_stacked_100` |
| Part-to-whole | Pie, donut, treemap | `loc_share_donut`, `pie`, `donut`, `treemap` |
| Trend | Line, area, combo | `line`, `area`, `area_stacked`, `combo_line_column`, `ribbon` |
| Distribution | Histogram, box | `histogram`, `box_plot` |
| Flow | Waterfall, funnel | `waterfall`, `funnel` |
| Correlation | Scatter, bubble | `scatter`, `bubble` |
| KPI | Card, gauge, bullet | `kpi_card`, `gauge`, `bullet`, `sparkline` |
| Table | Table, matrix | `contributors`, `table`, `matrix`, `matrix_heatmap`, `extension_heatmap` |
| Filter | Slicer, date range | `slicer_list`, `slicer_dropdown`, `slicer_date_range` |
| Custom | SVG escape hatch | `submodule_layout` |

Contract: `js/forge-data-charts.md` (v2). Family: **Kch**. Hub: **Dch**.
