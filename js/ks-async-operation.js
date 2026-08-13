/**
 * ForgeAsyncOperation — status banner + progress + freshness region (ENT.APP.03).
 * @module ks-async-operation
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
 *   status?: 'idle' | 'running' | 'success' | 'error' | 'partial',
 *   detail?: string,
 *   percent?: number,
 *   updatedAt?: string,
 *   onRefresh?: () => void,
 *   onRetry?: () => void,
 *   contentHtml?: string,
 * }} options
 */
export function createAsyncOperation(container, options) {
  let destroyed = false;
  let state = {
    status: options.status || "idle",
    title: options.title,
    detail: options.detail || "",
    percent: options.percent ?? 0,
    updatedAt: options.updatedAt || "",
  };

  container.innerHTML = "";
  const root = el("div", "forge-async-operation", {
    hash: "Fao",
    "data-ks-hash": "Fao",
    "data-ks-type": "composition",
    "data-ks-name": "forge-async-operation",
    "data-studio-workspace": "async-operation",
    id: options.id || undefined,
  });

  const banner = el("div", "forge-async-operation__banner", { role: "status", "aria-live": "polite" });
  const progress = el("div", "forge-async-operation__progress", { role: "progressbar" });
  const freshness = el("div", "forge-async-operation__freshness");
  const body = el("div", "forge-async-operation__body");
  if (options.contentHtml) body.innerHTML = options.contentHtml;

  root.appendChild(banner);
  root.appendChild(progress);
  root.appendChild(freshness);
  root.appendChild(body);
  container.appendChild(root);

  function paint() {
    if (destroyed) return;
    banner.className = `forge-async-operation__banner forge-async-operation__banner--${state.status}`;
    banner.innerHTML = "";
    const title = el("strong", "forge-async-operation__title");
    title.textContent = state.title;
    banner.appendChild(title);
    if (state.detail) {
      const d = el("p", "forge-async-operation__detail");
      d.textContent = state.detail;
      banner.appendChild(d);
    }
    if (state.status === "error" && options.onRetry) {
      const retry = el("button", "btn btn-sm btn-outline-light", { type: "button" });
      retry.textContent = "Retry";
      retry.addEventListener("click", () => options.onRetry());
      banner.appendChild(retry);
    }

    const showBar = state.status === "running" || state.status === "partial";
    progress.hidden = !showBar;
    if (showBar) {
      const pct = Math.min(100, Math.max(0, state.percent));
      progress.setAttribute("aria-valuenow", String(pct));
      progress.setAttribute("aria-valuemin", "0");
      progress.setAttribute("aria-valuemax", "100");
      progress.innerHTML = `<div class="forge-async-operation__track"><div class="forge-async-operation__fill" style="width:${pct}%"></div></div>`;
    }

    freshness.innerHTML = "";
    if (state.updatedAt) {
      const t = el("time");
      t.dateTime = state.updatedAt;
      t.textContent = `Updated ${state.updatedAt}`;
      freshness.appendChild(t);
    }
    if (options.onRefresh) {
      const btn = el("button", "btn btn-sm btn-outline-secondary", { type: "button" });
      btn.textContent = "Refresh";
      btn.addEventListener("click", () => options.onRefresh());
      freshness.appendChild(btn);
    }
    root.setAttribute("data-studio-primary-state", state.status);
  }

  paint();

  return {
    getState: () => ({ ...state }),
    setState(next) {
      state = { ...state, ...next };
      paint();
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
