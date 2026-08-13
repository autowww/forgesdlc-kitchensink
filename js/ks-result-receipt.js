/**
 * ForgeResultReceipt — outcome summary after an action completes (ENT.APP.04).
 * @module ks-result-receipt
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
 * @param {{ id?: string, title?: string, detail?: string, status?: 'success'|'error'|'info' }} options
 */
export function createResultReceipt(container, options = {}) {
  let destroyed = false;
  const status = options.status || "success";

  container.innerHTML = "";
  const root = el("div", `forge-result-receipt forge-result-receipt--${status}`, {
    hash: "Frt",
    "data-ks-hash": "Frt",
    "data-ks-type": "component",
    "data-ks-name": "forge-result-receipt",
    role: "status",
    id: options.id || undefined,
  });

  if (options.title) {
    const title = el("strong", "forge-result-receipt__title");
    title.textContent = options.title;
    root.appendChild(title);
  }
  if (options.detail) {
    const detail = el("p", "forge-result-receipt__detail");
    detail.textContent = options.detail;
    root.appendChild(detail);
  }
  container.appendChild(root);

  return {
    setContent({ title, detail, status: nextStatus }) {
      if (destroyed) return;
      root.className = `forge-result-receipt forge-result-receipt--${nextStatus || status}`;
      root.innerHTML = "";
      if (title) {
        const t = el("strong", "forge-result-receipt__title");
        t.textContent = title;
        root.appendChild(t);
      }
      if (detail) {
        const d = el("p", "forge-result-receipt__detail");
        d.textContent = detail;
        root.appendChild(d);
      }
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
