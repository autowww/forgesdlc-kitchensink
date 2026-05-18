# KS visual catalog ontology

This document classifies addressable visuals in **forgesdlc-kitchensink**. The **source-derived inventory** (`visual-inventory.generated.json`) is authoritative for what exists in the repo; the **registry** (`visual-registry.yaml`) is authoritative for stable hashes and contracts.

## Kinds

| Kind | Meaning | Typical registry `type` |
|------|---------|-------------------------|
| Page type | Product pattern (landing, handbook, listing, …) | `page-type` (when modeled) |
| Layout | Full-page shell from `components/layouts.py` | `layout` |
| Page instance | One showcase slug / generator `PAGE` | `page`, `layout-preview` |
| Section | Composed region inside a page | Often `family-covered` under page contracts |
| Component | Reusable renderer (`render_*`, marketing blocks) | `component` / family row |
| Primitive | Low-level control (e.g. React primitive) | `react-primitive` |
| Visual style | Theme, pack, or surface stylesheet | `style-family` (`visual-style`) |
| Diagram template | SVG template under `assets/svg/` | `diagram-family` |
| Interaction module | JS that changes visible state | `script-family` |
| Desktop interface | Bundled app/studio shell | `desktop-interface` |
| Museum/studio surface | Static studio preview under `museum/studio/` | `desktop-interface` |

## Page-type principles (governance)

Cover both **public web** and **desktop/app** surfaces:

1. Product landing page  
2. Product architecture landing page  
3. Documentation / handbook page  
4. API / reference page  
5. Gallery / catalog page  
6. Listing / resource hub  
7. Dashboard / desktop console  
8. Admin / operations page  
9. Wizard / guided flow  
10. Data report / analytics page  
11. Presentation / storytelling page  
12. Desktop studio / app workspace  

## Lifecycle (`status`)

- `proposed` — new hash, not yet fully stamped or reviewed  
- `active` — current, emitted in shipping surfaces where applicable  
- `deprecated` — replace with `aliases` / successor hash; do not emit without alias rule  
- `removed` — historical only; must not appear in HTML  

## Relationship to other standards

- **Enterprise website standard:** [../forge-enterprise-ai-website-standard.md](../forge-enterprise-ai-website-standard.md)  
- **UX auditor / scorer:** read-only consumers of catalog data; they do not own the registry.  
- **Prompt kit examples:** not authoritative for hashes; compare to inventory for ideas only.
