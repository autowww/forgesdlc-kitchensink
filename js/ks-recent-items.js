/**
 * ForgeRecentItems — quick links to recently opened records (ENT.APP.02).
 * @module ks-recent-items
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
 * @param {{ id?: string, items?: Array<{ id: string, label: string, href?: string }> }} options
 */
export function createRecentItems(container, options = {}) {
  let destroyed = false;
  const items = options.items || [];

  container.innerHTML = "";
  const root = el("nav", "forge-recent-items", {
    hash: "Fri",
    "data-ks-hash": "Fri",
    "data-ks-type": "component",
    "data-ks-name": "forge-recent-items",
    "aria-label": "Recent items",
    id: options.id || undefined,
  });

  const list = el("ul", "forge-recent-items__list");
  items.forEach((item) => {
    const li = el("li", "forge-recent-items__item");
    if (item.href) {
      const a = el("a", "forge-recent-items__link", { href: item.href });
      a.textContent = item.label;
      li.appendChild(a);
    } else {
      const span = el("span", "forge-recent-items__label");
      span.textContent = item.label;
      li.appendChild(span);
    }
    list.appendChild(li);
  });
  root.appendChild(list);
  container.appendChild(root);

  return {
    setItems(next) {
      if (destroyed) return;
      items.length = 0;
      next.forEach((i) => items.push(i));
      list.innerHTML = "";
      items.forEach((item) => {
        const li = el("li", "forge-recent-items__item");
        if (item.href) {
          const a = el("a", "forge-recent-items__link", { href: item.href });
          a.textContent = item.label;
          li.appendChild(a);
        } else {
          const span = el("span", "forge-recent-items__label");
          span.textContent = item.label;
          li.appendChild(span);
        }
        list.appendChild(li);
      });
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
