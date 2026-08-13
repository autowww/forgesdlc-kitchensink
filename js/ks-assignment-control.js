/**
 * ForgeAssignmentControl — assignee picker for review handoffs (ENT.APP).
 * @module ks-assignment-control
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
 * @param {{ id?: string, assignee?: string, options?: string[], onAssign?: (assignee: string) => void }} options
 */
export function createAssignmentControl(container, options = {}) {
  let destroyed = false;
  let assignee = options.assignee || "";

  container.innerHTML = "";
  const root = el("div", "forge-assignment-control", {
    hash: "Fac",
    "data-ks-hash": "Fac",
    "data-ks-type": "component",
    "data-ks-name": "forge-assignment-control",
    id: options.id || undefined,
  });

  const label = el("label", "forge-assignment-control__label");
  label.textContent = "Assignee";
  const select = el("select", "forge-assignment-control__select");
  (options.options || []).forEach((name) => {
    const opt = el("option");
    opt.value = name;
    opt.textContent = name;
    if (name === assignee) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => {
    if (destroyed) return;
    assignee = select.value;
    options.onAssign?.(assignee);
  });
  label.appendChild(select);
  root.appendChild(label);
  container.appendChild(root);

  return {
    getAssignee: () => assignee,
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
