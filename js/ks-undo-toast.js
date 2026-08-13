/**
 * KS undo toast — transient result with reversible action (DET.APP.TOAST_LIFECYCLE).
 * @module ks-undo-toast
 */

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

let toastHost = null;

function ensureHost() {
  if (toastHost && document.body.contains(toastHost)) return toastHost;
  toastHost = el("div", "ks-undo-toast-host", {
    "aria-live": "polite",
    "aria-relevant": "additions",
  });
  document.body.appendChild(toastHost);
  return toastHost;
}

/**
 * @param {{
 *   message: string,
 *   undoLabel?: string,
 *   onUndo?: () => void,
 *   durationMs?: number,
 *   id?: string,
 * }} options
 * @returns {{ dismiss: () => void }}
 */
export function createUndoToast(options) {
  const host = ensureHost();
  const durationMs = options.durationMs ?? 8000;
  let timer = null;
  let dismissed = false;

  const root = el("div", "ks-undo-toast", {
    role: "status",
    hash: "Fut",
    "data-ks-hash": "Fut",
    "data-ks-type": "component",
    "data-ks-name": "undo-toast",
    id: options.id || undefined,
  });

  const body = el("p", "ks-undo-toast__message");
  body.textContent = options.message;
  root.appendChild(body);

  const actions = el("div", "ks-undo-toast__actions");

  if (options.onUndo) {
    const undo = el("button", "btn btn-sm btn-outline-light", { type: "button" });
    undo.textContent = options.undoLabel || "Undo";
    undo.addEventListener("click", () => {
      options.onUndo();
      dismiss();
    });
    actions.appendChild(undo);
  }

  const close = el("button", "btn btn-sm btn-link ks-undo-toast__dismiss", {
    type: "button",
    "aria-label": "Dismiss",
  });
  close.textContent = "Dismiss";
  close.addEventListener("click", dismiss);
  actions.appendChild(close);
  root.appendChild(actions);

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    if (timer) clearTimeout(timer);
    root.remove();
  }

  host.appendChild(root);
  if (durationMs > 0) {
    timer = setTimeout(dismiss, durationMs);
  }

  return { dismiss };
}
