/**
 * ForgeSmartDefault — suggested default value callout (ENT.APP).
 * @module ks-smart-default
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
 * @param {{ id?: string, defaults?: Array<{ field: string, value: string, reason?: string }>, onApply?: (field: string, value: string) => void }} options
 */
export function createSmartDefault(container, options = {}) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("div", "forge-smart-default", {
    hash: "Fsd",
    "data-ks-hash": "Fsd",
    "data-ks-type": "component",
    "data-ks-name": "forge-smart-default",
    id: options.id || undefined,
  });

  (options.defaults || []).forEach((d) => {
    const item = el("div", "forge-smart-default__item");
    const field = el("span", "forge-smart-default__field");
    field.textContent = d.field;
    const value = el("span", "forge-smart-default__value");
    value.textContent = d.value;
    item.appendChild(field);
    item.appendChild(value);
    if (d.reason) {
      const reason = el("p", "forge-smart-default__reason");
      reason.textContent = d.reason;
      item.appendChild(reason);
    }
    if (options.onApply) {
      const btn = el("button", "btn btn-sm btn-outline-primary", { type: "button" });
      btn.textContent = "Apply";
      btn.addEventListener("click", () => options.onApply(d.field, d.value));
      item.appendChild(btn);
    }
    root.appendChild(item);
  });
  container.appendChild(root);

  return {
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
