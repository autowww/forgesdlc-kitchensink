/**
 * KS pagination tactile — programmatic page control.
 * @module ks-pagination-tactile
 */

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

function emitChange(root, detail) {
  root.dispatchEvent(new CustomEvent("ks-pagination-change", { detail, bubbles: true }));
}

/**
 * @param {HTMLElement} container
 * @param {{
 *   id?: string,
 *   page?: number,
 *   totalPages?: number,
 *   onChange?: (state: { page: number, totalPages: number }) => void,
 * }} options
 */
export function createPaginationTactile(container, options = {}) {
  let destroyed = false;
  const state = {
    page: Math.max(1, options.page || 1),
    totalPages: Math.max(1, options.totalPages || 1),
  };
  const onChange = options.onChange || (() => {});

  container.innerHTML = "";
  const root = el("nav", "ks-pagination-tactile", {
    "aria-label": "Pagination",
    hash: "Pgt",
    "data-ks-hash": "Pgt",
    "data-ks-type": "component",
    "data-ks-name": "pagination-tactile",
    "data-ks-pagination": "",
    id: options.id || undefined,
  });

  function clampPage(p) {
    return Math.min(state.totalPages, Math.max(1, p));
  }

  function paint() {
    root.innerHTML = "";
    const prev = el("button", "ks-pagination-tactile__btn", {
      type: "button",
      "aria-label": "Previous",
    });
    prev.textContent = "‹";
    prev.disabled = state.page <= 1;
    prev.addEventListener("click", () => {
      if (destroyed || state.page <= 1) return;
      state.page = clampPage(state.page - 1);
      paint();
      onChange({ ...state });
      emitChange(root, { ...state });
    });
    root.appendChild(prev);

    for (let i = 1; i <= state.totalPages; i += 1) {
      const btn = el("button", "ks-pagination-tactile__btn", { type: "button" });
      if (i === state.page) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-current", "page");
      }
      btn.textContent = String(i);
      btn.addEventListener("click", () => {
        if (destroyed) return;
        state.page = i;
        paint();
        onChange({ ...state });
        emitChange(root, { ...state });
      });
      root.appendChild(btn);
    }

    const next = el("button", "ks-pagination-tactile__btn", {
      type: "button",
      "aria-label": "Next",
    });
    next.textContent = "›";
    next.disabled = state.page >= state.totalPages;
    next.addEventListener("click", () => {
      if (destroyed || state.page >= state.totalPages) return;
      state.page = clampPage(state.page + 1);
      paint();
      onChange({ ...state });
      emitChange(root, { ...state });
    });
    root.appendChild(next);
  }

  container.appendChild(root);
  paint();

  const api = {
    getValue: () => ({ page: state.page, totalPages: state.totalPages }),
    setValue(next) {
      if (destroyed) return;
      if (next.page != null) state.page = clampPage(next.page);
      if (next.totalPages != null) {
        state.totalPages = Math.max(1, next.totalPages);
        state.page = clampPage(state.page);
      }
      paint();
    },
    refresh(next = {}) {
      if (destroyed) return api;
      if (next.page != null) state.page = next.page;
      if (next.totalPages != null) state.totalPages = next.totalPages;
      state.page = clampPage(state.page);
      paint();
      return api;
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };

  return api;
}

function initExisting(root) {
  if (root.dataset.ksPaginationBound) return;
  root.dataset.ksPaginationBound = "1";
  const page = Number(root.dataset.page || "1");
  const totalPages = Number(root.dataset.totalPages || "3");
  createPaginationTactile(root, { page, totalPages });
}

function boot() {
  document.querySelectorAll("[data-ks-pagination]").forEach(initExisting);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}
