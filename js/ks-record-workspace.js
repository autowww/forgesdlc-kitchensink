/**
 * ForgeRecordWorkspace — run header region + metadata + stage + timeline slots (ENT.APP.01).
 * @module ks-record-workspace
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
 * @param {{
 *   id?: string,
 *   title: string,
 *   subtitle?: string,
 *   badges?: string[],
 *   headerActionsHtml?: string,
 *   metadataHtml?: string,
 *   stageHtml?: string,
 *   timelineHtml?: string,
 *   mainHtml?: string,
 *   inspectorHtml?: string,
 * }} options
 */
export function createRecordWorkspace(container, options) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("div", "forge-record-workspace", {
    hash: "Frw",
    "data-ks-hash": "Frw",
    "data-ks-type": "composition",
    "data-ks-name": "forge-record-workspace",
    "data-studio-workspace": "record",
    id: options.id || undefined,
  });

  const header = el("header", "forge-record-workspace__header");
  const h1 = el("h1", "forge-record-workspace__title");
  h1.textContent = options.title;
  header.appendChild(h1);
  if (options.subtitle) {
    const sub = el("p", "forge-record-workspace__subtitle");
    sub.textContent = options.subtitle;
    header.appendChild(sub);
  }
  if (options.badges?.length) {
    const ul = el("ul", "forge-record-workspace__badges");
    options.badges.forEach((b) => {
      const li = el("li");
      const span = el("span", "ks-fe-badge ks-fe-badge--info");
      span.textContent = b;
      li.appendChild(span);
      ul.appendChild(li);
    });
    header.appendChild(ul);
  }
  if (options.headerActionsHtml) {
    const actions = el("div", "forge-record-workspace__actions");
    actions.innerHTML = options.headerActionsHtml;
    header.appendChild(actions);
  }
  root.appendChild(header);

  if (options.metadataHtml) {
    const meta = el("section", "forge-record-workspace__meta");
    meta.innerHTML = options.metadataHtml;
    root.appendChild(meta);
  }
  if (options.stageHtml) {
    const stage = el("section", "forge-record-workspace__stage");
    stage.innerHTML = options.stageHtml;
    root.appendChild(stage);
  }
  if (options.timelineHtml) {
    const tl = el("section", "forge-record-workspace__timeline");
    tl.innerHTML = options.timelineHtml;
    root.appendChild(tl);
  }

  const split = el("div", "forge-record-workspace__split");
  const main = el("main", "forge-record-workspace__main");
  main.id = "main";
  if (options.mainHtml) main.innerHTML = options.mainHtml;
  split.appendChild(main);
  if (options.inspectorHtml) {
    const inspector = el("aside", "forge-record-workspace__inspector");
    inspector.innerHTML = options.inspectorHtml;
    split.appendChild(inspector);
  }
  root.appendChild(split);
  container.appendChild(root);

  return {
    getTitle: () => options.title,
    setTitle(title) {
      if (destroyed) return;
      options.title = title;
      h1.textContent = title;
    },
    setMainHtml(html) {
      if (destroyed) return;
      main.innerHTML = html;
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
