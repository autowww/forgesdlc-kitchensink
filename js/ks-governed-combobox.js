/**
 * Governed combobox (Gcb) — flat-list adapter over createTreeCombobox.
 * @module ks-governed-combobox
 */
import { createTreeCombobox } from "./ks-tree-combobox.js";

function readJsonScript(root) {
  const script = root.querySelector('script[type="application/json"][data-ks-combobox-data]');
  if (!script) return null;
  try {
    return JSON.parse(script.textContent || "{}");
  } catch {
    return null;
  }
}

/**
 * @param {HTMLElement} container
 * @param {object} options
 */
export function createGovernedCombobox(container, options = {}) {
  const items = (options.items || []).map((item) => {
    if (typeof item === "string") return { id: item, label: item };
    return {
      id: item.value ?? item.id,
      label: item.label ?? String(item.value ?? item.id),
    };
  });

  return createTreeCombobox(container, {
    ...options,
    items,
    panelLayout: options.panelLayout || "inline",
    defaultOpen: options.defaultOpen ?? false,
    visualHash: options.visualHash || "Gcb",
    ksName: options.ksName || "governed-combobox",
    rootClass: "ks-governed-combobox forge-tree-combobox",
  });
}

function initExisting(root) {
  if (root.dataset.ksComboboxBound) return;
  root.dataset.ksComboboxBound = "1";
  const data = readJsonScript(root);
  const label = root.dataset.label || "Topic";
  const placeholder = root.dataset.placeholder || "Search topics…";
  const items = data?.items || [
    { value: "sdlc", label: "SDLC" },
    { value: "pdlc", label: "PDLC" },
    { value: "agents", label: "Agents" },
  ];
  createGovernedCombobox(root, { label, placeholder, items, id: root.id || undefined });
}

function boot() {
  document.querySelectorAll("[data-ks-combobox]").forEach(initExisting);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}
