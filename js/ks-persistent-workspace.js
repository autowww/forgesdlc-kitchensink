/**
 * ForgePersistentWorkspace — autosave, drafts, saved views, recent items (ENT.APP.02).
 * @module ks-persistent-workspace
 */

import { createRecentItems } from "./ks-recent-items.js";

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

const AUTOSAVE_LABEL = {
  saved: "All changes saved",
  saving: "Saving…",
  dirty: "Unsaved changes",
  error: "Save failed",
};

/**
 * @param {HTMLElement} container
 * @param {{
 *   id?: string,
 *   title?: string,
 *   autosaveState?: 'saved'|'saving'|'dirty'|'error',
 *   lastSavedAt?: string,
 *   drafts?: Array<{ id: string, title: string, updatedAt: string }>,
 *   savedViews?: Array<{ id: string, name: string, shared?: boolean, active?: boolean }>,
 *   recentItems?: Array<{ id: string, label: string, href?: string }>,
 *   mainHtml?: string,
 *   storageKey?: string,
 * }} options
 */
export function createPersistentWorkspace(container, options = {}) {
  let destroyed = false;
  let autosaveState = options.autosaveState || "saved";
  let lastSavedAt = options.lastSavedAt || "";
  let activeViewId = options.savedViews?.find((v) => v.active)?.id || options.savedViews?.[0]?.id || null;

  if (options.storageKey) {
    try {
      const stored = localStorage.getItem(options.storageKey);
      if (stored) activeViewId = stored;
    } catch {
      /* ignore */
    }
  }

  container.innerHTML = "";
  const root = el("div", "forge-persistent-workspace", {
    hash: "Fpw",
    "data-ks-hash": "Fpw",
    "data-ks-type": "composition",
    "data-ks-name": "forge-persistent-workspace",
    "data-studio-workspace": "persistent",
    "data-work-state": autosaveState,
    id: options.id || undefined,
  });

  const header = el("header", "forge-persistent-workspace__header");
  if (options.title) {
    const h1 = el("h1", "forge-persistent-workspace__title");
    h1.textContent = options.title;
    header.appendChild(h1);
  }

  const autosaveWrap = el("div", "forge-persistent-workspace__autosave");
  const autosave = el("div", `ks-fe-autosave ks-fe-autosave--${autosaveState}`, {
    hash: "Fas",
    "data-ks-hash": "Fas",
    "data-ks-type": "component",
    "data-ks-name": "forge-autosave-status",
    role: "status",
    "data-work-state": autosaveState,
    "aria-live": "polite",
    "aria-busy": autosaveState === "saving" ? "true" : "false",
  });
  const dot = el("span", "ks-fe-autosave__dot", { "aria-hidden": "true" });
  const autosaveLabel = el("span", "ks-fe-autosave__label");
  autosaveLabel.textContent = AUTOSAVE_LABEL[autosaveState];
  autosave.appendChild(dot);
  autosave.appendChild(autosaveLabel);
  const autosaveDetail = el("span", "ks-fe-autosave__detail");
  autosave.appendChild(autosaveDetail);
  autosaveWrap.appendChild(autosave);
  header.appendChild(autosaveWrap);
  root.appendChild(header);

  if (options.drafts?.length) {
    const draftsSection = el("section", "forge-persistent-workspace__drafts");
    const draftRoot = el("div", "ks-fe-draft-recovery", {
      hash: "Fdr",
      "data-ks-hash": "Fdr",
      "data-ks-type": "component",
      "data-ks-name": "forge-draft-recovery",
      "aria-label": "Recover draft work",
    });
    const draftTitle = el("h3", "ks-fe-draft-recovery__title");
    draftTitle.textContent = "Recover unsaved work";
    draftRoot.appendChild(draftTitle);
    const draftList = el("ul", "ks-fe-draft-recovery__list");
    options.drafts.forEach((draft) => {
      const li = el("li", "ks-fe-draft-recovery__row");
      const meta = el("div", "ks-fe-draft-recovery__meta");
      const name = el("strong", "ks-fe-draft-recovery__name");
      name.textContent = draft.title;
      const time = el("time", "ks-fe-draft-recovery__time", { dateTime: draft.updatedAt });
      time.textContent = draft.updatedAt;
      meta.appendChild(name);
      meta.appendChild(time);
      const actions = el("div", "ks-fe-draft-recovery__actions");
      const recover = el("button", "btn btn-sm btn-primary", { type: "button" });
      recover.textContent = "Recover";
      const discard = el("button", "btn btn-sm btn-outline-secondary", { type: "button" });
      discard.textContent = "Discard";
      actions.appendChild(recover);
      actions.appendChild(discard);
      li.appendChild(meta);
      li.appendChild(actions);
      draftList.appendChild(li);
    });
    draftRoot.appendChild(draftList);
    draftsSection.appendChild(draftRoot);
    root.appendChild(draftsSection);
  }

  if (options.savedViews?.length) {
    const viewsSection = el("section", "forge-persistent-workspace__views");
    const viewsList = el("ul", "forge-persistent-workspace__views-list", {
      role: "listbox",
      "aria-label": "Saved views",
    });
    options.savedViews.forEach((view) => {
      const li = el("li", "forge-persistent-workspace__views-item");
      const isActive = view.id === activeViewId;
      const btn = el("button", `forge-persistent-workspace__view-btn${isActive ? " forge-persistent-workspace__view-btn--active" : ""}`, {
        type: "button",
        role: "option",
        "aria-selected": isActive ? "true" : "false",
        "data-view-id": view.id,
      });
      btn.textContent = view.name;
      if (view.shared) {
        const shared = el("span", "forge-persistent-workspace__view-shared");
        shared.textContent = "Shared";
        btn.appendChild(shared);
      }
      btn.addEventListener("click", () => {
        if (destroyed) return;
        activeViewId = view.id;
        if (options.storageKey) {
          try {
            localStorage.setItem(options.storageKey, view.id);
          } catch {
            /* ignore */
          }
        }
        viewsList.querySelectorAll("button").forEach((b) => {
          const on = b.dataset.viewId === activeViewId;
          b.classList.toggle("forge-persistent-workspace__view-btn--active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
      });
      li.appendChild(btn);
      viewsList.appendChild(li);
    });
    viewsSection.appendChild(viewsList);
    root.appendChild(viewsSection);
  }

  if (options.recentItems?.length) {
    const recentSection = el("section", "forge-persistent-workspace__recent");
    createRecentItems(recentSection, { items: options.recentItems });
    root.appendChild(recentSection);
  }

  const main = el("main", "forge-persistent-workspace__main");
  if (options.mainHtml) main.innerHTML = options.mainHtml;
  root.appendChild(main);
  container.appendChild(root);

  function paintAutosave() {
    if (destroyed) return;
    autosave.className = `ks-fe-autosave ks-fe-autosave--${autosaveState}`;
    autosave.setAttribute("data-work-state", autosaveState);
    autosave.setAttribute("aria-busy", autosaveState === "saving" ? "true" : "false");
    autosaveLabel.textContent = AUTOSAVE_LABEL[autosaveState];
    autosaveDetail.textContent =
      autosaveState === "saved" && lastSavedAt ? `Last saved ${lastSavedAt}` : "";
    root.setAttribute("data-work-state", autosaveState);
  }

  paintAutosave();

  return {
    getState: () => ({ autosaveState, lastSavedAt, activeViewId }),
    setAutosaveState(state, at) {
      if (destroyed) return;
      autosaveState = state;
      if (at != null) lastSavedAt = at;
      paintAutosave();
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
