/**
 * ForgeRolePreset — role label and preset selector (ENT.APP).
 * @module ks-role-preset
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
 * @param {{ id?: string, role?: string, presets?: string[], onSelect?: (preset: string) => void }} options
 */
export function createRolePreset(container, options = {}) {
  let destroyed = false;
  let active = options.role || "";

  container.innerHTML = "";
  const root = el("div", "forge-role-preset", {
    hash: "Frl",
    "data-ks-hash": "Frl",
    "data-ks-type": "component",
    "data-ks-name": "forge-role-preset",
    id: options.id || undefined,
  });

  const label = el("span", "forge-role-preset__role");
  label.textContent = active;
  root.appendChild(label);

  if (options.presets?.length) {
    const group = el("div", "forge-role-preset__presets", { role: "group" });
    options.presets.forEach((preset) => {
      const btn = el("button", "btn btn-sm btn-outline-secondary", { type: "button" });
      btn.textContent = preset;
      btn.addEventListener("click", () => {
        if (destroyed) return;
        active = preset;
        label.textContent = preset;
        options.onSelect?.(preset);
      });
      group.appendChild(btn);
    });
    root.appendChild(group);
  }
  container.appendChild(root);

  return {
    getRole: () => active,
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
