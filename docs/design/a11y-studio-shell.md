# Forge A11y Studio shell — audit workspace

Canonical guideline for **Forge A11y Studio** (`forge-accessibility-leo`): Electron desktop, Python static server, and the **Audit workspace** (`#audit-workspace-section`).

Related: [Forge Enterprise UI](forge-enterprise-ui.md), [Lenses Studio shell](lenses-studio-shell.md) (parallel Electron pattern), [Wizard flow CSS](../../css/wizard-flow.css), [forge-react-primitives.css](../../css/forge-react-primitives.css).

---

## 1. Architecture

| Layer | Location |
|-------|----------|
| Electron | `forge-accessibility-leo/electron/` |
| Tokens | `forge_accessibility/static/studio-tokens.css` (`--studio-*`, `--le-*`) |
| KS shared CSS | `/__ks/css/forge-react-primitives.css`, `/__ks/css/wizard-flow.css` |
| Audit workspace | `#audit-workspace-section`, `64-audit-workspace.css`, `audit-workspace*.js` |

**Rule:** App CSS owns **layout grid only**. Surfaces compose **studio tokens** + KS primitives — no ad-hoc hex or light-theme defaults in workspace CSS.

---

## 2. Three-pane layout

| Pane | Purpose | Primary primitives |
|------|---------|-------------------|
| **Planning** | Swimlanes: setup, standards, tools, confirmation | `ks-wizard-flow`, `ks-wizard-flow__panel`, `<details>` swimlanes, `panel-inset` |
| **Run** | Governed run blade | `ks-fe-run-header`, `ks-fe-banner`, `workflow-step-card`, `audit-run-pipeline-ui` mount |
| **Results** | Main reports → deliverables → run explorer | `audit-deliverables` card grid, `run-workspace-split` |

Responsive grid (container + viewport):

- **≥1500px:** Planning | Run | Results (3 columns)
- **1000–1499px:** Planning | Run on top; Results full width
- **<1000px:** stack Planning → Run → Results

---

## 3. Enterprise principles (from Forge Enterprise UI)

1. **Trust over spectacle** — matte `--studio-surface-card`, quiet `--studio-border-subtle`.
2. **Hierarchy** — pane title → status pill → primary CTA; one H2 per swimlane section (hide relocated panel titles).
3. **Accents as signals** — amber: primary action; cyan: data; status chips for readiness only.
4. **Detail behind disclosure** — nested `<details>` for import, engine notes, more report formats, run explorer.
5. **No duplicate chrome** — when wizard/assistant panels are relocated into swimlanes, suppress their top-level headings and step indices.

---

## 4. Planning pane

- Four top-level swimlanes (`data-lane=setup|standards|tools|overview`).
- Sub-sections are second-level `<details>`; default open: project & scope, WCAG, scope inventory, plan snapshot.
- **Confirm audit plan** sets `assistantState.planConfirmed`; Run CTA gated by `GET /api/studio/audits/{id}/planning-readiness`.
- Do **not** show the legacy assistant flow strip or 6-step wizard stepper in this pane.

---

## 5. Run pane

- **Idle:** `ks-fe-run-header` + `ks-fe-banner--await` readiness + **Start governed run**.
- **Running:** `run-exec-panel` content inside blade; pipeline on `#audit-workspace-run-pipeline-mount`.
- **Complete:** **View results** focuses Results pane; scope heatmap in collapsible `<details>`.

---

## 6. Results pane

1. **Main reports** — hero row: Executive summary (corporate landscape PPTX) + VPAT PDF; collapsed **More report formats**.
2. **Deliverables** — scope analytics, QA, testing evidence (not duplicating hero PDFs).
3. **Run explorer** — folded `run-workspace-split`; open when `?runId=` is set.

Reuse `audit-artifact-card` from deliverables gallery; thumbnails via artifact-manifest API.

---

## 7. What belongs in KS vs A11y repo

| Asset | Canonical | Consumer |
|-------|-----------|----------|
| `forge-react-primitives.css`, `wizard-flow.css` | KS `css/` | Studio `index.html` via `/__ks/` |
| `studio-tokens.css`, `64-audit-workspace.css` | `forge-accessibility-leo` | Studio only |
| This document | KS `docs/design/` | All Studio contributors |

New shared run/planning widgets → implement in KS first, then consume from Studio.
