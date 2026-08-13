/**
 * ForgePermissionBoundary — access reason + read-only field group wrapper (ENT.APP.06).
 * @module ks-permission-boundary
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
 *   mode: 'read-only' | 'denied' | 'partial',
 *   reason: string,
 *   actionLabel?: string,
 *   onAction?: () => void,
 *   contentHtml: string,
 *   demo?: boolean,
 * }} options
 */
export function createPermissionBoundary(container, options) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("div", "forge-permission-boundary", {
    hash: "Fpb",
    "data-ks-hash": "Fpb",
    "data-ks-type": "composition",
    "data-ks-name": "forge-permission-boundary",
    "data-studio-workspace": "permission",
    id: options.id || undefined,
  });

  if (options.demo) {
    const demo = el("p", "forge-permission-boundary__demo");
    demo.textContent = "Demo / sample data";
    demo.setAttribute("data-demo", "");
    root.appendChild(demo);
  }

  const notice = el("div", `forge-permission-boundary__notice forge-permission-boundary__notice--${options.mode}`, {
    role: "note",
  });
  const modeLabel = el("strong");
  modeLabel.textContent =
    options.mode === "read-only" ? "Read-only" : options.mode === "denied" ? "Access denied" : "Limited access";
  notice.appendChild(modeLabel);
  const text = el("p");
  text.textContent = options.reason;
  notice.appendChild(text);
  if (options.actionLabel && options.onAction) {
    const btn = el("button", "btn btn-sm btn-outline-secondary", { type: "button" });
    btn.textContent = options.actionLabel;
    btn.addEventListener("click", () => options.onAction());
    notice.appendChild(btn);
  }
  root.appendChild(notice);

  const content = el("div", "forge-permission-boundary__content");
  content.innerHTML = options.contentHtml;
  if (options.mode === "read-only" || options.mode === "denied") {
    content.querySelectorAll("input, select, textarea, button").forEach((field) => {
      if (field.type === "button" || field.type === "submit") return;
      field.setAttribute("readonly", "");
      field.setAttribute("aria-disabled", "true");
      field.disabled = true;
    });
  }
  root.appendChild(content);
  container.appendChild(root);

  return {
    getMode: () => options.mode,
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
