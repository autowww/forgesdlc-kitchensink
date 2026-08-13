"""Enterprise app compositions — ENT.APP Phase B P0+P1 workbenches and primitives."""
from __future__ import annotations

PAGE = {
    "slug": "enterprise-app-compositions",
    "title": "Enterprise app compositions",
    "intro": (
        "Governed operator workbenches for ENT.APP.01–10 and ENT.APP.AI: "
        "queue, form, async, record, permission, persistent, inspection, adaptive, "
        "metrics, AI review, job center, impact preview, and supporting primitives. "
        "See <code>docs/design/enterprise-app/</code>."
    ),
    "family": "Components",
    "layout": "showcase",
    "order": 8.5,
    "toc": [
        ("sec-eac-queue", "Queue workbench"),
        ("sec-eac-form", "Governed form"),
        ("sec-eac-async", "Async operation"),
        ("sec-eac-record", "Record workspace"),
        ("sec-eac-permission", "Permission boundary"),
        ("sec-eac-persistent", "Persistent workspace"),
        ("sec-eac-inspection", "Inspection workspace"),
        ("sec-eac-adaptive", "Adaptive workspace"),
        ("sec-eac-metrics", "Workflow metrics"),
        ("sec-eac-ai", "AI suggestion review"),
        ("sec-eac-jobs", "Job center"),
        ("sec-eac-impact", "Impact preview"),
        ("sec-eac-toast", "Undo toast"),
        ("sec-eac-grid", "Editable grid adapter"),
        ("sec-eac-support", "Supporting primitives"),
    ],
}


def extra_css() -> str:
    return (
        '<link rel="stylesheet" href="assets/forge-data-table.css">'
        '<link rel="stylesheet" href="assets/forge-react-primitives.css">'
        '<link rel="stylesheet" href="assets/forge-enterprise-compositions.css">'
    )


def extra_js_paths() -> list[str]:
    return [
        "assets/ks-filter-toolbar.js",
        "assets/ks-data-table.js",
        "assets/ks-sticky-action-bar.js",
        "assets/ks-form-controller.js",
        "assets/ks-queue-workbench.js",
        "assets/ks-governed-form.js",
        "assets/ks-async-operation.js",
        "assets/ks-record-workspace.js",
        "assets/ks-permission-boundary.js",
        "assets/ks-undo-toast.js",
        "assets/ks-editable-grid-adapter.js",
        "assets/ks-recent-items.js",
        "assets/ks-persistent-workspace.js",
        "assets/ks-assignment-control.js",
        "assets/ks-comment-thread.js",
        "assets/ks-handoff-summary.js",
        "assets/ks-inspection-workspace.js",
        "assets/ks-context-help.js",
        "assets/ks-shortcut-registry.js",
        "assets/ks-template-picker.js",
        "assets/ks-smart-default.js",
        "assets/ks-adaptive-workspace.js",
        "assets/ks-workflow-metrics.js",
        "assets/ks-ai-label.js",
        "assets/ks-provenance-panel.js",
        "assets/ks-confidence-indicator.js",
        "assets/ks-revert-action.js",
        "assets/ks-ai-suggestion-review.js",
        "assets/ks-job-center.js",
        "assets/ks-confirmation-guard.js",
        "assets/ks-impact-preview.js",
        "assets/ks-result-receipt.js",
        "assets/ks-version-history.js",
        "assets/ks-readonly-field-group.js",
        "assets/ks-role-preset.js",
    ]


def render() -> str:
    return """\
<section id="sec-eac-queue" class="ks-section" hash="Fqw" data-ks-hash="Fqw">
  <h2 class="ks-section-title">Queue workbench</h2>
  <p class="forge-support mb-3">Filter toolbar + data table + selection-scoped sticky actions + saved views.</p>
  <div id="demo-queue-workbench"></div>
</section>

<section id="sec-eac-form" class="ks-section" hash="Fgf" data-ks-hash="Fgf">
  <h2 class="ks-section-title">Governed form</h2>
  <p class="forge-support mb-3">Form controller with submit-time error summary (<code>DET.FORM.LABEL_ERROR_SUMMARY</code>).</p>
  <div id="demo-governed-form"></div>
</section>

<section id="sec-eac-async" class="ks-section" hash="Fao" data-ks-hash="Fao">
  <h2 class="ks-section-title">Async operation</h2>
  <p class="forge-support mb-3">Operational banner, progress bar, and freshness region.</p>
  <div id="demo-async-operation"></div>
  <p class="mt-2"><button type="button" class="btn btn-sm btn-outline-primary" id="demo-async-run">Simulate run</button></p>
</section>

<section id="sec-eac-record" class="ks-section" hash="Frw" data-ks-hash="Frw">
  <h2 class="ks-section-title">Record workspace</h2>
  <p class="forge-support mb-3">Complete job shell: header, metadata, stage, timeline, main + inspector split.</p>
  <div id="demo-record-workspace"></div>
</section>

<section id="sec-eac-permission" class="ks-section" hash="Fpb" data-ks-hash="Fpb">
  <h2 class="ks-section-title">Permission boundary</h2>
  <p class="forge-support mb-3">Access reason notice with read-only field group (badge ≠ ACL).</p>
  <div id="demo-permission-boundary"></div>
</section>

<section id="sec-eac-persistent" class="ks-section" hash="Fpw" data-ks-hash="Fpw">
  <h2 class="ks-section-title">Persistent workspace</h2>
  <p class="forge-support mb-3">Autosave, draft recovery, saved views, recent items (<code>DET.APP.WORK_STATE_PERSISTENCE</code>).</p>
  <div id="demo-persistent-workspace"></div>
</section>

<section id="sec-eac-inspection" class="ks-section" hash="Fix" data-ks-hash="Fix">
  <h2 class="ks-section-title">Inspection workspace</h2>
  <p class="forge-support mb-3">Main + inspector with assignment, comments, and handoff summary.</p>
  <div id="demo-inspection-workspace"></div>
</section>

<section id="sec-eac-adaptive" class="ks-section" hash="Faw" data-ks-hash="Faw">
  <h2 class="ks-section-title">Adaptive workspace</h2>
  <p class="forge-support mb-3">Guided / standard / expert modes with help, shortcuts, templates, and smart defaults.</p>
  <div id="demo-adaptive-workspace"></div>
</section>

<section id="sec-eac-metrics" class="ks-section" hash="Fwm" data-ks-hash="Fwm">
  <h2 class="ks-section-title">Workflow metrics</h2>
  <p class="forge-support mb-3">Role-scoped KPI cards with <code>data-telemetry-schema="forge-workflow-v1"</code>.</p>
  <div id="demo-workflow-metrics"></div>
</section>

<section id="sec-eac-ai" class="ks-section" hash="Fai" data-ks-hash="Fai">
  <h2 class="ks-section-title">AI suggestion review</h2>
  <p class="forge-support mb-3">Label, provenance, confidence, accept/reject/revert (<code>DET.APP.AI_PROVENANCE</code>).</p>
  <div id="demo-ai-suggestion-review"></div>
</section>

<section id="sec-eac-jobs" class="ks-section" hash="Fjc" data-ks-hash="Fjc">
  <h2 class="ks-section-title">Job center</h2>
  <p class="forge-support mb-3">Long-running jobs with freshness and retry.</p>
  <div id="demo-job-center"></div>
</section>

<section id="sec-eac-impact" class="ks-section" hash="Fip" data-ks-hash="Fip">
  <h2 class="ks-section-title">Impact preview</h2>
  <p class="forge-support mb-3">Before/after impact list with confirmation guard.</p>
  <div id="demo-impact-preview"></div>
</section>

<section id="sec-eac-toast" class="ks-section" hash="Fut" data-ks-hash="Fut">
  <h2 class="ks-section-title">Undo toast</h2>
  <p class="forge-support mb-3">Transient result with undo action (<code>DET.APP.TOAST_LIFECYCLE</code>).</p>
  <button type="button" class="btn btn-sm btn-primary" id="demo-undo-toast-btn">Show undo toast</button>
</section>

<section id="sec-eac-grid" class="ks-section" hash="Feg" data-ks-hash="Feg">
  <h2 class="ks-section-title">Editable grid adapter</h2>
  <p class="forge-support mb-3">Governed inline edit — do not patch <code>createDataTable</code> ad hoc.</p>
  <div id="demo-editable-grid"></div>
</section>

<section id="sec-eac-support" class="ks-section">
  <h2 class="ks-section-title">Supporting primitives</h2>
  <p class="forge-support mb-3">Result receipt, version history, read-only fields, role presets.</p>
  <div class="row g-3">
    <div class="col-md-6" id="demo-result-receipt"></div>
    <div class="col-md-6" id="demo-version-history"></div>
    <div class="col-md-6" id="demo-readonly-fields"></div>
    <div class="col-md-6" id="demo-role-preset"></div>
  </div>
</section>

<script type="module">
import { createQueueWorkbench } from "./assets/ks-queue-workbench.js";
import { createGovernedForm } from "./assets/ks-governed-form.js";
import { createAsyncOperation } from "./assets/ks-async-operation.js";
import { createRecordWorkspace } from "./assets/ks-record-workspace.js";
import { createPermissionBoundary } from "./assets/ks-permission-boundary.js";
import { createUndoToast } from "./assets/ks-undo-toast.js";
import { createEditableGridAdapter } from "./assets/ks-editable-grid-adapter.js";
import { createPersistentWorkspace } from "./assets/ks-persistent-workspace.js";
import { createInspectionWorkspace } from "./assets/ks-inspection-workspace.js";
import { createAdaptiveWorkspace } from "./assets/ks-adaptive-workspace.js";
import { createWorkflowMetrics } from "./assets/ks-workflow-metrics.js";
import { createAISuggestionReview } from "./assets/ks-ai-suggestion-review.js";
import { createJobCenter } from "./assets/ks-job-center.js";
import { createImpactPreview } from "./assets/ks-impact-preview.js";
import { createResultReceipt } from "./assets/ks-result-receipt.js";
import { createVersionHistory } from "./assets/ks-version-history.js";
import { createReadOnlyFieldGroup } from "./assets/ks-readonly-field-group.js";
import { createRolePreset } from "./assets/ks-role-preset.js";

const queueRows = [
  { id: "q-101", title: "Review Q4 filing", owner: "Alex", status: "open", risk: "high" },
  { id: "q-102", title: "Approve vendor change", owner: "Sam", status: "blocked", risk: "medium" },
  { id: "q-103", title: "Reconcile ledger batch", owner: "Riley", status: "open", risk: "low" },
  { id: "q-104", title: "Escalate access request", owner: "Jordan", status: "open", risk: "high" },
];

createQueueWorkbench(document.getElementById("demo-queue-workbench"), {
  savedViews: [
    { id: "mine", name: "Mine" },
    { id: "high", name: "High risk", shared: true },
  ],
  filters: [{
    id: "status",
    label: "Status",
    options: [
      { value: "open", label: "Open" },
      { value: "blocked", label: "Blocked" },
    ],
  }],
  columns: [
    { key: "title", label: "Title", sortable: true, selectable: true },
    { key: "owner", label: "Owner", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "risk", label: "Risk", sortable: true },
  ],
  fetchRows: (state) => {
    let rows = queueRows.slice();
    if (state.q) {
      const q = state.q.toLowerCase();
      rows = rows.filter((r) => r.title.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q));
    }
    if (state.filters?.status) rows = rows.filter((r) => r.status === state.filters.status);
    if (state.viewId === "high") rows = rows.filter((r) => r.risk === "high");
    rows.sort((a, b) => String(a[state.sort]).localeCompare(String(b[state.sort])));
    if (state.order === "desc") rows.reverse();
    return { rows, total: rows.length };
  },
  pageSize: 3,
});

createGovernedForm(document.getElementById("demo-governed-form"), {
  fieldLabels: { cost_center: "Cost center", amount: "Amount" },
  formHtml: `
    <form class="forge-form">
      <div class="mb-3">
        <label class="form-label" for="cost_center">Cost center</label>
        <input class="form-control" id="cost_center" name="cost_center" required />
      </div>
      <div class="mb-3">
        <label class="form-label" for="amount">Amount</label>
        <input class="form-control" id="amount" name="amount" inputmode="decimal" />
      </div>
    </form>`,
  validate: (values) => {
    const errors = {};
    if (!values.cost_center) errors.cost_center = "Cost center is required";
    const amt = Number(values.amount);
    if (!values.amount || Number.isNaN(amt) || amt <= 0) errors.amount = "Enter a positive number";
    return errors;
  },
  onSubmit: (values) => {
    createUndoToast({ message: `Submitted ${values.cost_center} for ${values.amount}`, undoLabel: "Undo", onUndo: () => {} });
  },
});

const asyncOp = createAsyncOperation(document.getElementById("demo-async-operation"), {
  title: "Harvest pipeline idle",
  status: "idle",
  detail: "No active jobs.",
  updatedAt: new Date().toISOString(),
  onRefresh: () => asyncOp.setState({ updatedAt: new Date().toISOString() }),
});

document.getElementById("demo-async-run").addEventListener("click", async () => {
  asyncOp.setState({ status: "running", title: "Harvesting filings", detail: "Batch 2 of 5", percent: 10 });
  for (let p = 20; p <= 100; p += 20) {
    await new Promise((r) => setTimeout(r, 400));
    asyncOp.setState({ percent: p, detail: `Batch ${p / 20} of 5` });
  }
  asyncOp.setState({ status: "success", title: "Harvest complete", detail: "42 records updated.", percent: 100 });
});

createRecordWorkspace(document.getElementById("demo-record-workspace"), {
  title: "Vendor change request",
  subtitle: "REQ-8842 · Awaiting approval",
  badges: ["Draft", "High risk"],
  metadataHtml: '<dl class="ks-fe-kvgrid ks-fe-kvgrid--dense"><div class="ks-fe-kvgrid__row"><dt class="ks-fe-kvgrid__label">Owner</dt><dd class="ks-fe-kvgrid__value">Alex Lead</dd></div></dl>',
  stageHtml: '<div class="ks-fe-stagebar"><ol class="ks-fe-stagebar__list"><li class="ks-fe-stagebar__step is-done">Submitted</li><li class="ks-fe-stagebar__step is-current">Review</li><li class="ks-fe-stagebar__step">Approved</li></ol></div>',
  timelineHtml: '<p class="forge-support mb-0">Submitted · Review assigned · Comment added</p>',
  mainHtml: '<p class="mb-0">Primary record content and evidence attachments.</p>',
  inspectorHtml: '<p class="forge-support mb-0">Object inspector: impact summary and linked policies.</p>',
});

createPermissionBoundary(document.getElementById("demo-permission-boundary"), {
  mode: "read-only",
  reason: "You can view this record but cannot edit amounts without Approver role.",
  actionLabel: "Request access",
  onAction: () => alert("Access request flow (demo)"),
  demo: true,
  contentHtml: `
    <form>
      <div class="mb-2"><label class="form-label">Vendor</label><input class="form-control" value="ACME Corp" /></div>
      <div class="mb-2"><label class="form-label">Amount</label><input class="form-control" value="12000" /></div>
    </form>`,
});

createPersistentWorkspace(document.getElementById("demo-persistent-workspace"), {
  title: "Filing draft workspace",
  autosaveState: "saved",
  lastSavedAt: new Date().toISOString(),
  storageKey: "ks-demo-persistent-view",
  drafts: [{ id: "d1", title: "Q4 filing draft", updatedAt: "2026-08-12T18:00:00Z" }],
  savedViews: [
    { id: "mine", name: "Mine", active: true },
    { id: "team", name: "Team", shared: true },
  ],
  recentItems: [
    { id: "r1", label: "REQ-8842" },
    { id: "r2", label: "Vendor ACME" },
  ],
  mainHtml: '<p class="mb-0">Editable work area — state survives navigation via autosave and drafts.</p><textarea class="form-control mt-2" rows="3">Draft body…</textarea>',
});

createInspectionWorkspace(document.getElementById("demo-inspection-workspace"), {
  title: "Exception review",
  subtitle: "EXC-220 · Compare evidence before decision",
  mainHtml: "<p>Primary evidence and diff review content.</p>",
  inspectorTitle: "Inspector",
  inspectorHtml: "<p class='forge-support'>Linked policies and prior decisions.</p>",
  assignment: { assignee: "Alex", options: ["Alex", "Sam", "Riley"] },
  comments: [{ id: "c1", author: "Sam", body: "Needs finance sign-off.", at: "2026-08-12T10:00:00Z" }],
  handoff: { summary: "Ready for approver queue", to: "Approvers", status: "pending" },
});

createAdaptiveWorkspace(document.getElementById("demo-adaptive-workspace"), {
  title: "Onboarding workspace",
  mode: "guided",
  guidedHtml: "<p>Step-by-step guided path with explanations.</p>",
  standardHtml: "<p>Standard form density for daily operators.</p>",
  expertHtml: "<p>Dense expert controls and keyboard-first actions.</p>",
  helpTopics: [{ id: "h1", title: "What is a cost center?", body: "A cost center groups spend for approval routing." }],
  shortcuts: [{ keys: "Ctrl+S", action: "save", label: "Save draft" }],
  templates: [{ id: "t1", name: "Vendor intake", description: "Pre-filled vendor change fields" }],
  smartDefaults: [{ field: "Region", value: "EMEA", reason: "Based on your last 5 filings" }],
});

createWorkflowMetrics(document.getElementById("demo-workflow-metrics"), {
  title: "Queue outcomes",
  role: "Approver",
  metrics: [
    { id: "m1", label: "Median cycle time", value: "4.2", unit: "h", trend: "down", actionLabel: "Drill down" },
    { id: "m2", label: "First-pass yield", value: "87", unit: "%", trend: "up", actionLabel: "Open" },
    { id: "m3", label: "Escalations", value: "6", unit: "", trend: "flat", actionLabel: "Review" },
  ],
});

createAISuggestionReview(document.getElementById("demo-ai-suggestion-review"), {
  suggestionHtml: "<p>Suggested risk tier: <strong>High</strong> based on vendor concentration.</p>",
  provenance: { source: "Forge Intelligence", model: "gpt-pro", promptId: "risk-tier-v2", generatedAt: new Date().toISOString() },
  confidence: 0.82,
  status: "pending",
});

createJobCenter(document.getElementById("demo-job-center"), {
  jobs: [
    { id: "j1", title: "Nightly harvest", status: "running", percent: 45, updatedAt: new Date().toISOString(), detail: "Batch 3/8" },
    { id: "j2", title: "Export pack", status: "error", percent: 100, updatedAt: new Date().toISOString(), detail: "S3 timeout" },
  ],
  onRefresh: () => {},
  onRetry: () => {},
});

createImpactPreview(document.getElementById("demo-impact-preview"), {
  title: "Approve vendor change",
  impacts: [
    { label: "Approval limit", before: "$5k", after: "$25k", severity: "high" },
    { label: "Watchlist", before: "None", after: "Finance review", severity: "medium" },
  ],
  confirmLabel: "Confirm change",
  cancelLabel: "Cancel",
});

document.getElementById("demo-undo-toast-btn").addEventListener("click", () => {
  createUndoToast({ message: "3 items archived", undoLabel: "Undo", onUndo: () => {} });
});

createEditableGridAdapter(document.getElementById("demo-editable-grid"), {
  columns: [
    { key: "sku", label: "SKU", editable: false },
    { key: "qty", label: "Qty", editable: true, validate: (v) => (Number(v) > 0 ? null : "Qty must be positive") },
  ],
  rows: [
    { sku: "WID-01", qty: "4" },
    { sku: "WID-02", qty: "12" },
  ],
});

createResultReceipt(document.getElementById("demo-result-receipt"), {
  title: "Submission receipt",
  detail: "REQ-8842 accepted for review · Owner: Alex · SLA: 2 business days",
  status: "success",
});

createVersionHistory(document.getElementById("demo-version-history"), {
  versions: [
    { id: "v3", label: "v3 · Alex", at: "2026-08-12T12:00:00Z", author: "Alex" },
    { id: "v2", label: "v2 · Sam", at: "2026-08-11T09:00:00Z", author: "Sam" },
  ],
});

createReadOnlyFieldGroup(document.getElementById("demo-readonly-fields"), {
  title: "Amount locked by policy",
  fields: [
    { label: "Vendor", value: "ACME Corp" },
    { label: "Amount", value: "$12,000" },
  ],
});

createRolePreset(document.getElementById("demo-role-preset"), {
  role: "Analyst",
  presets: ["Analyst", "Approver", "Admin"],
});
</script>
"""
