/**
 * KS filter toolbar — search + select filters + active chips.
 * @module ks-filter-toolbar
 */

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * @param {HTMLElement} container
 * @param {{
 *   id?: string,
 *   searchPlaceholder?: string,
 *   searchLabel?: string,
 *   filters?: Array<{ id: string, label: string, options: Array<{ value: string, label: string }>, emptyLabel?: string }>,
 *   initial?: { q?: string, filters?: Record<string, string> },
 *   onChange?: (state: { q: string, filters: Record<string, string> }) => void,
 *   debounceMs?: number,
 * }} options
 */
export function createFilterToolbar(container, options = {}) {
  const state = {
    q: options.initial?.q || "",
    filters: { ...(options.initial?.filters || {}) },
  };
  const filters = options.filters || [];
  const onChange = options.onChange || (() => {});
  const emit = options.debounceMs
    ? debounce(() => onChange({ ...state, filters: { ...state.filters } }), options.debounceMs)
    : () => onChange({ ...state, filters: { ...state.filters } });

  container.innerHTML = "";
  const root = el("div", "forge-filter-toolbar", {
    hash: "Ftb",
    "data-ks-hash": "Ftb",
    "data-ks-type": "component",
    "data-ks-name": "filter-toolbar",
    id: options.id || undefined,
    role: "search",
  });

  const searchWrap = el("div", "forge-filter-toolbar__search");
  const searchLabel = options.searchLabel || "Search";
  const searchId = `${options.id || "ftb"}-search`;
  searchWrap.appendChild(el("label", null, { for: searchId }));
  searchWrap.querySelector("label").textContent = searchLabel;
  const searchInput = el("input", null, {
    type: "search",
    id: searchId,
    placeholder: options.searchPlaceholder || "Search…",
    "aria-label": searchLabel,
  });
  searchInput.value = state.q;
  searchInput.addEventListener("input", () => {
    state.q = searchInput.value.trim();
    emit();
    paintChips();
  });
  searchWrap.appendChild(searchInput);
  root.appendChild(searchWrap);

  filters.forEach((filter) => {
    const field = el("div", "forge-filter-toolbar__field");
    const selectId = `${options.id || "ftb"}-${filter.id}`;
    const label = el("label", null, { for: selectId });
    label.textContent = filter.label;
    field.appendChild(label);
    const select = el("select", null, { id: selectId, "aria-label": filter.label });
    const empty = el("option", null, { value: "" });
    empty.textContent = filter.emptyLabel || `All ${filter.label.toLowerCase()}`;
    select.appendChild(empty);
    (filter.options || []).forEach((opt) => {
      const option = el("option", null, { value: opt.value });
      option.textContent = opt.label;
      select.appendChild(option);
    });
    if (state.filters[filter.id]) {
      select.value = state.filters[filter.id];
    }
    select.addEventListener("change", () => {
      if (select.value) {
        state.filters[filter.id] = select.value;
      } else {
        delete state.filters[filter.id];
      }
      emit();
      paintChips();
    });
    field.appendChild(select);
    root.appendChild(field);
  });

  const chipsHost = el("div", "forge-filter-toolbar__chips", {
    "aria-live": "polite",
    "aria-label": "Active filters",
  });
  root.appendChild(chipsHost);

  function paintChips() {
    chipsHost.innerHTML = "";
    const active = [];
    if (state.q) active.push({ key: "q", label: `Search: ${state.q}` });
    filters.forEach((f) => {
      const val = state.filters[f.id];
      if (!val) return;
      const opt = (f.options || []).find((o) => o.value === val);
      active.push({ key: f.id, label: `${f.label}: ${opt?.label || val}` });
    });
    active.forEach((chip) => {
      const chipEl = el("span", "forge-filter-chip");
      chipEl.appendChild(document.createTextNode(chip.label));
      const btn = el("button", null, { type: "button", "aria-label": `Remove ${chip.label}` });
      btn.textContent = "×";
      btn.addEventListener("click", () => {
        if (chip.key === "q") {
          state.q = "";
          searchInput.value = "";
        } else {
          delete state.filters[chip.key];
          const sel = root.querySelector(`#${options.id || "ftb"}-${chip.key}`);
          if (sel) sel.value = "";
        }
        emit();
        paintChips();
      });
      chipEl.appendChild(btn);
      chipsHost.appendChild(chipEl);
    });
    if (active.length > 1) {
      const clear = el("button", "btn btn-sm btn-outline-secondary", { type: "button" });
      clear.textContent = "Clear all";
      clear.addEventListener("click", () => {
        state.q = "";
        state.filters = {};
        searchInput.value = "";
        root.querySelectorAll("select").forEach((s) => {
          s.value = "";
        });
        emit();
        paintChips();
      });
      chipsHost.appendChild(clear);
    }
  }

  paintChips();
  container.appendChild(root);

  return {
    getState: () => ({ q: state.q, filters: { ...state.filters } }),
    setState: (next) => {
      state.q = next.q || "";
      state.filters = { ...(next.filters || {}) };
      searchInput.value = state.q;
      filters.forEach((f) => {
        const sel = root.querySelector(`#${options.id || "ftb"}-${f.id}`);
        if (sel) sel.value = state.filters[f.id] || "";
      });
      paintChips();
    },
  };
}
