/**
 * ForgeProvenancePanel — AI output source and model disclosure (DET.APP.AI_PROVENANCE).
 * @module ks-provenance-panel
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
 * @param {{ id?: string, provenance?: { source: string, model?: string, promptId?: string, generatedAt?: string } }} options
 */
export function createProvenancePanel(container, options = {}) {
  let destroyed = false;
  const prov = options.provenance || { source: "Unknown" };

  container.innerHTML = "";
  const root = el("aside", "forge-provenance-panel", {
    hash: "Fpv",
    "data-ks-hash": "Fpv",
    "data-ks-type": "component",
    "data-ks-name": "forge-provenance-panel",
    "data-ai-provenance": "true",
    "aria-label": "AI provenance",
    id: options.id || undefined,
  });

  const source = el("p", "forge-provenance-panel__source");
  source.textContent = `Source: ${prov.source}`;
  root.appendChild(source);
  if (prov.model) {
    const model = el("p", "forge-provenance-panel__model");
    model.textContent = `Model: ${prov.model}`;
    root.appendChild(model);
  }
  if (prov.generatedAt) {
    const time = el("time", "forge-provenance-panel__time", { dateTime: prov.generatedAt });
    time.textContent = prov.generatedAt;
    root.appendChild(time);
  }
  container.appendChild(root);

  return {
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
