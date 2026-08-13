/**
 * ForgeImpactPreview — impact diff list with confirmation guard (ENT.APP.04).
 * @module ks-impact-preview
 */

import { createConfirmationGuard } from "./ks-confirmation-guard.js";

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
 *   title?: string,
 *   impacts?: Array<{ label: string, before?: string, after?: string, severity?: string }>,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   onConfirm?: () => void,
 *   onCancel?: () => void,
 * }} options
 */
export function createImpactPreview(container, options = {}) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("div", "forge-impact-preview", {
    hash: "Fip",
    "data-ks-hash": "Fip",
    "data-ks-type": "composition",
    "data-ks-name": "forge-impact-preview",
    id: options.id || undefined,
  });

  if (options.title) {
    const h1 = el("h2", "forge-impact-preview__title");
    h1.textContent = options.title;
    root.appendChild(h1);
  }

  const list = el("ul", "forge-impact-preview__list");
  (options.impacts || []).forEach((impact) => {
    const li = el("li", `forge-impact-preview__item${impact.severity ? ` forge-impact-preview__item--${impact.severity}` : ""}`);
    const label = el("strong", "forge-impact-preview__label");
    label.textContent = impact.label;
    li.appendChild(label);
    if (impact.before != null || impact.after != null) {
      const diff = el("div", "forge-impact-preview__diff");
      if (impact.before != null) {
        const before = el("span", "forge-impact-preview__before");
        before.textContent = impact.before;
        diff.appendChild(before);
      }
      if (impact.after != null) {
        const after = el("span", "forge-impact-preview__after");
        after.textContent = impact.after;
        diff.appendChild(after);
      }
      li.appendChild(diff);
    }
    list.appendChild(li);
  });
  root.appendChild(list);

  const guardSlot = el("div", "forge-impact-preview__guard");
  createConfirmationGuard(guardSlot, {
    confirmLabel: options.confirmLabel,
    cancelLabel: options.cancelLabel,
    onConfirm: options.onConfirm,
    onCancel: options.onCancel,
  });
  root.appendChild(guardSlot);
  container.appendChild(root);

  return {
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
