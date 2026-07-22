"""Data tables — filter toolbar, sortable table, org tree table demos."""
from __future__ import annotations

PAGE = {
    "slug": "data-tables",
    "title": "Data tables",
    "intro": "Filter toolbar, paginated data table, and org-unit tree table primitives.",
    "family": "Components",
    "layout": "showcase",
    "order": 8,
    "toc": [
        ("sec-dt-filter", "Filter toolbar"),
        ("sec-dt-table", "Data table"),
        ("sec-dt-org-tree", "Org tree table"),
        ("sec-dt-tree-combobox", "Tree combobox"),
    ],
}


def extra_css() -> str:
    return '<link rel="stylesheet" href="assets/forge-data-table.css">'


def extra_js_paths() -> list[str]:
    return [
        "assets/ks-filter-toolbar.js",
        "assets/ks-data-table.js",
        "assets/ks-org-tree-table.js",
        "assets/ks-tree-combobox.js",
    ]


def render() -> str:
    return """\
<section id="sec-dt-filter" class="ks-section" hash="Ftb" data-ks-hash="Ftb">
  <h2 class="ks-section-title">Filter toolbar</h2>
  <p class="forge-support mb-3">Search input, select filters, and removable chips. Emits debounced state for server queries.</p>
  <div id="demo-filter-toolbar"></div>
  <pre id="demo-filter-state" class="forge-support mt-2"></pre>
</section>

<section id="sec-dt-table" class="ks-section" hash="Dtb" data-ks-hash="Dtb">
  <h2 class="ks-section-title">Data table</h2>
  <p class="forge-support mb-3">Sortable headers with <code>aria-sort</code>, responsive scroll wrapper, and pagination.</p>
  <div id="demo-data-table"></div>
</section>

<section id="sec-dt-org-tree" class="ks-section" hash="Ott" data-ks-hash="Ott">
  <h2 class="ks-section-title">Org tree table</h2>
  <p class="forge-support mb-3">Expandable org-unit rows with lazy-loaded user pages per branch.</p>
  <div id="demo-org-tree-table"></div>
</section>

<section id="sec-dt-tree-combobox" class="ks-section" hash="Tcb" data-ks-hash="Tcb">
  <h2 class="ks-section-title">Tree combobox</h2>
  <p class="forge-support mb-3">Searchable combobox with org-tree browse for person or org-unit pickers.</p>
  <div id="demo-tree-combobox"></div>
</section>

<script type="module">
import { createFilterToolbar } from "./assets/ks-filter-toolbar.js";
import { createDataTable } from "./assets/ks-data-table.js";
import { createOrgTreeTable } from "./assets/ks-org-tree-table.js";
import { createTreeCombobox } from "./assets/ks-tree-combobox.js";

const tenants = [
  { slug: "acme", display_name: "ACME Corp", status: "active", created_at: "2026-01-12" },
  { slug: "globex", display_name: "Globex", status: "active", created_at: "2026-02-03" },
  { slug: "initech", display_name: "Initech", status: "suspended", created_at: "2025-11-20" },
  { slug: "umbrella", display_name: "Umbrella", status: "active", created_at: "2026-03-01" },
];

let tableState = { q: "", status: "", sort: "slug", order: "asc", page: 1 };

function paintTenantTable() {
  let rows = tenants.slice();
  if (tableState.q) {
    const q = tableState.q.toLowerCase();
    rows = rows.filter((r) => r.slug.includes(q) || r.display_name.toLowerCase().includes(q));
  }
  if (tableState.status) rows = rows.filter((r) => r.status === tableState.status);
  rows.sort((a, b) => {
    const av = a[tableState.sort];
    const bv = b[tableState.sort];
    const cmp = String(av).localeCompare(String(bv));
    return tableState.order === "asc" ? cmp : -cmp;
  });
  const pageSize = 2;
  const total = rows.length;
  const pageRows = rows.slice((tableState.page - 1) * pageSize, tableState.page * pageSize);
  createDataTable(document.getElementById("demo-data-table"), {
    columns: [
      { key: "slug", label: "Slug", sortable: true },
      { key: "display_name", label: "Name", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "created_at", label: "Created", sortable: true },
    ],
    rows: pageRows,
    sort: tableState.sort,
    order: tableState.order,
    page: tableState.page,
    pageSize,
    total,
    onSort: (sort, order) => { tableState.sort = sort; tableState.order = order; tableState.page = 1; paintTenantTable(); },
    onPageChange: (page) => { tableState.page = page; paintTenantTable(); },
  });
}

createFilterToolbar(document.getElementById("demo-filter-toolbar"), {
  id: "ks-demo-ftb",
  searchPlaceholder: "Search tenants…",
  filters: [{
    id: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "suspended", label: "Suspended" },
    ],
  }],
  debounceMs: 200,
  onChange: (state) => {
    tableState.q = state.q;
    tableState.status = state.filters.status || "";
    tableState.page = 1;
    document.getElementById("demo-filter-state").textContent = JSON.stringify(state, null, 2);
    paintTenantTable();
  },
});

paintTenantTable();

const orgUnits = [
  { id: 1, name: "Company", parent_id: null, direct_user_count: 0, total_user_count: 5 },
  { id: 2, name: "Engineering", parent_id: 1, direct_user_count: 1, total_user_count: 3 },
  { id: 3, name: "Platform", parent_id: 2, direct_user_count: 2, total_user_count: 2 },
  { id: 4, name: "People", parent_id: 1, direct_user_count: 2, total_user_count: 2 },
];
const usersByOrg = {
  2: [{ display_name: "Alex Lead", email: "alex@acme.test" }],
  3: [
    { display_name: "Sam Dev", email: "sam@acme.test" },
    { display_name: "Riley Dev", email: "riley@acme.test" },
  ],
  4: [
    { display_name: "Jordan HR", email: "jordan@acme.test" },
    { display_name: "Casey HR", email: "casey@acme.test" },
  ],
  unassigned: [{ display_name: "No Org", email: "orphan@acme.test" }],
};

createOrgTreeTable(document.getElementById("demo-org-tree-table"), {
  orgUnits,
  unassignedCount: 1,
  userColumns: [
    { key: "display_name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
  ],
  onLoadUsers: async (orgUnitId, params) => {
    const key = orgUnitId == null ? "unassigned" : String(orgUnitId);
    let items = (usersByOrg[key] || []).slice();
    if (params.sort) {
      items.sort((a, b) => String(a[params.sort]).localeCompare(String(b[params.sort])));
      if (params.order === "desc") items.reverse();
    }
    const pageSize = params.page_size || 25;
    const total = items.length;
    const start = (params.page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total };
  },
});

createTreeCombobox(document.getElementById("demo-tree-combobox"), {
  id: "ks-demo-tcb",
  label: "HR contact",
  placeholder: "Search by name or team…",
  orgUnits,
  items: [
    { id: 10, label: "Jordan HR", subtitle: "jordan@acme.test", org_unit_id: 4, org_path: ["Company", "People"] },
    { id: 11, label: "Casey HR", subtitle: "casey@acme.test", org_unit_id: 4, org_path: ["Company", "People"] },
    { id: 12, label: "Alex Lead", subtitle: "alex@acme.test", org_unit_id: 2, org_path: ["Company", "Engineering"] },
  ],
  groupLabel: "Browse by organization",
  onChange: (item) => console.log("selected", item),
});
</script>
"""
