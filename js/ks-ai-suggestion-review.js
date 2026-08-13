/**
 * ForgeAISuggestionReview — AI provenance, confidence, accept/reject/revert (DET.APP.AI_PROVENANCE).
 * @module ks-ai-suggestion-review
 */

import { createAILabel } from "./ks-ai-label.js";
import { createProvenancePanel } from "./ks-provenance-panel.js";
import { createConfidenceIndicator } from "./ks-confidence-indicator.js";
import { createRevertAction } from "./ks-revert-action.js";

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
 *   suggestionHtml?: string,
 *   provenance?: { source: string, model?: string, promptId?: string, generatedAt?: string },
 *   confidence?: number,
 *   status?: 'pending'|'accepted'|'rejected'|'reverted',
 *   onAccept?: () => void,
 *   onReject?: () => void,
 *   onRevert?: () => void,
 * }} options
 */
export function createAISuggestionReview(container, options = {}) {
  let destroyed = false;
  let status = options.status || "pending";
  let revertApi = null;

  container.innerHTML = "";
  const root = el("div", "forge-ai-suggestion-review", {
    hash: "Fai",
    "data-ks-hash": "Fai",
    "data-ks-type": "composition",
    "data-ks-name": "forge-ai-suggestion-review",
    "data-studio-workspace": "ai-review",
    "data-ai-generated": "true",
    "data-ai-status": status,
    id: options.id || undefined,
  });

  const labelSlot = el("div", "forge-ai-suggestion-review__label");
  createAILabel(labelSlot);
  root.appendChild(labelSlot);

  const body = el("div", "forge-ai-suggestion-review__body");
  if (options.suggestionHtml) body.innerHTML = options.suggestionHtml;
  root.appendChild(body);

  if (options.provenance) {
    const provSlot = el("div", "forge-ai-suggestion-review__provenance");
    createProvenancePanel(provSlot, { provenance: options.provenance });
    root.appendChild(provSlot);
  }

  if (options.confidence != null) {
    const confSlot = el("div", "forge-ai-suggestion-review__confidence");
    createConfidenceIndicator(confSlot, { confidence: options.confidence });
    root.appendChild(confSlot);
  }

  const actions = el("div", "forge-ai-suggestion-review__actions");
  const accept = el("button", "btn btn-sm btn-primary", { type: "button" });
  accept.textContent = "Accept";
  accept.addEventListener("click", () => {
    if (destroyed) return;
    status = "accepted";
    root.setAttribute("data-ai-status", status);
    revertApi?.setEnabled(true);
    options.onAccept?.();
  });
  const reject = el("button", "btn btn-sm btn-outline-danger", { type: "button" });
  reject.textContent = "Reject";
  reject.addEventListener("click", () => {
    if (destroyed) return;
    status = "rejected";
    root.setAttribute("data-ai-status", status);
    revertApi?.setEnabled(false);
    options.onReject?.();
  });
  actions.appendChild(accept);
  actions.appendChild(reject);

  const revertSlot = el("div", "forge-ai-suggestion-review__revert");
  revertApi = createRevertAction(revertSlot, {
    enabled: status === "accepted",
    onRevert: () => {
      if (destroyed) return;
      status = "reverted";
      root.setAttribute("data-ai-status", status);
      revertApi?.setEnabled(false);
      options.onRevert?.();
    },
  });
  actions.appendChild(revertSlot);
  root.appendChild(actions);
  container.appendChild(root);

  return {
    getStatus: () => status,
    setStatus(next) {
      if (destroyed) return;
      status = next;
      root.setAttribute("data-ai-status", status);
      revertApi?.setEnabled(status === "accepted");
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
