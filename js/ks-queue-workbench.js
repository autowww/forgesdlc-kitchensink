/**
 * ForgeQueueWorkbench — filter toolbar + table + selection bar + saved views (ENT.APP.05).
 * @module ks-queue-workbench
 */

import { createFilterToolbar } from "./ks-filter-toolbar.js";
import { createDataTable } from "./ks-data-table.js";
import { createStickyActionBar } from "./ks-sticky-action-bar.js";

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

/**
 * @param {HTMLElement} container
 * @param {{
 *   id?: string,
 *   columns: object[],
 *   fetchRows: (state: object) => Promise<{ rows: object[], total: number }> | { rows: object[], total: number },
 *   filters?: object[],
 *   searchPlaceholder?: string,
 *   savedViews?: Array<{ id: string, name: string, shared?: boolean }>,
 *   bulkActions?: Array<{ id: string, label: string, variant?: string }>,
 *   pageSize?: number,
 *   onSelectionChange?: (ids: string[]) => void,
 *   onRowClick?: (row: object) => void,
 * }} options
 */
export function createQueueWorkbench(container, options) {
  let destroyed = false;
  const pageSize = options.pageSize || 25;
  let tableState = { q: "", filters: {}, sort: options.columns[0]?.key || "id", order: "asc", page: 1 };
  let selectedIds = new Set();
  let activeViewId = options.savedViews?.[0]?.id || null;
  let ftbApi = null;
  let sabApi = null;

  container.innerHTML = "";
  const root = el("div", "forge-queue-workbench", {
    hash: "Fqw",
    "data-ks-hash": "Fqw",
    "data-ks-type": "composition",
    "data-ks-name": "forge-queue-workbench",
    "data-studio-workspace": "queue",
    id: options.id || undefined,
  });

  const header = el("header", "forge-queue-workbench__header");
  const viewsRow = el("div", "forge-queue-workbench__views");
  if (options.savedViews?.length) {
    const viewsLabel = el("span", "forge-queue-workbench__views-label");
    viewsLabel.textContent = "Views";
    viewsRow.appendChild(viewsLabel);
    options.savedViews.forEach((view) => {
      const btn = el("button", "forge-queue-workbench__view-btn", { type: "button" });
      if (view.id === activeViewId) btn.classList.add("is-active");
      btn.textContent = view.name + (view.shared ? " (shared)" : "");
      btn.addEventListener("click", () => {
        activeViewId = view.id;
        viewsRow.querySelectorAll(".forge-queue-workbench__view-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        tableState.page = 1;
        paintTable();
      });
      viewsRow.appendChild(btn);
    });
    header.appendChild(viewsRow);
  }

  const freshness = el("div", "forge-queue-workbench__freshness", { role: "status" });
  freshness.textContent = "Loading…";
  header.appendChild(freshness);
  root.appendChild(header);

  const filterHost = el("div", "forge-queue-workbench__filters");
  root.appendChild(filterHost);

  const tableHost = el("div", "forge-queue-workbench__table");
  root.appendChild(tableHost);

  const sabHost = el("div", "forge-queue-workbench__sab");
  sabHost.hidden = true;
  root.appendChild(sabHost);

  container.appendChild(root);

  function paintSab() {
    const count = selectedIds.size;
    sabHost.hidden = count === 0;
    if (count === 0) {
      if (sabApi) sabApi.destroy();
      sabApi = null;
      return;
    }
    const actions = (options.bulkActions || [
      { id: "assign", label: "Assign", variant: "secondary" },
      { id: "export", label: "Export", variant: "secondary" },
    ]).map((a) => ({ ...a }));
    sabHost.innerHTML = "";
    const scope = el("p", "forge-queue-workbench__selection-count");
    scope.textContent = `${count} selected`;
    scope.setAttribute("aria-live", "polite");
    sabHost.appendChild(scope);
    const sabInner = el("div");
    sabHost.appendChild(sabInner);
    sabApi = createStickyActionBar(sabInner, {
      actions,
      onAction: (id) => {
        root.dispatchEvent(
          new CustomEvent("ks-queue-bulk", { detail: { actionId: id, selectedIds: [...selectedIds] }, bubbles: true })
        );
      },
    });
  }

  async function paintTable() {
    if (destroyed) return;
    freshness.textContent = "Refreshing…";
    const result = await Promise.resolve(
      options.fetchRows({
        ...tableState,
        viewId: activeViewId,
      })
    );
    if (destroyed) return;
    const now = new Date().toISOString();
    freshness.textContent = `Updated ${now}`;

    const rows = result.rows || [];
    const total = result.total != null ? result.total : rows.length;

    createDataTable(tableHost, {
      columns: options.columns.map((col) => ({
        ...col,
        render: col.selectable
          ? (val, row) => {
              const wrap = el("label", "forge-queue-workbench__check");
              const cb = el("input", null, { type: "checkbox" });
              const id = String(row.id ?? val);
              cb.checked = selectedIds.has(id);
              cb.addEventListener("change", () => {
                if (cb.checked) selectedIds.add(id);
                else selectedIds.delete(id);
                if (options.onSelectionChange) options.onSelectionChange([...selectedIds]);
                paintSab();
              });
              wrap.appendChild(cb);
              wrap.appendChild(document.createTextNode(" " + (val ?? "")));
              return wrap;
            }
          : col.render,
      })),
      rows,
      sort: tableState.sort,
      order: tableState.order,
      page: tableState.page,
      pageSize,
      total,
      onSort: (sort, order) => {
        tableState.sort = sort;
        tableState.order = order;
        tableState.page = 1;
        paintTable();
      },
      onPageChange: (page) => {
        tableState.page = page;
        paintTable();
      },
      onRowClick: options.onRowClick,
    });
  }

  ftbApi = createFilterToolbar(filterHost, {
    searchPlaceholder: options.searchPlaceholder || "Search queue…",
    filters: options.filters || [],
    debounceMs: 250,
    onChange: (state) => {
      tableState.q = state.q;
      tableState.filters = { ...state.filters };
      tableState.page = 1;
      paintTable();
    },
  });

  paintTable();

  return {
    getState: () => ({ ...tableState, selectedIds: [...selectedIds], activeViewId }),
    setSelection(ids) {
      selectedIds = new Set(ids);
      paintSab();
      paintTable();
    },
    refresh() {
      paintTable();
    },
    destroy() {
      destroyed = true;
      if (sabApi) sabApi.destroy();
      if (ftbApi) ftbApi = null;
      container.innerHTML = "";
    },
  };
}
