/**
 * KS sticky action bar — programmatic toolbar actions.
 * @module ks-sticky-action-bar
 */

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

const VARIANT_CLASS = {
  primary: "btn btn-sm btn-primary",
  secondary: "btn btn-sm btn-outline-secondary",
  danger: "btn btn-sm btn-outline-danger",
};

/**
 * @param {HTMLElement} container
 * @param {{
 *   id?: string,
 *   actions?: Array<{ id: string, label: string, variant?: string, onClick?: () => void }>,
 *   onAction?: (actionId: string) => void,
 * }} options
 */
export function createStickyActionBar(container, options = {}) {
  let destroyed = false;
  const actions = options.actions || [
    { id: "save", label: "Save draft", variant: "secondary" },
    { id: "publish", label: "Publish", variant: "primary" },
  ];
  const onAction = options.onAction || (() => {});

  container.innerHTML = "";
  const root = el("div", "ks-sticky-action-bar", {
    role: "toolbar",
    "aria-label": "Page actions",
    hash: "Sab",
    "data-ks-hash": "Sab",
    "data-ks-type": "component",
    "data-ks-name": "sticky-action-bar",
    "data-ks-sticky-action-bar": "",
    id: options.id || undefined,
  });

  function paint() {
    root.innerHTML = "";
    actions.forEach((action) => {
      const cls = VARIANT_CLASS[action.variant || "secondary"] || VARIANT_CLASS.secondary;
      const btn = el("button", cls, { type: "button", "data-action-id": action.id });
      btn.textContent = action.label;
      btn.addEventListener("click", () => {
        if (destroyed) return;
        if (action.onClick) action.onClick();
        onAction(action.id);
        root.dispatchEvent(
          new CustomEvent("ks-sticky-action", { detail: { id: action.id }, bubbles: true })
        );
      });
      root.appendChild(btn);
    });
  }

  paint();
  container.appendChild(root);

  return {
    getValue: () => actions.map((a) => a.id),
    setValue() {
      /* actions are fixed at mount; use refresh to replace */
    },
    refresh(next = {}) {
      if (destroyed) return;
      if (next.actions) {
        actions.length = 0;
        next.actions.forEach((a) => actions.push(a));
        paint();
      }
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}

function parseActions(root) {
  const raw = root.getAttribute("data-actions");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function initExisting(root) {
  if (root.dataset.ksStickyActionBarBound) return;
  root.dataset.ksStickyActionBarBound = "1";
  const actions = parseActions(root);
  createStickyActionBar(root, { actions: actions || undefined });
}

function boot() {
  document.querySelectorAll("[data-ks-sticky-action-bar]").forEach(initExisting);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}
