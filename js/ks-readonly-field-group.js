/**
 * ForgeReadOnlyFieldGroup — display-only key/value fields (ENT.APP).
 * @module ks-readonly-field-group
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
 * @param {{ id?: string, title?: string, fields?: Array<{ label: string, value: string }> }} options
 */
export function createReadOnlyFieldGroup(container, options = {}) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("dl", "forge-readonly-field-group", {
    hash: "Frg",
    "data-ks-hash": "Frg",
    "data-ks-type": "component",
    "data-ks-name": "forge-readonly-field-group",
    id: options.id || undefined,
  });

  if (options.title) {
    const dt = el("dt", "forge-readonly-field-group__heading");
    dt.textContent = options.title;
    root.appendChild(dt);
  }
  (options.fields || []).forEach((field) => {
    const dt = el("dt", "forge-readonly-field-group__label");
    dt.textContent = field.label;
    const dd = el("dd", "forge-readonly-field-group__value");
    dd.textContent = field.value;
    root.appendChild(dt);
    root.appendChild(dd);
  });
  container.appendChild(root);

  return {
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
