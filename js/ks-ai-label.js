/**
 * ForgeAILabel — visible AI-generated content marker (DET.APP.AI_PROVENANCE).
 * @module ks-ai-label
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
 * @param {{ id?: string, text?: string }} options
 */
export function createAILabel(container, options = {}) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("span", "forge-ai-label", {
    hash: "Fal",
    "data-ks-hash": "Fal",
    "data-ks-type": "component",
    "data-ks-name": "forge-ai-label",
    "data-ai-label": "true",
    id: options.id || undefined,
  });
  root.textContent = options.text || "AI suggested";
  container.appendChild(root);

  return {
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
