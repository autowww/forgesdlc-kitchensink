# Lenses Studio shell — window, layout, and Kitchen Sink reuse

This document is the **canonical guideline** for how **Forge Studio / Lenses Studio** combines:

1. **Electron** (desktop window, frameless chrome, OS bridges)
2. **A React SPA** served by the Python server at **`/studio/`**
3. **Kitchen Sink (KS)** themes, shared CSS/JS, and React primitives

**Code locations:** `forge-lenses` repo — `desktop/`, `lenses-enterprise/`, `lenses/static/studio/` (build output). **Design tokens and shared components** live in **`forgesdlc-kitchensink`** and are consumed via **`/__ks/…`** and (for React) a **synced copy** under `lenses-enterprise/src/forgesdlc-kitchensink/`.

Related: [Forge Enterprise UI](forge-enterprise-ui.md) (theme packs, `fs_pack`, static product sites), `forge-lenses/docs/adr-001-lenses-studio-shell.md`.

---

## 1. End-to-end architecture

**Data flow (high level)**

1. **Electron** opens a **BrowserWindow** loading `http://127.0.0.1:<port>/studio/`.
2. **Python** serves **`lenses/static/studio/`** (Vite output) and **`/api/…`** JSON.
3. The **SPA** loads shared styles/scripts from **`/__ks/css/*`**, **`/__ks/js/*`** (Kitchen Sink).
4. **Preload** exposes **`window.lensesElectron`** for min/max/close only — no Node in the React bundle.

- **Main process** (`forge-lenses/desktop/main.js`): creates `BrowserWindow`, sets **`backgroundColor`** to match app bg (`#0a0e17`), optional **`frame: false`** when Studio UI env is set, registers IPC for window controls.
- **Preload** (`desktop/preload.js`): exposes **`window.lensesElectron`** (`minimize`, `maximize`, `close`, `isMaximized`, `onMaximizedChange`, `platform`) — **no** raw `ipcRenderer` to the page.
- **Renderer**: SPA **`fetch`**es APIs; **never** uses Node APIs in the bundle.

**Environment:** **`LENSES_STUDIO_UI=1`** (or legacy **`LENSES_ENTERPRISE_UI=1`**) makes Electron load **`/studio/`** instead of **`/`**. See `desktop/main.js` and `launch-forge-studio.sh`.

---

## 2. Electron window contract (Studio)

| Concern | Rule |
|--------|------|
| **Security** | **`contextIsolation: true`**, **`nodeIntegration: false`**. OS integration only through **preload** + **`contextBridge`**. |
| **Frameless** | When Studio: **`frame: false`**. Custom **min / max / close** in the React header (`WindowChrome` + IPC). |
| **Drag** | **`app-region: drag`** on a dedicated top strip; interactive controls use **`app-region: no-drag`**. |
| **Background** | **`backgroundColor: '#0a0e17'`** on `BrowserWindow` must match **`--le-bg`** so no bright seam at edges. |
| **Resize** | Window state is standard Electron; maximize/restore icon follows **`isMaximized`** via IPC events. |

Chrome layout is **implemented in the SPA** (`lenses-enterprise`), not in KS Python layouts — KS documents **tokens and shared widgets** only.

---

## 3. SPA layout and styling (lenses-enterprise)

| Layer | Role |
|-------|------|
| **`index.html`** | Loads **`/__ks/css/`** (`forge-theme.css`, `forgesdlc-theme.css`, `forge-data-charts.css`, `workspace-lens.css`) + Vite bundle. |
| **`enterprise-shell.css`** | **`--le-*` tokens** — shell background, borders, **panel insets** (`--le-panel-inset-x`), header/nav block padding, scorecard/panel tilt. **Studio-specific**; lives in the app repo. |
| **`index.css`** | App chrome: header, Electron drag strip, workspace lens toggle (`.le-lens-*`), utilities, shell grid (sidebar + main), scrollbars. |
| **`Layout.tsx`** | Header (brand, lens, search, settings, account, window controls), nav row, **`le-shell`** + sidebar + **`Outlet`**. |

**Principles (aligned with [Forge Enterprise UI](forge-enterprise-ui.md)):**

- **Trust over spectacle** — matte surfaces, quiet borders; accents (amber/cyan) are semantic.
- **One horizontal inset token** — **`--le-panel-inset-x`** for window edge alignment: header row, nav, sidebar, main column.
- **Tilt** — **`.le-panel`** and **`.le-stat`** share the same perspective/rotate hover language (see `enterprise-shell.css`).
- **Full-bleed background** — `html`, `body`, `#root`, and **`main.le-page--main`** paint **`var(--le-bg)`**; dark scrollbar styling avoids a false “stripe” at the viewport edge.

---

## 4. What lives in Kitchen Sink vs Studio repo

| Asset | Canonical location | Consumed by Studio as |
|-------|--------------------|-------------------------|
| Theme CSS (`forge-theme.css`, `forgesdlc-theme.css`, charts, `workspace-lens.css`) | `forgesdlc-kitchensink/css/` | **`GET /__ks/css/…`** from Python server |
| Charts JS | `forgesdlc-kitchensink/js/forge-data-charts.js` | **`/__ks/js/forge-data-charts.js`** |
| **`WorkspaceLensControl` (React)** | `forgesdlc-kitchensink/react/WorkspaceLensControl.tsx` | **Synced** into `lenses-enterprise/src/forgesdlc-kitchensink/` via **`npm run sync-kitchensink-react`** (see `scripts/sync-kitchensink-react.sh`) |
| Studio-only chrome CSS | `lenses-enterprise/src/index.css`, `enterprise-shell.css` | Build output only — **not** duplicated in KS |

**Rule:** Shared **behavior and presentation** for the workspace lens (Flow / Artifacts) belongs in **`forgesdlc-kitchensink/react`** + **`css/workspace-lens.css`**. **Forge Studio** header chrome and Electron-specific CSS stay in **`lenses-enterprise`**.

---

## 5. Build and ship

1. From **`forge-lenses/lenses-enterprise`**: **`npm run build`** → writes **`lenses/static/studio/`** (and tracked assets).
2. Python serves **`/studio/`** from that directory; unknown paths return **`index.html`** for the router.
3. Electron packages the same static tree; no separate dev server in production.

After editing KS React primitives: sync, then build Studio, then commit **`forge-lenses`** (and separately commit **KS** if you changed upstream).

---

## 6. Checklist for new Studio UI work

- [ ] Prefer **KS tokens** (`--forge-*` / `--le-*` patterns) over one-off hex colors.
- [ ] Extend **KS React components** in `forgesdlc-kitchensink/react` when the widget is reusable; wire in **`lenses-enterprise`** only.
- [ ] Keep **preload** surface minimal; add IPC in main + preload together.
- [ ] Match **BrowserWindow `backgroundColor`** to **`--le-bg`** if the app background token changes.
- [ ] Run **`npm run build`** in **`lenses-enterprise`** before release or Electron packaging.

---

## See also

- `forge-lenses/docs/adr-001-lenses-studio-shell.md` — ADR (framework, routing, legacy URLs).
- `forge-lenses/lenses/website/interface-pages.md` — product IA and dual-surface rules (Classic vs Studio).
- [Forge Enterprise UI](forge-enterprise-ui.md) — `fs_pack`, static site integration.
