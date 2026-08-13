"""Enterprise app compositions — Phase B P0 workbenches (ENT.APP.04–06)."""
from __future__ import annotations

PAGE = {
    "slug": "enterprise-app-compositions",
    "title": "Enterprise app compositions",
    "intro": (
        "Governed operator workbenches: <code>ForgeQueueWorkbench</code>, "
        "<code>ForgeGovernedForm</code>, <code>ForgeAsyncOperation</code>, "
        "<code>ForgeRecordWorkspace</code>, and <code>ForgePermissionBoundary</code>. "
        "See <code>docs/design/enterprise-app/</code> and "
        "<code>docs/design/forge-enterprise-app-ux-standard.md</code>."
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
        ("sec-eac-toast", "Undo toast"),
        ("sec-eac-grid", "Editable grid adapter"),
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

<script type="module">
import { createQueueWorkbench } from "./assets/ks-queue-workbench.js";
import { createGovernedForm } from "./assets/ks-governed-form.js";
import { createAsyncOperation } from "./assets/ks-async-operation.js";
import { createRecordWorkspace } from "./assets/ks-record-workspace.js";
import { createPermissionBoundary } from "./assets/ks-permission-boundary.js";
import { createUndoToast } from "./assets/ks-undo-toast.js";
import { createEditableGridAdapter } from "./assets/ks-editable-grid-adapter.js";

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
</script>
"""
