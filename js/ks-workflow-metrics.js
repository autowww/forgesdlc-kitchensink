/**
 * ForgeWorkflowMetrics — KPI cards with telemetry schema (ENT.APP.10).
 * @module ks-workflow-metrics
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
 *   title?: string,
 *   role?: string,
 *   metrics?: Array<{ id: string, label: string, value: string|number, unit?: string, trend?: string, actionLabel?: string, onAction?: () => void }>,
 *   empty?: boolean,
 *   error?: string,
 *   loading?: boolean,
 *   onDrilldown?: (id: string) => void,
 * }} options
 */
export function createWorkflowMetrics(container, options = {}) {
  let destroyed = false;
  let metrics = options.metrics || [];
  let uiState = {
    loading: options.loading ?? false,
    empty: options.empty ?? false,
    error: options.error || "",
  };

  container.innerHTML = "";
  const root = el("div", "forge-workflow-metrics", {
    hash: "Fwm",
    "data-ks-hash": "Fwm",
    "data-ks-type": "composition",
    "data-ks-name": "forge-workflow-metrics",
    "data-studio-workspace": "metrics",
    "data-telemetry-schema": "forge-workflow-v1",
    id: options.id || undefined,
  });

  const header = el("header", "forge-workflow-metrics__header");
  if (options.title) {
    const h1 = el("h1", "forge-workflow-metrics__title");
    h1.textContent = options.title;
    header.appendChild(h1);
  }
  if (options.role) {
    const role = el("span", "forge-workflow-metrics__role");
    role.textContent = options.role;
    header.appendChild(role);
  }
  root.appendChild(header);

  const stateRegion = el("div", "forge-workflow-metrics__state", { role: "status" });
  const grid = el("div", "forge-workflow-metrics__grid");
  root.appendChild(stateRegion);
  root.appendChild(grid);
  container.appendChild(root);

  function paint() {
    if (destroyed) return;
    stateRegion.innerHTML = "";
    grid.innerHTML = "";

    if (uiState.loading) {
      const msg = el("p", "forge-workflow-metrics__loading");
      msg.textContent = "Loading metrics…";
      stateRegion.appendChild(msg);
      return;
    }
    if (uiState.error) {
      const msg = el("p", "forge-workflow-metrics__error");
      msg.textContent = uiState.error;
      stateRegion.appendChild(msg);
      return;
    }
    if (uiState.empty || !metrics.length) {
      const msg = el("p", "forge-workflow-metrics__empty");
      msg.textContent = "No metrics available";
      stateRegion.appendChild(msg);
      return;
    }

    metrics.forEach((metric) => {
      const card = el("article", "forge-workflow-metrics__card", { "data-metric-id": metric.id });
      const label = el("span", "forge-workflow-metrics__label");
      label.textContent = metric.label;
      const value = el("strong", "forge-workflow-metrics__value");
      value.textContent = `${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`;
      card.appendChild(label);
      card.appendChild(value);
      if (metric.trend) {
        const trend = el("span", "forge-workflow-metrics__trend");
        trend.textContent = metric.trend;
        card.appendChild(trend);
      }
      if (metric.actionLabel) {
        const btn = el("button", "btn btn-sm btn-outline-primary", { type: "button" });
        btn.textContent = metric.actionLabel;
        btn.addEventListener("click", () => {
          if (destroyed) return;
          metric.onAction?.();
          options.onDrilldown?.(metric.id);
          root.dispatchEvent(
            new CustomEvent("ks-workflow-metric", { detail: { id: metric.id }, bubbles: true })
          );
        });
        card.appendChild(btn);
      }
      card.addEventListener("click", (e) => {
        if (destroyed || e.target.closest("button")) return;
        options.onDrilldown?.(metric.id);
      });
      grid.appendChild(card);
    });
  }

  paint();

  return {
    setMetrics(next) {
      if (destroyed) return;
      metrics = next;
      uiState.empty = !next.length;
      paint();
    },
    setState({ loading, empty, error }) {
      if (destroyed) return;
      if (loading != null) uiState.loading = loading;
      if (empty != null) uiState.empty = empty;
      if (error != null) uiState.error = error;
      paint();
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
