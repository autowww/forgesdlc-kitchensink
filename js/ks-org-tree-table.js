/**
 * KS org tree table — expandable org-unit rows with lazy-loaded user pages.
 * @module ks-org-tree-table
 */

import { createDataTable } from "./ks-data-table.js";

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

function childrenByParent(units) {
  const byParent = new Map();
  units.forEach((u) => {
    const key = u.parent_id == null ? "root" : String(u.parent_id);
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(u);
  });
  return byParent;
}

function buildOrgForest(units) {
  const byParent = childrenByParent(units);
  function walk(parentKey, depth) {
    return (byParent.get(parentKey) || []).flatMap((unit) => [
      { unit, depth },
      ...walk(String(unit.id), depth + 1),
    ]);
  }
  return walk("root", 0);
}

function childOrgCount(unitId, byParent) {
  return (byParent.get(String(unitId)) || []).length;
}

/**
 * @param {HTMLElement} container
 * @param {object} options
 */
export function createOrgTreeTable(container, options) {
  const expanded = options.expanded || new Set();
  const pageSize = options.pageSize || 25;
  const userPages = new Map();
  const byParent = childrenByParent(options.orgUnits);
  const isTable = options.layout === "table";
  const selectedIds = options.selectedIds || new Set();

  if (!options.expanded && options.orgOnly) {
    (byParent.get("root") || []).forEach((u) => expanded.add(String(u.id)));
  }

  container.innerHTML = "";
  const root = el("div", "forge-org-tree-table", {
    hash: "Ott",
    "data-ks-hash": "Ott",
    "data-ks-type": "component",
    "data-ks-name": "org-tree-table",
    role: "tree",
    "aria-label": "Organization directory",
  });
  if (isTable) root.classList.add("forge-org-tree-table--layout-table");

  async function paintUsers(host, orgUnitId) {
    const key = orgUnitId == null ? "unassigned" : String(orgUnitId);
    if (!userPages.has(key)) {
      userPages.set(key, { page: 1, sort: options.sort, order: options.order });
    }
    const paging = userPages.get(key);
    host.innerHTML = '<p class="hint">Loading users…</p>';
    try {
      const result = await options.onLoadUsers(orgUnitId, {
        page: paging.page,
        sort: paging.sort,
        order: paging.order,
        page_size: pageSize,
      });
      host.innerHTML = "";
      createDataTable(host, {
        columns: options.userColumns,
        rows: result.items,
        sort: paging.sort,
        order: paging.order,
        page: paging.page,
        pageSize,
        total: result.total,
        emptyMessage: "No users in this org unit.",
        onSort: (sort, order) => {
          paging.sort = sort;
          paging.order = order;
          paging.page = 1;
          if (options.onUserSort) options.onUserSort(orgUnitId, sort, order);
          paintUsers(host, orgUnitId);
        },
        onPageChange: (page) => {
          paging.page = page;
          paintUsers(host, orgUnitId);
        },
      });
    } catch (err) {
      host.innerHTML = `<p class="callout warn">${err.message || "Failed to load users"}</p>`;
    }
  }

  function appendToggleCell(parent, unit, key, isUnassigned, hasChildOrgs, hasUsers) {
    const canExpand = options.orgOnly ? hasChildOrgs : hasUsers > 0;
    if (canExpand) {
      const isExpanded = expanded.has(key);
      const toggle = el("button", "forge-org-tree-toggle", {
        type: "button",
        "aria-label": isExpanded ? "Collapse" : "Expand",
        "aria-expanded": isExpanded ? "true" : "false",
      });
      toggle.textContent = isExpanded ? "−" : "+";
      toggle.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (isExpanded) expanded.delete(key);
        else expanded.add(key);
        if (options.onToggle) options.onToggle(isUnassigned ? null : unit.id, !isExpanded);
        render();
      });
      parent.appendChild(toggle);
    } else {
      parent.appendChild(el("span", "forge-org-tree-toggle-spacer", { "aria-hidden": "true" }));
    }
  }

  function renderOrgRowCells(row, unit, depth, isUnassigned) {
    const id = isUnassigned ? null : unit.id;
    const key = isUnassigned ? "unassigned" : String(id);
    const hasChildOrgs = !isUnassigned && childOrgCount(unit.id, byParent) > 0;
    const count = isUnassigned ? options.unassignedCount || 0 : unit.direct_user_count ?? 0;
    const total = isUnassigned ? count : unit.total_user_count ?? count;
    const hasUsers = count;

    const toggleWrap = el("div", "forge-org-tree-cell forge-org-tree-cell--toggle");
    toggleWrap.style.paddingLeft = `${depth * 1.25}rem`;
    appendToggleCell(toggleWrap, unit, key, isUnassigned, hasChildOrgs, hasUsers);
    row.appendChild(toggleWrap);

    if (options.renderOrgCheckbox && !isUnassigned) {
      const cbCell = el("div", "forge-org-tree-cell forge-org-tree-cell--check");
      const cb = options.renderOrgCheckbox(unit, selectedIds.has(unit.id));
      if (cb) cbCell.appendChild(cb);
      row.appendChild(cbCell);
    }

    const nameCell = el("div", "forge-org-tree-cell forge-org-tree-cell--name");
    nameCell.textContent = isUnassigned ? "Unassigned" : unit.name;
    row.appendChild(nameCell);

    const peopleCell = el("div", "forge-org-tree-cell forge-org-tree-cell--people");
    peopleCell.textContent = options.orgOnly
      ? `${total} in subtree`
      : `${count} direct · ${total} total`;
    row.appendChild(peopleCell);

    if (options.renderOrgHr) {
      const hrCell = el("div", "forge-org-tree-cell forge-org-tree-cell--hr");
      const hr = options.renderOrgHr(unit);
      if (hr) hrCell.appendChild(hr);
      row.appendChild(hrCell);
    }

    if (options.renderOrgActions && !isUnassigned) {
      const actCell = el("div", "forge-org-tree-cell forge-org-tree-cell--actions");
      const actions = options.renderOrgActions(unit);
      if (actions) actCell.appendChild(actions);
      row.appendChild(actCell);
    }

    return { key, id, isExpanded: expanded.has(key) };
  }

  function renderOrgRowFlat({ unit, depth }, isUnassigned = false) {
    const id = isUnassigned ? null : unit.id;
    const key = isUnassigned ? "unassigned" : String(id);
    const isExpanded = expanded.has(key);
    const hasChildOrgs = !isUnassigned && childOrgCount(unit.id, byParent) > 0;
    const count = isUnassigned ? options.unassignedCount || 0 : unit.direct_user_count ?? 0;
    const total = isUnassigned ? count : unit.total_user_count ?? count;

    const li = el("li", null, {
      role: "treeitem",
      "aria-expanded": isExpanded ? "true" : "false",
    });
    const row = el("div", "forge-org-tree-row forge-org-tree-row--org");
    row.style.paddingLeft = `${depth * 1.25 + 0.65}rem`;

    const canExpand = options.orgOnly ? hasChildOrgs : count > 0;
    if (canExpand) {
      const toggle = el("button", "forge-org-tree-toggle", {
        type: "button",
        "aria-label": isExpanded ? "Collapse" : "Expand",
        "aria-expanded": isExpanded ? "true" : "false",
      });
      toggle.textContent = isExpanded ? "−" : "+";
      toggle.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (isExpanded) expanded.delete(key);
        else expanded.add(key);
        if (options.onToggle) options.onToggle(id, !isExpanded);
        render();
      });
      row.appendChild(toggle);
    } else {
      row.appendChild(el("span", "forge-org-tree-toggle-spacer", { "aria-hidden": "true" }));
    }

    const name = el("span", "forge-org-tree-name");
    name.textContent = isUnassigned ? "Unassigned" : unit.name;
    row.appendChild(name);
    const meta = el("span", "forge-org-tree-meta");
    meta.textContent = options.orgOnly
      ? `${total} in subtree`
      : `${count} direct · ${total} total`;
    row.appendChild(meta);
    if (options.renderOrgActions && !isUnassigned) {
      const actions = options.renderOrgActions(unit);
      if (actions) row.appendChild(actions);
    }
    li.appendChild(row);

    if (options.orgOnly && isExpanded && hasChildOrgs) {
      const childList = el("ul", null, { role: "group" });
      (byParent.get(key) || []).forEach((child) => {
        childList.appendChild(renderOrgRowFlat({ unit: child, depth: depth + 1 }));
      });
      li.appendChild(childList);
    } else if (!options.orgOnly && isExpanded) {
      const usersHost = el("div", "forge-org-tree-users");
      li.appendChild(usersHost);
      paintUsers(usersHost, id);
    }
    return li;
  }

  function renderTableBody(host) {
    function walkUnits(parentKey, depth) {
      (byParent.get(parentKey) || []).forEach((unit) => {
        const row = el("div", "forge-org-tree-row forge-org-tree-row--org forge-org-tree-table-row");
        const { key } = renderOrgRowCells(row, unit, depth, false);
        host.appendChild(row);
        if (expanded.has(key) && childOrgCount(unit.id, byParent) > 0) {
          walkUnits(String(unit.id), depth + 1);
        }
      });
    }
    walkUnits("root", 0);
    if ((options.unassignedCount || 0) > 0) {
      const row = el("div", "forge-org-tree-row forge-org-tree-row--org forge-org-tree-table-row");
      renderOrgRowCells(row, { name: "Unassigned" }, 0, true);
      host.appendChild(row);
    }
  }

  function renderTableHeader() {
    const head = el("div", "forge-org-tree-table-head forge-org-tree-row");
    head.appendChild(el("div", "forge-org-tree-cell forge-org-tree-cell--toggle"));
    if (options.renderOrgCheckbox) {
      head.appendChild(el("div", "forge-org-tree-cell forge-org-tree-cell--check"));
    }
    const cols = [
      ["name", "Org unit"],
      ["people", "People"],
    ];
    if (options.renderOrgHr) cols.push(["hr", "HR"]);
    if (options.renderOrgActions) cols.push(["actions", "Actions"]);
    cols.forEach(([cls, label]) => {
      const cell = el("div", `forge-org-tree-cell forge-org-tree-cell--${cls}`);
      cell.textContent = label;
      head.appendChild(cell);
    });
    return head;
  }

  function render() {
    root.innerHTML = "";
    if (isTable) {
      root.appendChild(renderTableHeader());
      const body = el("div", "forge-org-tree-table-body", { role: "group" });
      renderTableBody(body);
      root.appendChild(body);
    } else {
      const list = el("ul", null, { role: "group" });
      if (options.orgOnly) {
        (byParent.get("root") || []).forEach((unit) => {
          list.appendChild(renderOrgRowFlat({ unit, depth: 0 }));
        });
      } else {
        buildOrgForest(options.orgUnits).forEach((entry) => {
          list.appendChild(renderOrgRowFlat(entry));
        });
      }
      if ((options.unassignedCount || 0) > 0) {
        list.appendChild(renderOrgRowFlat({ unit: { name: "Unassigned" }, depth: 0 }, true));
      }
      root.appendChild(list);
    }
    if (!container.contains(root)) container.appendChild(root);
  }

  render();
  return {
    refresh: (next) =>
      createOrgTreeTable(container, {
        ...options,
        ...next,
        expanded,
        selectedIds: next.selectedIds || selectedIds,
      }),
    expand: (orgUnitId) => {
      const key = orgUnitId == null ? "unassigned" : String(orgUnitId);
      expanded.add(key);
      render();
    },
    getSelectedIds: () => selectedIds,
  };
}
