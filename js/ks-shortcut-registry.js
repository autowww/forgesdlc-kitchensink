/**
 * ForgeShortcutRegistry — keyboard shortcut reference list (ENT.APP).
 * @module ks-shortcut-registry
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
 * @param {{ id?: string, shortcuts?: Array<{ keys: string, action: string, label?: string }> }} options
 */
export function createShortcutRegistry(container, options = {}) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("div", "forge-shortcut-registry", {
    hash: "Fsr",
    "data-ks-hash": "Fsr",
    "data-ks-type": "component",
    "data-ks-name": "forge-shortcut-registry",
    "aria-label": "Keyboard shortcuts",
    id: options.id || undefined,
  });

  const list = el("dl", "forge-shortcut-registry__list");
  (options.shortcuts || []).forEach((sc) => {
    const dt = el("dt", "forge-shortcut-registry__keys");
    const kbd = el("kbd");
    kbd.textContent = sc.keys;
    dt.appendChild(kbd);
    const dd = el("dd", "forge-shortcut-registry__action");
    dd.textContent = sc.label || sc.action;
    list.appendChild(dt);
    list.appendChild(dd);
  });
  root.appendChild(list);
  container.appendChild(root);

  return {
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
