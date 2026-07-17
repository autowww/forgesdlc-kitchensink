---
hash: "Cap"
name: "Capablio app shell"
type: "layout"
status: "active"
source_paths:
  - css/forge-capablio-app-shell.css
  - css/forge-capablio-console.css
showcase_url: ""
screenshot_status: "planned"
---

# Cap — Capablio app shell

## Identity

- **Hash:** Cap
- **Name:** Capablio app shell
- **Type:** layout
- **Page types:** Dashboard / desktop console; Admin / operations ([Ks-page-type-design-guidelines.md](../page-types/Ks-page-type-design-guidelines.md))
- **Source paths:** `css/forge-capablio-app-shell.css`, `forge360/ui/static/shared/console-shell.js`

## Purpose

Full-viewport operator and tenant-admin consoles for Capablio (`/app/`, `/app/operator/`, `/app/admin/`) aligned with the Kitchen Sink **product_page** shell: top band, persistent **forge-sidebar** tier navigation, and a primary **cap-workspace** column.

## Expected look

- **Top band** (`cap-top-band`): brand, tenant context, signed-in user, operator support badge when applicable.
- **Left rail** (`forge-sidebar`): section labels and tier accordion (`nav-tier-wrap`) — one navigation system, no duplicate horizontal button rows.
- **Workspace** (`cap-workspace`): breadcrumb, page title, optional stat band, matte **cap-panel** regions (enterprise pack).
- **End-user home:** dashboard **cap-dash-card** grid after sign-in; sign-in uses centered **cap-auth-card** without sidebar.

## Anatomy

```text
header.cap-top-band
div.cap-app-grid
  aside.forge-sidebar#cap-sidebar
  main.cap-workspace#…-root
```

Registry **root_selector:** `div.cap-app-grid`.

## Enterprise look and feel rules

- `html[data-fs-pack="enterprise"]` — matte panels, restrained motion ([forge-enterprise-ui.md](../../forge-enterprise-ui.md)).
- Trust over spectacle: completion tables and tenant lists in panels, not raw sections on empty canvas.
- Destructive actions use confirmation; status uses badges with text labels, not color alone.

## Deterministic checks

- Emitted roots include `hash="Cap"` and `data-ks-hash="Cap"` on `cap-app-grid` where practical.
- No external URLs in vendored static CSS/HTML under `forge360/ui/static/`.
- Header contains fewer than six top-level action buttons (sidebar carries IA).

### Website UX auditor (`--site-kind capablio`)

Use the live e2e fixture (`e2e_serve` + mock auth) — see `workbench/feedback-360/docs/capablio-ux-fixture.md`.

| Signal | Expected |
|--------|----------|
| Pack | `html[data-fs-pack="enterprise"]` |
| Shell grid | `div.cap-app-grid` (hash **Cap**) |
| Sidebar | `aside.forge-sidebar` persists on `/app/*` routes |
| Workspace | `main.cap-workspace` |
| Page mode | `app-shell` (skips handbook homepage-shell / marketing checks) |
| Multi-route | `DET.APP.PERSISTENT_CHROME`, `DET.NAV.DEDUP` across seeded consoles |

Run: `./scripts/run-capablio-ux-audit.sh` from `workbench/feedback-360`.

## Related

- [Prd-layout-product.md](Prd-layout-product.md) — reference product_page shell
- [forge-capablio-console.css](../../../css/forge-capablio-console.css) — tables, forms, buttons
