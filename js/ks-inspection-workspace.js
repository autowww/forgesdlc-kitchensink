/**
 * ForgeInspectionWorkspace — review main + inspector with assignment and handoff (ENT.APP).
 * @module ks-inspection-workspace
 */

import { createAssignmentControl } from "./ks-assignment-control.js";
import { createCommentThread } from "./ks-comment-thread.js";
import { createHandoffSummary } from "./ks-handoff-summary.js";

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
 *   mainHtml?: string,
 *   inspectorTitle?: string,
 *   inspectorHtml?: string,
 *   assignment?: { assignee?: string, options?: string[] },
 *   comments?: Array<{ id: string, author: string, body: string, at: string }>,
 *   handoff?: { summary: string, to?: string, status?: string },
 *   onAssign?: (assignee: string) => void,
 *   onComment?: (body: string) => void,
 *   onHandoff?: () => void,
 * }} options
 */
export function createInspectionWorkspace(container, options) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("div", "forge-inspection-workspace", {
    hash: "Fix",
    "data-ks-hash": "Fix",
    "data-ks-type": "composition",
    "data-ks-name": "forge-inspection-workspace",
    "data-studio-workspace": "inspection",
    id: options.id || undefined,
  });

  const header = el("header", "forge-inspection-workspace__header");
  const h1 = el("h1", "forge-inspection-workspace__title");
  h1.textContent = options.title;
  header.appendChild(h1);
  if (options.subtitle) {
    const sub = el("p", "forge-inspection-workspace__subtitle");
    sub.textContent = options.subtitle;
    header.appendChild(sub);
  }
  root.appendChild(header);

  const split = el("div", "forge-inspection-workspace__split");
  const main = el("main", "forge-inspection-workspace__main");
  if (options.mainHtml) main.innerHTML = options.mainHtml;
  split.appendChild(main);

  const inspector = el("aside", "forge-inspection-workspace__inspector");
  if (options.inspectorTitle) {
    const ih = el("h2", "forge-inspection-workspace__inspector-title");
    ih.textContent = options.inspectorTitle;
    inspector.appendChild(ih);
  }
  const inspectorBody = el("div", "forge-inspection-workspace__inspector-body");
  if (options.inspectorHtml) inspectorBody.innerHTML = options.inspectorHtml;
  inspector.appendChild(inspectorBody);

  if (options.assignment) {
    const assignSlot = el("div", "forge-inspection-workspace__assignment");
    createAssignmentControl(assignSlot, {
      assignee: options.assignment.assignee,
      options: options.assignment.options,
      onAssign: options.onAssign,
    });
    inspector.appendChild(assignSlot);
  }

  if (options.comments) {
    const commentSlot = el("div", "forge-inspection-workspace__comments");
    createCommentThread(commentSlot, {
      comments: options.comments,
      onComment: options.onComment,
    });
    inspector.appendChild(commentSlot);
  }

  if (options.handoff) {
    const handoffSlot = el("div", "forge-inspection-workspace__handoff");
    createHandoffSummary(handoffSlot, {
      handoff: options.handoff,
      onHandoff: options.onHandoff,
    });
    inspector.appendChild(handoffSlot);
  }

  split.appendChild(inspector);
  root.appendChild(split);
  container.appendChild(root);

  return {
    setInspectorHtml(html) {
      if (destroyed) return;
      inspectorBody.innerHTML = html;
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
