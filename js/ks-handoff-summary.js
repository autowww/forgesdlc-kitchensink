/**
 * ForgeHandoffSummary — review handoff status block (ENT.APP).
 * @module ks-handoff-summary
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
 * @param {{ id?: string, handoff?: { summary: string, to?: string, status?: string }, onHandoff?: () => void }} options
 */
export function createHandoffSummary(container, options = {}) {
  let destroyed = false;
  const handoff = options.handoff || { summary: "" };

  container.innerHTML = "";
  const root = el("section", "forge-handoff-summary", {
    hash: "Fhs",
    "data-ks-hash": "Fhs",
    "data-ks-type": "component",
    "data-ks-name": "forge-handoff-summary",
    id: options.id || undefined,
  });

  const summary = el("p", "forge-handoff-summary__text");
  summary.textContent = handoff.summary;
  root.appendChild(summary);
  if (handoff.to) {
    const to = el("p", "forge-handoff-summary__to");
    to.textContent = `To: ${handoff.to}`;
    root.appendChild(to);
  }
  if (handoff.status) {
    const status = el("span", "forge-handoff-summary__status");
    status.textContent = handoff.status;
    root.appendChild(status);
  }
  if (options.onHandoff) {
    const btn = el("button", "btn btn-sm btn-primary", { type: "button" });
    btn.textContent = "Complete handoff";
    btn.addEventListener("click", () => options.onHandoff());
    root.appendChild(btn);
  }
  container.appendChild(root);

  return {
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
