---
id: forge.enterprise-app-ux-standard
kind: design-principle
status: draft
owner: Forge UX
applies_to:
  - forge-market-studio
  - forge-lenses-studio
  - forge-cockpit-web
  - forge-intelligence-studio
aliases:
  - Forge enterprise app UX standard
  - Studio operator UX standard
  - Enterprise SPA UX standard
updated: 2026-08-13
---

# Forge enterprise app UX standard

## Purpose

Operator and analyst **Studio SPAs** (Forge Market, Lenses Studio, Cockpit, Intelligence Studio) must feel **calm, governed, and outcome-led**—not like internal admin panels or mechanism dumps. A first-time operator should understand **where they are**, **what job this screen does**, **what to do next**, and **what happens when they act**—without reading API names first.

This standard complements:

- **[Forge enterprise UI](forge-enterprise-ui.md)** — visual packs (`data-fs-pack="enterprise"`), matte surfaces, accent roles
- **[Forge enterprise AI website standard](forge-enterprise-ai-website-standard.md)** — public marketing sites (different shell; do not apply homepage-first-screen budgets to Studio workspaces)
- **[Enterprise app contracts](enterprise-app/README.md)** — YAML principle contracts (`ENT.APP.*`) linking rules → components → states → audit IDs
- **[UX audit enterprise app rules](ux-audit/enterprise-app-ux-rules.md)** — machine rule IDs for Studio UX PDCA and ui-app-audit

**Phase B P0 + P1 compositions and primitives are shipped** — see [`enterprise-app/PHASE-B-BACKLOG.md`](enterprise-app/PHASE-B-BACKLOG.md) and showcase [`enterprise-app-compositions.html`](../../showcase/enterprise-app-compositions.html) (after build).

## Core principle

**One primary job per workspace view.** Secondary jobs live behind tabs (`Svc`), filters (`Ftb`), or disclosure—not as peer scroll sections. Lead with **human outcome**, then show mechanism and data.

---

## Shell lane (`DET.STUDIO.*`)

Studio-specific rules govern **SPA shell density and identity**—not the full ENT.APP workflow model. Use `DET.STUDIO.*` for:

| Region | Job | Rules |
|--------|-----|-------|
| App rail | Persistent navigation; one active destination | `DET.STUDIO.TITLE_NAV_MATCH`, `DET.APP.PERSISTENT_CHROME` |
| Page header | H1 + outcome-led lead (one paragraph) | `DET.STUDIO.MECHANISM_LEAD`, `DET.STUDIO.H1` |
| Mode tabs / lens | Secondary jobs (Screen, Alerts, Compare, Charts, Wiki) | `DET.STUDIO.JOB_BUDGET`, `DET.APP.TAB_PANEL` |
| Workspace `main` | Primary data table, chart, or builder | `AI.APP.DENSITY_BALANCE`, `DET.LANDMARKS.REQUIRED` |
| Action row | ≤3 visible actions; ≤1 primary CTA | `DET.BUTTON.GROUP.MAX`, `DET.APP.PRIMARY_CTA` |
| Selection bar (`Sab`) | Contextual bulk actions after row select | `AI.APP.WORKFLOW_CONTINUITY`, `DET.APP.BULK_ACTION_SCOPE` |

### First viewport budget (workspace)

| Signal | Budget |
|--------|--------|
| Primary jobs visible without scroll | **1** (one table, one chart stack, or one builder) |
| Visible H2 sections without `[role=tablist]` | ≤ **2** warn; > **4** fail `DET.STUDIO.JOB_BUDGET` |
| Horizontal action buttons per row | ≤ **3** (`DET.BUTTON.GROUP.MAX`) |
| Primary filled CTAs (`.fc-btn` non-ghost) | ≤ **1** (`DET.APP.PRIMARY_CTA`) |
| H1 vs active rail label | Must match after normalization (`DET.STUDIO.TITLE_NAV_MATCH`) |

### Copy pattern

1. **Outcome** — what the user can accomplish on this screen
2. **Scope** — what list, issuer, or time range is in view
3. **Mechanism** — harvest, pipeline, API (only after outcome or behind disclosure)
4. **Next action** — one obvious primary step
5. **Trust boundary** — what the system will / will not do on this action

Fail `DET.STUDIO.MECHANISM_LEAD` when the lead opens with harvest/API/pipeline language without outcome verbs (find, compare, track, review, watch, monitor).

**Do not** apply marketing `DET.SECTION.SINGLE_JOB` to Studio SPAs; use `DET.STUDIO.JOB_BUDGET`.

---

## Foundation — enterprise application principles

### ENT.APP.01 — Design the complete job

A record or workflow screen is a **job context**, not an isolated form or table.

**Use today:** `ForgeRunHeader` (`Frh`), `ForgeKeyValueGrid` (`Fkg`), `ForgeWorkflowStageBar` (`Fwb`), `ForgeEventTimeline` (`Fen`), breadcrumbs, sidebar navigation, `ks-split-pane`.

**Shipped composition:** `ForgeRecordWorkspace` (`Frw`, `js/ks-record-workspace.js`) — bundles header, metadata grid, lifecycle stage, timeline, and split collection/detail layout.

**Required states:** default, loading, error, permission-denied, stale.

**Audit:** `DET.STUDIO.H1`, `DET.STUDIO.JOB_BUDGET`, `DET.APP.PRIMARY_STATE`, `DET.LANDMARKS.REQUIRED`.

Contract: [`enterprise-app/rules/ENT.APP.01.yaml`](enterprise-app/rules/ENT.APP.01.yaml).

### ENT.APP.02 — Never make users reconstruct their work

Operators must resume drafts, saved views, and recent context without re-entering filters and scope.

**Use today:** `createFormController`, `createFilterToolbar` (`Ftb`), `WorkspaceLensControl` (`Wlc`), split pane persistence patterns, `ForgeAutosaveStatus` (`Fas`), `ForgeDraftRecovery` (`Fdr`), `ForgeSavedViewManager` (`Fsm`), `ForgeRecentItems` (`Fri`).

**Shipped composition:** `ForgePersistentWorkspace` (`Fpw`, `js/ks-persistent-workspace.js`).

**Audit:** `DET.APP.WORK_STATE_PERSISTENCE`, `DET.APP.ROUTE_DEEPLINK_STATE`, `DET.APP.PERSISTENT_CHROME`.

Contract: [`enterprise-app/rules/ENT.APP.02.yaml`](enterprise-app/rules/ENT.APP.02.yaml).

### ENT.APP.03 — Make state, freshness, and consequences visible

Operators must see **what state the system is in**, whether data is fresh, and what happens next.

**Use today:** `ForgeStatusBanner` (`Fsb`), badges, `ForgeWorkflowStageBar` (`Fwb`), `ForgeEventTimeline` (`Fen`), `ForgeDiagnosticPanel` (`Fdg`), `ForgeKeyValueGrid` (`Fkg`), `ForgeOperationProgress` (`Fop`), `ForgeFreshnessIndicator` (`Ffi`), `ForgeResultReceipt` (`Frt`), `ForgeJobCenter` (`Fjc`).

**Shipped composition:** `ForgeAsyncOperation` (`Fao`, `js/ks-async-operation.js`).

#### Badge versus banner versus callout

| Control | Use for | Do not use for |
|---------|---------|----------------|
| **Badge** | Compact persistent metadata (Draft, Approved, High risk, ERP, Read-only) | Sole representation of serious failure; permission ACL |
| **Status banner** (`Fsb`) | Primary operational condition (sync failed, stale data, awaiting approval, record changed) | Long instructional copy |
| **Callout** | Business-rule warning, field importance, future consequence | Rapidly changing process status |

**Audit:** `DET.APP.DATA_REFRESH_STALENESS`, `DET.APP.EMPTY_LOADING_ERROR_SUCCESS`, `DET.APP.PRIMARY_STATE`, `DET.APP.TOAST_LIFECYCLE`.

Contract: [`enterprise-app/rules/ENT.APP.03.yaml`](enterprise-app/rules/ENT.APP.03.yaml).

### ENT.APP.04 — Prevent errors first; make recovery inexpensive

Governed forms and decisions validate early, summarize errors, and offer undo where safe.

**Use today:** `createFormController`, `Swz` (stepper wizard), `ForgeReviewPanel` (`Fvw`), `ForgeDecisionActionBar` (`Fda`), callouts, inline validation, `ForgeErrorSummary` (`Fes`), `ForgeImpactPreview` (`Fip`), `ForgeConfirmationGuard` (`Fcg`), `ForgeUndoToast` (`Fut`), `ForgeVersionHistory` (`Fvh`).

**Shipped composition:** `ForgeGovernedForm` (`Fgf`, `js/ks-governed-form.js`).

**Recommended sequence:** validate → error summary → impact preview → confirm → submit → receipt/undo.

**Audit:** `DET.FORM.LABEL_ERROR_SUMMARY`, `DET.APP.DISABLED_REASON`, `DET.APP.MODAL_DISMISSAL_GUARD`, `DET.APP.TOAST_LIFECYCLE`, `DET.APP.PRIMARY_CTA`.

Contract: [`enterprise-app/rules/ENT.APP.04.yaml`](enterprise-app/rules/ENT.APP.04.yaml).

### ENT.APP.05 — Treat tables, search, and filters as a workbench

Lists are **operational work surfaces**—not read-only galleries.

**Use today:** `createFilterToolbar` (`Ftb`), `createFilterChipScroller`, `createGovernedCombobox`, `createDataTable` (`Dtb`), `createPaginationTactile`, `createStickyActionBar` (`Sab`), chart slicers for linked analytics.

**Shipped composition:** `ForgeQueueWorkbench` (`Fqw`, `js/ks-queue-workbench.js`) — saved views, column manager, bulk selection, object inspector.

**Important:** Do **not** extend `createDataTable` informally with ad hoc editable cells. Use a governed `ForgeEditableGridAdapter` wrapping an external grid with KS tokens, keyboard, validation, and permissions.

**Audit:** `DET.APP.BULK_ACTION_SCOPE`, `DET.APP.DATA_REFRESH_STALENESS`, `DET.APP.EMPTY_LOADING_ERROR_SUCCESS`, `DET.DATA.TABLE_HEADERS`, `DET.DATA.COLOR_ONLY`.

Contract: [`enterprise-app/rules/ENT.APP.05.yaml`](enterprise-app/rules/ENT.APP.05.yaml).

### ENT.APP.06 — Separate permissions, role defaults, and preferences

Authorization, role presets, and user preferences are **different semantics**.

| Kind | Example | Control |
|------|---------|---------|
| Authorization | Cannot approve over limit | `ForgeAccessReason` (`Far`), `ForgeReadOnlyFieldGroup` (`Frg`) |
| Role default | Analyst sees summary first | `Wlc`, `ForgeRolePreset` (`Frl`) |
| User preference | Table density, column order | `ForgeSavedViewManager` (`Fsm`), not badges |

**Anti-pattern:** Do **not** use badges as permission controls (badge ≠ ACL).

**Shipped composition:** `ForgePermissionBoundary` (`Fpb`, `js/ks-permission-boundary.js`). **Shipped primitives:** `ForgeReadOnlyFieldGroup` (`Frg`), `ForgeRolePreset` (`Frl`).

**Audit:** `DET.APP.DISABLED_REASON`, `DET.APP.DEMO_DISCLOSURE`.

Contract: [`enterprise-app/rules/ENT.APP.06.yaml`](enterprise-app/rules/ENT.APP.06.yaml).

### ENT.APP.07 — Support beginners and experts in the same interface

**Beginner layer:** disclosure stacks, callouts, templates, smart defaults, visible labels.

**Expert layer:** command palette (`ks-command-palette`), keyboard shortcuts, action dropdowns, saved views.

**Shipped primitives:** `ForgeContextHelp` (`Fch`), `ForgeShortcutRegistry` (`Fsr`), `ForgeTemplatePicker` (`Ftp`), `ForgeSmartDefault` (`Fsd`).

**Shipped composition:** `ForgeAdaptiveWorkspace` (`Faw`, `js/ks-adaptive-workspace.js`).

**Audit:** `DET.APP.PRIMARY_CTA`, `DET.BUTTON.GROUP.MAX`, `DET.APP.WIZARD_PROGRESS_CONTROLS`.

Contract: [`enterprise-app/rules/ENT.APP.07.yaml`](enterprise-app/rules/ENT.APP.07.yaml).

### ENT.APP.08 — Keep inspection, decisions, and handoffs in context

Review evidence beside the record—do not navigate away for every inspection.

**Use today:** `ks-split-pane`, `ForgeReviewPanel` (`Fvw`), `ForgeEventTimeline` (`Fen`), `ForgeKeyValueGrid` (`Fkg`), `ForgeDecisionActionBar` (`Fda`), `ForgeObjectInspector` (`Foi`), `ForgeAssignmentControl` (`Fac`), `ForgeCommentThread` (`Fct`), `ForgeHandoffSummary` (`Fhs`).

**Shipped composition:** `ForgeInspectionWorkspace` (`Fix`, `js/ks-inspection-workspace.js`).

**Anti-pattern:** Bottom sheet as **desktop** inspector—use split pane or object inspector panel.

**Audit:** `AI.APP.WORKFLOW_CONTINUITY`, `DET.APP.BULK_ACTION_SCOPE`.

Contract: [`enterprise-app/rules/ENT.APP.08.yaml`](enterprise-app/rules/ENT.APP.08.yaml).

### ENT.APP.09 — Accessibility and keyboard behavior as component contracts

Every interactive primitive documents **required states** (default, focus, disabled-with-reason, error, loading, reduced motion) and keyboard behavior.

**Today:** `DET.APP.CONTROL_A11Y`, `DET.APP.PRIMITIVE_MARKERS`, `DET.LANDMARKS.REQUIRED`; separate Website Accessibility Auditor for WCAG campaigns.

**Shipped:** per-primitive state matrices in [`enterprise-app/a11y-state-matrices.md`](enterprise-app/a11y-state-matrices.md) and [`tools/studio-ux-pdca/lib/enterprise-app-a11y-matrices.json`](../../tools/studio-ux-pdca/lib/enterprise-app-a11y-matrices.json). Contract-test harness wiring is a consumer integration task.

Contract: [`enterprise-app/rules/ENT.APP.09.yaml`](enterprise-app/rules/ENT.APP.09.yaml).

### ENT.APP.10 — Measure workflow outcomes by role

Dashboards answer **workflow questions**, not vanity counts.

| Question | Visualization |
|----------|---------------|
| How much is blocked? | Bullet chart, stacked bar |
| Trend over time? | Line or area chart |
| Distribution by category? | Bar chart |
| Single KPI vs target? | KPI card + sparkline |
| Drill to records? | Linked `Dtb` with slicers |

**Shipped composition:** `ForgeWorkflowMetrics` (`Fwm`, `js/ks-workflow-metrics.js`) with `data-telemetry-schema="forge-workflow-v1"` and `ks-workflow-metric` `CustomEvent` on drilldown.

**Audit:** `AI.DASHBOARD.ACTIONABILITY_PRIORITY`, `DET.APP.TILE_AFFORDANCE`.

Contract: [`enterprise-app/rules/ENT.APP.10.yaml`](enterprise-app/rules/ENT.APP.10.yaml).

### ENT.APP.AI — Governed AI overlay

AI suggestions are **reviewable overlays**—not silent replacements for operator judgment.

**Use today:** `ForgeReviewPanel` (`Fvw`), `ForgeDecisionActionBar` (`Fda`), `ForgeDiagnosticPanel` (`Fdg`), `Fsb`, `Fen`.

**Shipped primitives:** `ForgeAILabel` (`Fal`), `ForgeProvenancePanel` (`Fpv`), `ForgeConfidenceIndicator` (`Fci`), `ForgeRevertAction` (`Fra`).

**Shipped composition:** `ForgeAISuggestionReview` (`Fai`, `js/ks-ai-suggestion-review.js`).

**Audit:** `DET.APP.AI_PROVENANCE`.

**Use `Fda` for:** approval, rejection, verification, rerun, governed commit—not navigation or filters.

Contract: [`enterprise-app/rules/ENT.APP.AI.yaml`](enterprise-app/rules/ENT.APP.AI.yaml).

---

## Practical control-selection guide

### Choice controls

| Need | Use |
|------|-----|
| Small fixed single-choice list | Native `select` |
| Two to four immediate modes | `createSegmentedControl` (`Svc`) |
| Long searchable flat list | `createGovernedCombobox` |
| Hierarchical org/person/accounts | `createTreeCombobox` |
| Quick dataset facets (All, Mine, Overdue) | `createFilterChipScroller` |
| Full search and filter workspace | `createFilterToolbar` (`Ftb`) |
| Filters for linked charts only | Chart slicers |
| Multi-select tags | Governed add-on until KS native component |

### Progress controls

| Situation | Correct control |
|-----------|-----------------|
| User completing a linear multistep task | `createStepperWizard` (`Swz`) |
| Record moving through business lifecycle | `ForgeWorkflowStageBar` (`Fwb`) |
| Static process explanation | `.forge-flow` |
| Historical sequence / audit | `ForgeEventTimeline` (`Fen`) |
| Long-running execution | `ForgeOperationProgress` (`Fop`) |

A workflow stage bar must **not** become a clickable wizard unless users control the transitions.

### Action controls

| Need | Use |
|------|-----|
| Single dominant page action | `.btn-forge` / primary CTA |
| Secondary action | Outline button |
| Approve / reject / verify | `ForgeDecisionActionBar` (`Fda`) |
| Persistent long-form actions | `createStickyActionBar` (`Sab`) |
| Infrequent row actions | Action dropdown |
| Global expert commands | `ks-command-palette` |
| Mobile quick actions | `ks-bottom-sheet` (not desktop inspector) |

### Feedback controls

| Need | Use |
|------|-----|
| Compact persistent status | Badge |
| Page-level operational state | `ForgeStatusBanner` (`Fsb`) |
| Guidance or business-rule warning | Callout |
| Field-specific validation | Inline validation |
| Multiple form errors | `ForgeErrorSummary` (`Fes`); `DET.FORM.LABEL_ERROR_SUMMARY` |
| Technical details | `ForgeDiagnosticPanel` (`Fdg`) |
| Transient result or undo | Toast / `ForgeUndoToast` (`Fut`) |
| Historical evidence | `ForgeEventTimeline` (`Fen`) |

### Data controls

| Need | Use |
|------|-----|
| Read-only sortable paginated records | `createDataTable` (`Dtb`) |
| Organizational hierarchy | Org tree table |
| Analytical cross-tab | Matrix |
| Intensity comparison | Heatmap |
| Small trend inside a row | Table with sparkline |
| Spreadsheet editing | `ForgeEditableGridAdapter` (`Feg`) |

### Detail and disclosure

| Need | Use |
|------|-----|
| Optional advanced detail | Disclosure stack |
| Persistent side-by-side inspection | `ks-split-pane` |
| Difference and approval review | `ForgeReviewPanel` (`Fvw`) |
| Technical raw data | `ForgeDiagnosticPanel` (`Fdg`) |
| Mobile short contextual task | Bottom sheet |
| Global command search | Command palette |

---

## Page-type expectations

| Surface | Primary job | Wiki / graph axis |
|---------|-------------|-------------------|
| Lists / watchlists | Review one list scope | N/A (pass) |
| Company hub | Issuer summary + sub-tabs | Weight wiki only on Wiki tab |
| Filings / Facts / Ingest / Analysis | Operational pipeline view | N/A unless wiki links present |
| Dual-wiki / Graph | Navigation + evidence affordances | Full `wiki_functionality` weight |

## Visual and enterprise feel

Apply **`forge-enterprise-ui.md`** enterprise pack where Studio embeds KS CSS:

- Matte panels, restrained motion, amber/cyan as signals—not decoration on every tile
- Grouped regions with `card-label` / section labels
- Judgment overlay: **`AI.PREMIUM.ENTERPRISE_FEEL`**, **`AI.APP.DENSITY_BALANCE`**

## Capture and audit contract (Studio UX PDCA)

| Check | Rule ID | Layer |
|-------|---------|-------|
| Full scroll visible to assessor | `DET.STUDIO.FULLPAGE_SHOT` | Capture gate |
| Governed visual roots | `DET.STUDIO.HASH` | DOM |
| Stable E2E anchors | `DET.STUDIO.TESTID` | DOM |
| Deterministic score rollup | `enterprise_ux` axis | mean(identity, job_budget, control_density) |

Machine-readable pack: `tools/studio-ux-pdca/lib/enterprise-app-ruleset.json`.

## Deprecate / demote ledger

| Pattern | Action |
|---------|--------|
| `DET.SECTION.SINGLE_JOB` on Studio SPAs | **Demote** — use `DET.STUDIO.JOB_BUDGET` |
| Badge as permission / ACL indicator | **Deprecate** — use `ForgeAccessReason` (`Far`) / `ForgeReadOnlyFieldGroup` (`Frg`) |
| Informal editable `createDataTable` cells | **Deprecate** — require `ForgeEditableGridAdapter` |
| `ForgeWorkflowStageBar` as clickable wizard | **Demote** — use `Swz` when user drives steps |
| Bottom sheet as desktop object inspector | **Deprecate** — use split pane / `ForgeObjectInspector` |
| `DET.STUDIO.*` as full ENT.APP substitute | **Demote** — shell lane only; workflow principles use ENT.APP YAML |
| Near-duplicate DET IDs | **Avoid** — extend existing `DET.APP.*` or mark `planned:` in YAML |

## Non-goals

- Do **not** add product-specific audit profiles (e.g. a named Fleet-only pack). Forge Market may appear only as a generic regression example.
- Do **not** merge website auditor and scorer CLIs; Studio PDCA may **reuse** shared DET checks via ui-app-audit allowlists.
- Do **not** claim Phase B compositions are planned when ENT.APP YAML marks them `status: shipped`.

## References

- ENT.APP YAML contracts: [`enterprise-app/README.md`](enterprise-app/README.md)
- Phase B backlog: [`enterprise-app/PHASE-B-BACKLOG.md`](enterprise-app/PHASE-B-BACKLOG.md)
- Studio UX PDCA harness: `tools/studio-ux-pdca/README.md`
- Sealed Studio DET allowlist: `tools/ui-app-audit/lib/studio-dynamic-ux-ruleset.mjs`
- Desktop/app DET catalog: `docs/design/ux-audit/deterministic-design-rules.md`
- Element matrix: `docs/design/ux-audit/element-level-ruleset-matrix.md`
- React primitives: `react/` + [`catalog/primitives/FAM-react-primitives.md`](catalog/primitives/FAM-react-primitives.md)
