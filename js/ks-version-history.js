/**
 * ForgeVersionHistory — prior revisions list for rollback (ENT.APP.04).
 * @module ks-version-history
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
 * @param {{ id?: string, versions?: Array<{ id: string, label: string, at?: string, author?: string }>, onRestore?: (id: string) => void }} options
 */
export function createVersionHistory(container, options = {}) {
  let destroyed = false;
  const versions = options.versions || [];

  container.innerHTML = "";
  const root = el("section", "forge-version-history", {
    hash: "Fvh",
    "data-ks-hash": "Fvh",
    "data-ks-type": "component",
    "data-ks-name": "forge-version-history",
    "aria-label": "Version history",
    id: options.id || undefined,
  });

  const list = el("ol", "forge-version-history__list");
  versions.forEach((v) => {
    const li = el("li", "forge-version-history__item");
    const label = el("span", "forge-version-history__label");
    label.textContent = v.label;
    li.appendChild(label);
    if (v.at) {
      const time = el("time", "forge-version-history__time", { dateTime: v.at });
      time.textContent = v.at;
      li.appendChild(time);
    }
    if (options.onRestore) {
      const btn = el("button", "btn btn-sm btn-outline-secondary", { type: "button" });
      btn.textContent = "Restore";
      btn.addEventListener("click", () => options.onRestore(v.id));
      li.appendChild(btn);
    }
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
