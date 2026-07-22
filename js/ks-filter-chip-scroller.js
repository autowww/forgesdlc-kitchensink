/**
 * KS filter chip scroller — horizontal chip selection rail.
 * @module ks-filter-chip-scroller
 */

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

function emitChange(root, detail) {
  root.dispatchEvent(new CustomEvent("ks-filter-chips-change", { detail, bubbles: true }));
}

/**
 * @param {HTMLElement} container
 * @param {{
 *   id?: string,
 *   chips?: Array<{ value: string, label: string }>,
 *   value?: string | string[],
 *   multi?: boolean,
 *   onChange?: (state: { value: string | string[] }) => void,
 * }} options
 */
export function createFilterChipScroller(container, options = {}) {
  let destroyed = false;
  const multi = Boolean(options.multi);
  const chips = options.chips || [
    { value: "all", label: "All" },
    { value: "guides", label: "Guides" },
    { value: "api", label: "API" },
  ];
  let value = options.value ?? (multi ? [chips[0]?.value].filter(Boolean) : chips[0]?.value || "");
  const onChange = options.onChange || (() => {});

  container.innerHTML = "";
  const root = el("div", "ks-filter-chip-scroller", {
    hash: "Fcs",
    "data-ks-hash": "Fcs",
    "data-ks-type": "component",
    "data-ks-name": "filter-chip-scroller",
    "data-ks-filter-chips": "",
    id: options.id || undefined,
  });
  const track = el("div", "ks-filter-chip-scroller__track");
  root.appendChild(track);
  container.appendChild(root);

  function isActive(chipValue) {
    if (multi) return Array.isArray(value) && value.includes(chipValue);
    return value === chipValue;
  }

  function setSingle(chipValue) {
    value = chipValue;
    onChange({ value });
    emitChange(root, { value });
  }

  function setMulti(chipValue) {
    const arr = Array.isArray(value) ? [...value] : [];
    const idx = arr.indexOf(chipValue);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(chipValue);
    value = arr.length ? arr : [chipValue];
    onChange({ value });
    emitChange(root, { value });
  }

  function paint() {
    track.innerHTML = "";
    chips.forEach((chip) => {
      const active = isActive(chip.value);
      const btn = el("button", `ks-filter-chip${active ? " is-active" : ""}`, {
        type: "button",
        "aria-pressed": active ? "true" : "false",
      });
      btn.textContent = chip.label;
      btn.addEventListener("click", () => {
        if (destroyed) return;
        if (multi) setMulti(chip.value);
        else setSingle(chip.value);
        paint();
      });
      track.appendChild(btn);
    });
  }

  paint();

  return {
    getValue: () => (multi ? [...(Array.isArray(value) ? value : [])] : value),
    setValue(next) {
      if (destroyed) return;
      value = next;
      paint();
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}

function parseJsonAttr(el, attr) {
  const raw = el.getAttribute(attr);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function initExisting(root) {
  if (root.dataset.ksFilterChipsBound) return;
  root.dataset.ksFilterChipsBound = "1";
  const chips = parseJsonAttr(root, "data-chips");
  const multi = root.dataset.multi === "true";
  const valueRaw = root.dataset.value;
  let value = valueRaw;
  if (multi && valueRaw) {
    try {
      value = JSON.parse(valueRaw);
    } catch {
      value = valueRaw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  createFilterChipScroller(root, { chips: chips || undefined, multi, value: value ?? undefined });
}

function boot() {
  document.querySelectorAll("[data-ks-filter-chips]").forEach(initExisting);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}
