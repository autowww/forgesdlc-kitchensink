/**
 * ForgeRevertAction — revert accepted AI suggestion (DET.APP.AI_PROVENANCE).
 * @module ks-revert-action
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
 * @param {{ id?: string, enabled?: boolean, onRevert?: () => void }} options
 */
export function createRevertAction(container, options = {}) {
  let destroyed = false;
  let enabled = options.enabled ?? false;

  container.innerHTML = "";
  const root = el("button", "forge-revert-action btn btn-sm btn-outline-secondary", {
    hash: "Fra",
    "data-ks-hash": "Fra",
    "data-ks-type": "component",
    "data-ks-name": "forge-revert-action",
    type: "button",
    disabled: enabled ? undefined : "",
    id: options.id || undefined,
  });
  root.textContent = "Revert";
  root.addEventListener("click", () => {
    if (destroyed || !enabled) return;
    options.onRevert?.();
  });
  container.appendChild(root);

  return {
    setEnabled(value) {
      if (destroyed) return;
      enabled = value;
      if (enabled) root.removeAttribute("disabled");
      else root.setAttribute("disabled", "");
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
