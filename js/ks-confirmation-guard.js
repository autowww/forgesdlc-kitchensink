/**
 * ForgeConfirmationGuard — explicit confirm/cancel for risky actions (ENT.APP.04).
 * @module ks-confirmation-guard
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
 * @param {{ id?: string, message?: string, confirmLabel?: string, cancelLabel?: string, onConfirm?: () => void, onCancel?: () => void }} options
 */
export function createConfirmationGuard(container, options = {}) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("div", "forge-confirmation-guard", {
    hash: "Fcg",
    "data-ks-hash": "Fcg",
    "data-ks-type": "component",
    "data-ks-name": "forge-confirmation-guard",
    role: "group",
    "aria-label": "Confirm action",
    id: options.id || undefined,
  });

  if (options.message) {
    const msg = el("p", "forge-confirmation-guard__message");
    msg.textContent = options.message;
    root.appendChild(msg);
  }

  const actions = el("div", "forge-confirmation-guard__actions");
  const cancel = el("button", "btn btn-sm btn-outline-secondary", { type: "button" });
  cancel.textContent = options.cancelLabel || "Cancel";
  cancel.addEventListener("click", () => options.onCancel?.());
  actions.appendChild(cancel);

  const confirm = el("button", "btn btn-sm btn-primary", { type: "button" });
  confirm.textContent = options.confirmLabel || "Confirm";
  confirm.addEventListener("click", () => options.onConfirm?.());
  actions.appendChild(confirm);
  root.appendChild(actions);
  container.appendChild(root);

  return {
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
