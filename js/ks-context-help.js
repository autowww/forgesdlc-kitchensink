/**
 * ForgeContextHelp — contextual help topics panel (ENT.APP).
 * @module ks-context-help
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
 * @param {{ id?: string, topics?: Array<{ id: string, title: string, body: string }> }} options
 */
export function createContextHelp(container, options = {}) {
  let destroyed = false;
  const topics = options.topics || [];

  container.innerHTML = "";
  const root = el("aside", "forge-context-help", {
    hash: "Fch",
    "data-ks-hash": "Fch",
    "data-ks-type": "component",
    "data-ks-name": "forge-context-help",
    "aria-label": "Context help",
    id: options.id || undefined,
  });

  const list = el("ul", "forge-context-help__list");
  topics.forEach((topic) => {
    const li = el("li", "forge-context-help__item");
    const h = el("h4", "forge-context-help__title");
    h.textContent = topic.title;
    const p = el("p", "forge-context-help__body");
    p.textContent = topic.body;
    li.appendChild(h);
    li.appendChild(p);
    list.appendChild(li);
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
