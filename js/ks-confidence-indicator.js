/**
 * ForgeConfidenceIndicator — AI confidence meter (DET.APP.AI_PROVENANCE).
 * @module ks-confidence-indicator
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
 * @param {{ id?: string, confidence?: number }} options
 */
export function createConfidenceIndicator(container, options = {}) {
  let destroyed = false;
  let confidence = Math.min(1, Math.max(0, options.confidence ?? 0));

  container.innerHTML = "";
  const root = el("div", "forge-confidence-indicator", {
    hash: "Fci",
    "data-ks-hash": "Fci",
    "data-ks-type": "component",
    "data-ks-name": "forge-confidence-indicator",
    "data-ai-confidence": "true",
    role: "meter",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": String(Math.round(confidence * 100)),
    "aria-label": "AI confidence",
    id: options.id || undefined,
  });

  const label = el("span", "forge-confidence-indicator__label");
  label.textContent = `${Math.round(confidence * 100)}% confidence`;
  const bar = el("div", "forge-confidence-indicator__bar", { "aria-hidden": "true" });
  const fill = el("div", "forge-confidence-indicator__fill");
  fill.style.width = `${confidence * 100}%`;
  bar.appendChild(fill);
  root.appendChild(label);
  root.appendChild(bar);
  container.appendChild(root);

  return {
    setConfidence(value) {
      if (destroyed) return;
      confidence = Math.min(1, Math.max(0, value));
      root.setAttribute("aria-valuenow", String(Math.round(confidence * 100)));
      label.textContent = `${Math.round(confidence * 100)}% confidence`;
      fill.style.width = `${confidence * 100}%`;
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
