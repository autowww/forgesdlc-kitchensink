/**
 * ForgeAdaptiveWorkspace — guided/standard/expert modes with help and templates (ENT.APP).
 * @module ks-adaptive-workspace
 */

import { createContextHelp } from "./ks-context-help.js";
import { createShortcutRegistry } from "./ks-shortcut-registry.js";
import { createTemplatePicker } from "./ks-template-picker.js";
import { createSmartDefault } from "./ks-smart-default.js";

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

const MODES = ["guided", "standard", "expert"];

/**
 * @param {HTMLElement} container
 * @param {{
 *   id?: string,
 *   mode?: 'guided'|'standard'|'expert',
 *   title?: string,
 *   guidedHtml?: string,
 *   standardHtml?: string,
 *   expertHtml?: string,
 *   helpTopics?: Array<{ id: string, title: string, body: string }>,
 *   shortcuts?: Array<{ keys: string, action: string, label?: string }>,
 *   templates?: Array<{ id: string, name: string, description?: string }>,
 *   smartDefaults?: Array<{ field: string, value: string, reason?: string }>,
 *   onModeChange?: (mode: string) => void,
 *   onApplyTemplate?: (id: string) => void,
 * }} options
 */
export function createAdaptiveWorkspace(container, options = {}) {
  let destroyed = false;
  let mode = options.mode || "standard";
  const modeHtml = {
    guided: options.guidedHtml || "",
    standard: options.standardHtml || "",
    expert: options.expertHtml || "",
  };

  container.innerHTML = "";
  const root = el("div", "forge-adaptive-workspace", {
    hash: "Faw",
    "data-ks-hash": "Faw",
    "data-ks-type": "composition",
    "data-ks-name": "forge-adaptive-workspace",
    "data-studio-workspace": "adaptive",
    "data-adaptive-mode": mode,
    id: options.id || undefined,
  });

  const header = el("header", "forge-adaptive-workspace__header");
  if (options.title) {
    const h1 = el("h1", "forge-adaptive-workspace__title");
    h1.textContent = options.title;
    header.appendChild(h1);
  }

  const toggle = el("div", "forge-adaptive-workspace__mode-toggle", { role: "group", "aria-label": "Workspace mode" });
  const modeButtons = {};
  MODES.forEach((m) => {
    const btn = el("button", `forge-adaptive-workspace__mode-btn${m === mode ? " forge-adaptive-workspace__mode-btn--active" : ""}`, {
      type: "button",
      "data-mode": m,
      "aria-pressed": m === mode ? "true" : "false",
    });
    btn.textContent = m.charAt(0).toUpperCase() + m.slice(1);
    btn.addEventListener("click", () => setModeInternal(m));
    modeButtons[m] = btn;
    toggle.appendChild(btn);
  });
  header.appendChild(toggle);
  root.appendChild(header);

  const sidebar = el("aside", "forge-adaptive-workspace__sidebar");
  if (options.helpTopics?.length) {
    const helpSlot = el("div", "forge-adaptive-workspace__help");
    createContextHelp(helpSlot, { topics: options.helpTopics });
    sidebar.appendChild(helpSlot);
  }
  if (options.shortcuts?.length) {
    const shortcutSlot = el("div", "forge-adaptive-workspace__shortcuts");
    createShortcutRegistry(shortcutSlot, { shortcuts: options.shortcuts });
    sidebar.appendChild(shortcutSlot);
  }
  if (options.templates?.length) {
    const templateSlot = el("div", "forge-adaptive-workspace__templates");
    createTemplatePicker(templateSlot, {
      templates: options.templates,
      onApply: options.onApplyTemplate,
    });
    sidebar.appendChild(templateSlot);
  }
  if (options.smartDefaults?.length) {
    const defaultsSlot = el("div", "forge-adaptive-workspace__defaults");
    createSmartDefault(defaultsSlot, { defaults: options.smartDefaults });
    sidebar.appendChild(defaultsSlot);
  }

  const content = el("main", "forge-adaptive-workspace__content");
  const slot = el("div", "forge-adaptive-workspace__slot");
  content.appendChild(slot);
  root.appendChild(sidebar);
  root.appendChild(content);
  container.appendChild(root);

  function paintSlot() {
    slot.innerHTML = modeHtml[mode] || "";
  }

  function setModeInternal(next) {
    if (destroyed || !MODES.includes(next)) return;
    mode = next;
    root.setAttribute("data-adaptive-mode", mode);
    MODES.forEach((m) => {
      modeButtons[m].classList.toggle("forge-adaptive-workspace__mode-btn--active", m === mode);
      modeButtons[m].setAttribute("aria-pressed", m === mode ? "true" : "false");
    });
    paintSlot();
    options.onModeChange?.(mode);
  }

  paintSlot();

  return {
    getMode: () => mode,
    setMode(next) {
      setModeInternal(next);
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
