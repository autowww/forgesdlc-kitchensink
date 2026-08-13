/**
 * ForgeTemplatePicker — starter template selection (ENT.APP).
 * @module ks-template-picker
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
 * @param {{ id?: string, templates?: Array<{ id: string, name: string, description?: string }>, onApply?: (id: string) => void }} options
 */
export function createTemplatePicker(container, options = {}) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("div", "forge-template-picker", {
    hash: "Ftp",
    "data-ks-hash": "Ftp",
    "data-ks-type": "component",
    "data-ks-name": "forge-template-picker",
    role: "listbox",
    "aria-label": "Templates",
    id: options.id || undefined,
  });

  (options.templates || []).forEach((tpl) => {
    const btn = el("button", "forge-template-picker__item", {
      type: "button",
      role: "option",
      "data-template-id": tpl.id,
    });
    const name = el("strong", "forge-template-picker__name");
    name.textContent = tpl.name;
    btn.appendChild(name);
    if (tpl.description) {
      const desc = el("span", "forge-template-picker__desc");
      desc.textContent = tpl.description;
      btn.appendChild(desc);
    }
    btn.addEventListener("click", () => options.onApply?.(tpl.id));
    root.appendChild(btn);
  });
  container.appendChild(root);

  return {
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
