/**
 * KS data table — sortable headers, pagination, responsive scroll wrapper.
 * @module ks-data-table
 */

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

function sortIndicator(order) {
  if (order === "asc") return "▲";
  if (order === "desc") return "▼";
  return "↕";
}

/**
 * @param {HTMLElement} container
 * @param {{
 *   id?: string,
 *   columns: Array<{ key: string, label: string, sortable?: boolean, render?: (value: unknown, row: object) => HTMLElement|string|number }>,
 *   rows?: object[],
 *   sort?: string,
 *   order?: 'asc'|'desc',
 *   page?: number,
 *   pageSize?: number,
 *   total?: number,
 *   emptyMessage?: string,
 *   onSort?: (sort: string, order: 'asc'|'desc') => void,
 *   onPageChange?: (page: number) => void,
 *   onRowClick?: (row: object) => void,
 * }} options
 */
export function createDataTable(container, options) {
  const columns = options.columns || [];
  const rows = options.rows || [];
  const page = options.page || 1;
  const pageSize = options.pageSize || 25;
  const total = options.total != null ? options.total : rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  container.innerHTML = "";
  const root = el("div", "forge-data-table-host", {
    hash: "Dtb",
    "data-ks-hash": "Dtb",
    "data-ks-type": "component",
    "data-ks-name": "data-table",
    id: options.id || undefined,
  });

  const wrap = el("div", "forge-data-table-wrap");
  const table = el("table", "forge-data-table");
  const thead = el("thead");
  const headRow = el("tr");
  columns.forEach((col) => {
    const th = el("th", null, { scope: "col" });
    if (col.sortable) {
      const current = options.sort === col.key ? options.order || "asc" : "none";
      th.setAttribute("aria-sort", current === "none" ? "none" : current === "asc" ? "ascending" : "descending");
      const btn = el("button", null, { type: "button" });
      btn.textContent = `${col.label} ${sortIndicator(current === "none" ? null : current)}`;
      btn.addEventListener("click", () => {
        if (!options.onSort) return;
        let nextOrder = "asc";
        if (options.sort === col.key && options.order === "asc") nextOrder = "desc";
        options.onSort(col.key, nextOrder);
      });
      th.appendChild(btn);
    } else {
      th.textContent = col.label;
    }
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el("tbody");
  if (!rows.length) {
    const tr = el("tr");
    const td = el("td", "forge-data-table__empty", { colspan: String(columns.length) });
    td.textContent = options.emptyMessage || "No rows to display.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    rows.forEach((row) => {
      const tr = el("tr");
      if (options.onRowClick) {
        tr.classList.add("clickable-row");
        tr.addEventListener("click", () => options.onRowClick(row));
      }
      columns.forEach((col, idx) => {
        const td = el("td");
        const val = row[col.key];
        if (col.render) {
          const rendered = col.render(val, row);
          if (rendered instanceof HTMLElement) {
            td.appendChild(rendered);
          } else {
            td.textContent = rendered == null ? "—" : String(rendered);
          }
        } else {
          td.textContent = val == null ? "—" : String(val);
        }
        if (idx === 0 && options.onRowClick) {
          td.classList.add("tenant-link-cell");
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
  table.appendChild(tbody);
  wrap.appendChild(table);
  root.appendChild(wrap);

  if (options.onPageChange && total > pageSize) {
    const footer = el("div", "forge-data-table__pagination");
    const summary = el("span", null);
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    summary.textContent = `Showing ${start}–${end} of ${total}`;
    footer.appendChild(summary);
    const nav = el("nav", null, { "aria-label": "Table pagination" });
    const prev = el("button", "btn btn-sm btn-outline-secondary", { type: "button" });
    prev.textContent = "Previous";
    prev.disabled = page <= 1;
    prev.addEventListener("click", () => options.onPageChange(page - 1));
    const next = el("button", "btn btn-sm btn-outline-secondary", { type: "button" });
    next.textContent = "Next";
    next.disabled = page >= totalPages;
    next.addEventListener("click", () => options.onPageChange(page + 1));
    const pageLabel = el("span", null);
    pageLabel.textContent = ` Page ${page} of ${totalPages} `;
    nav.appendChild(prev);
    nav.appendChild(pageLabel);
    nav.appendChild(next);
    footer.appendChild(nav);
    root.appendChild(footer);
  }

  container.appendChild(root);
  return { refresh: (next) => createDataTable(container, { ...options, ...next }) };
}
