/**
 * Governed editable grid adapter — read-only Dtb semantics with inline edit + validation.
 * @module ks-editable-grid-adapter
 */

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
 *   columns: Array<{ key: string, label: string, editable?: boolean, validate?: (value: string, row: object) => string|null }>,
 *   rows: object[],
 *   readOnly?: boolean,
 *   onCellEdit?: (rowIndex: number, key: string, value: string, row: object) => void,
 *   onValidationError?: (errors: Record<string, string>) => void,
 * }} options
 */
export function createEditableGridAdapter(container, options) {
  let destroyed = false;
  const columns = options.columns || [];
  let rows = (options.rows || []).map((r) => ({ ...r }));
  const readOnly = Boolean(options.readOnly);

  container.innerHTML = "";
  const root = el("div", "forge-editable-grid-host", {
    hash: "Feg",
    "data-ks-hash": "Feg",
    "data-ks-type": "component",
    "data-ks-name": "editable-grid-adapter",
    id: options.id || undefined,
  });

  const summary = el("div", "forge-editable-grid__summary", { role: "status", "aria-live": "polite" });
  const wrap = el("div", "forge-data-table-wrap");
  const table = el("table", "forge-data-table forge-editable-grid");
  const thead = el("thead");
  const headRow = el("tr");
  columns.forEach((col) => {
    const th = el("th", null, { scope: "col" });
    th.textContent = col.label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el("tbody");

  function paintSummary(msg) {
    summary.textContent = msg || "";
  }

  function paint() {
    tbody.innerHTML = "";
    rows.forEach((row, rowIndex) => {
      const tr = el("tr");
      columns.forEach((col) => {
        const td = el("td");
        const editable = !readOnly && col.editable;
        const value = row[col.key] == null ? "" : String(row[col.key]);
        if (editable) {
          const input = el("input", "form-control form-control-sm", {
            type: "text",
            value,
            "aria-label": `${col.label} row ${rowIndex + 1}`,
            "data-row": String(rowIndex),
            "data-key": col.key,
          });
          input.addEventListener("change", () => {
            if (destroyed) return;
            const next = input.value;
            const err = col.validate ? col.validate(next, row) : null;
            input.classList.toggle("is-invalid", Boolean(err));
            input.setAttribute("aria-invalid", err ? "true" : "false");
            if (err) {
              paintSummary(err);
              if (options.onValidationError) options.onValidationError({ [`${rowIndex}.${col.key}`]: err });
              return;
            }
            row[col.key] = next;
            paintSummary("");
            if (options.onCellEdit) options.onCellEdit(rowIndex, col.key, next, row);
          });
          td.appendChild(input);
        } else {
          td.textContent = value;
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  table.appendChild(tbody);
  wrap.appendChild(table);
  root.appendChild(summary);
  root.appendChild(wrap);
  container.appendChild(root);
  paint();

  return {
    getRows: () => rows.map((r) => ({ ...r })),
    setRows(next) {
      if (destroyed) return;
      rows = next.map((r) => ({ ...r }));
      paint();
    },
    refresh(next = {}) {
      if (destroyed) return;
      if (next.rows) {
        rows = next.rows.map((r) => ({ ...r }));
        paint();
      }
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
