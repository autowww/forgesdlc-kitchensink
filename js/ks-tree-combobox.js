/**
 * KS tree combobox — searchable dropdown with org-tree browse or flat search results.
 * @module ks-tree-combobox
 */

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
  (units || []).forEach((u) => {
    const key = u.parent_id == null ? "root" : String(u.parent_id);
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(u);
  });
  return byParent;
}

function itemLabel(item) {
  return item.label || item.display_name || item.name || String(item.id);
}

function itemSubtitle(item) {
  return item.subtitle || item.email || "";
}

/**
 * @param {HTMLElement} container
 * @param {object} options
 */
export function createTreeCombobox(container, options = {}) {
  const state = {
    open: false,
    query: "",
    value: options.value ?? null,
    items: options.items || [],
    orgExpanded: new Set(),
  };
  const panelId = `${options.id || "tcb"}-panel`;
  const listId = `${options.id || "tcb"}-list`;
  const byParent = childrenByParent(options.orgUnits || []);
  (byParent.get("root") || []).forEach((u) => state.orgExpanded.add(String(u.id)));

  container.innerHTML = "";
  const inlinePanel = options.panelLayout === "inline";
  const root = el("div", "forge-tree-combobox", {
    hash: "Tcb",
    "data-ks-hash": "Tcb",
    "data-ks-type": "component",
    "data-ks-name": "tree-combobox",
  });
  if (inlinePanel) {
    root.classList.add("forge-tree-combobox--inline");
  }

  if (options.label) {
    const label = el("label", "forge-tree-combobox__label");
    label.textContent = options.label;
    root.appendChild(label);
  }

  const trigger = el("button", "forge-tree-combobox__trigger", {
    type: "button",
    role: "combobox",
    "aria-expanded": "false",
    "aria-controls": panelId,
    "aria-haspopup": "listbox",
  });
  const triggerText = el("span", "forge-tree-combobox__trigger-text");
  trigger.appendChild(triggerText);
  const chevron = el("span", null, { "aria-hidden": "true" });
  chevron.textContent = "▾";
  trigger.appendChild(chevron);
  root.appendChild(trigger);

  const panel = el("div", "forge-tree-combobox__panel", {
    id: panelId,
    hidden: "true",
  });
  const searchWrap = el("div", "forge-tree-combobox__search");
  const searchInput = el("input", null, {
    type: "search",
    placeholder: options.placeholder || "Search…",
    "aria-label": options.searchLabel || "Search",
    autocomplete: "off",
  });
  searchWrap.appendChild(searchInput);
  panel.appendChild(searchWrap);
  const list = el("div", "forge-tree-combobox__list", {
    id: listId,
    role: "listbox",
    "aria-label": options.panelAriaLabel || options.label || "Options",
  });
  panel.appendChild(list);
  root.appendChild(panel);
  container.appendChild(root);

  function selectedItem() {
    return state.items.find((i) => String(i.id) === String(state.value));
  }

  function paintTrigger() {
    triggerText.innerHTML = "";
    const sel = selectedItem();
    if (!sel) {
      const ph = el("span", null);
      ph.textContent = options.placeholder || "Select…";
      triggerText.appendChild(ph);
      return;
    }
    const title = el("span", null);
    title.textContent = itemLabel(sel);
    triggerText.appendChild(title);
    const sub = itemSubtitle(sel);
    if (sub) {
      const sm = el("small", null);
      sm.textContent = sub;
      triggerText.appendChild(sm);
    }
  }

  function makeOption(item, breadcrumb) {
    const btn = el("button", "forge-tree-combobox__option", {
      type: "button",
      role: "option",
      "aria-selected": String(item.id) === String(state.value) ? "true" : "false",
    });
    const title = el("span", null);
    title.textContent = itemLabel(item);
    btn.appendChild(title);
    const sub = itemSubtitle(item);
    if (sub) {
      const sm = el("small", null);
      sm.textContent = sub;
      btn.appendChild(sm);
    }
    if (breadcrumb) {
      const bc = el("span", "forge-tree-combobox__breadcrumb");
      bc.textContent = breadcrumb;
      btn.appendChild(bc);
    }
    btn.addEventListener("click", () => {
      state.value = item.id;
      state.open = false;
      paintTrigger();
      closePanel();
      if (options.onChange) options.onChange(item);
    });
    return btn;
  }

  function itemsForOrg(orgId) {
    return state.items.filter((i) => String(i.org_unit_id) === String(orgId));
  }

  function filterItems() {
    const q = state.query.trim().toLowerCase();
    if (!q) return null;
    return state.items.filter((item) => {
      const label = itemLabel(item).toLowerCase();
      const sub = itemSubtitle(item).toLowerCase();
      const path = (item.org_path || []).join(" ").toLowerCase();
      return label.includes(q) || sub.includes(q) || path.includes(q);
    });
  }

  function renderOrgBranch(orgUnit, depth) {
    const frag = document.createDocumentFragment();
    const key = String(orgUnit.id);
    const kids = byParent.get(key) || [];
    const people = itemsForOrg(orgUnit.id);
    const row = el("div", "forge-tree-combobox__org-row");
    row.style.paddingLeft = `${depth * 0.85 + 0.35}rem`;
    if (kids.length) {
      const expanded = state.orgExpanded.has(key);
      const toggle = el("button", "forge-org-tree-toggle", {
        type: "button",
        "aria-label": expanded ? "Collapse" : "Expand",
      });
      toggle.textContent = expanded ? "−" : "+";
      toggle.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (expanded) state.orgExpanded.delete(key);
        else state.orgExpanded.add(key);
        paintList();
      });
      row.appendChild(toggle);
    } else {
      row.appendChild(el("span", "forge-org-tree-toggle-spacer", { "aria-hidden": "true" }));
    }
    const name = el("span", null);
    name.textContent = orgUnit.name;
    row.appendChild(name);
    if (options.selectOrgUnits) {
      const asItem = state.items.find((i) => String(i.id) === String(orgUnit.id));
      if (asItem) {
        row.classList.add("forge-tree-combobox__org-row--selectable");
        row.style.cursor = "pointer";
        row.addEventListener("click", () => {
          state.value = asItem.id;
          state.open = false;
          paintTrigger();
          closePanel();
          if (options.onChange) options.onChange(asItem);
        });
      }
    }
    frag.appendChild(row);
    people.forEach((person) => {
      const wrap = el("div", null);
      wrap.style.paddingLeft = `${depth * 0.85 + 2.1}rem`;
      wrap.appendChild(makeOption(person));
      frag.appendChild(wrap);
    });
    if (kids.length && state.orgExpanded.has(key)) {
      kids.forEach((child) => frag.appendChild(renderOrgBranch(child, depth + 1)));
    }
    return frag;
  }

  async function paintList() {
    list.innerHTML = "";
    if (options.onSearch && state.query.trim()) {
      const remote = await options.onSearch(state.query.trim());
      if (remote && remote.length) {
        remote.forEach((item) => {
          const path = (item.org_path || []).join(" › ");
          list.appendChild(makeOption(item, path || undefined));
        });
        return;
      }
    }
    const filtered = filterItems();
    if (filtered) {
      if (!filtered.length) {
        const empty = el("p", "forge-tree-combobox__empty");
        empty.textContent = options.emptyMessage || "No matches.";
        list.appendChild(empty);
        return;
      }
      filtered.forEach((item) => {
        const path = (item.org_path || []).join(" › ");
        list.appendChild(makeOption(item, path || undefined));
      });
      return;
    }
    if (options.groupLabel) {
      const gl = el("div", "forge-tree-combobox__group-label");
      gl.textContent = options.groupLabel;
      list.appendChild(gl);
    }
    const roots = byParent.get("root") || [];
    if (!roots.length && !state.items.length) {
      const empty = el("p", "forge-tree-combobox__empty");
      empty.textContent = options.emptyMessage || "No options.";
      list.appendChild(empty);
      return;
    }
    roots.forEach((unit) => list.appendChild(renderOrgBranch(unit, 0)));
    const unassigned = state.items.filter((i) => i.org_unit_id == null);
    unassigned.forEach((person) => list.appendChild(makeOption(person)));
  }

  function openPanel() {
    state.open = true;
    root.classList.add("forge-tree-combobox--open");
    trigger.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    searchInput.value = state.query;
    paintList();
    searchInput.focus();
  }

  function closePanel() {
    state.open = false;
    root.classList.remove("forge-tree-combobox--open");
    trigger.setAttribute("aria-expanded", "false");
    panel.hidden = true;
  }

  trigger.addEventListener("click", () => {
    if (state.open) closePanel();
    else openPanel();
  });

  searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    paintList();
  });

  document.addEventListener("click", (ev) => {
    if (!state.open) return;
    if (!root.contains(ev.target)) closePanel();
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && state.open) {
      ev.preventDefault();
      closePanel();
      trigger.focus();
    }
  });

  paintTrigger();
  if (inlinePanel && options.defaultOpen !== false) {
    openPanel();
  } else if (!inlinePanel) {
    closePanel();
  }

  return {
    setValue(id) {
      state.value = id;
      paintTrigger();
    },
    setItems(items) {
      state.items = items;
      if (state.open) paintList();
    },
    getValue: () => state.value,
    close: closePanel,
  };
}
