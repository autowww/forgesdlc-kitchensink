/**
 * ForgeJobCenter — job list with freshness and refresh (ENT.APP.03).
 * @module ks-job-center
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
 *   jobs?: Array<{ id: string, title: string, status: string, percent?: number, updatedAt?: string, detail?: string }>,
 *   onRefresh?: () => void,
 *   onRetry?: (id: string) => void,
 * }} options
 */
export function createJobCenter(container, options = {}) {
  let destroyed = false;
  let jobs = options.jobs || [];

  container.innerHTML = "";
  const root = el("div", "forge-job-center", {
    hash: "Fjc",
    "data-ks-hash": "Fjc",
    "data-ks-type": "composition",
    "data-ks-name": "forge-job-center",
    "data-studio-workspace": "jobs",
    id: options.id || undefined,
  });

  const freshness = el("div", "forge-job-center__freshness ks-fe-freshness ks-fe-freshness--fresh", {
    role: "status",
    "aria-live": "polite",
  });
  const freshnessLabel = el("span", "ks-fe-freshness__label");
  freshnessLabel.textContent = "Job status";
  freshness.appendChild(freshnessLabel);
  if (options.onRefresh) {
    const refresh = el("button", "btn btn-sm btn-outline-secondary ks-fe-freshness__refresh", { type: "button" });
    refresh.textContent = "Refresh";
    refresh.addEventListener("click", () => options.onRefresh());
    freshness.appendChild(refresh);
  }
  root.appendChild(freshness);

  const list = el("ul", "forge-job-center__list");
  root.appendChild(list);
  container.appendChild(root);

  function paint() {
    if (destroyed) return;
    list.innerHTML = "";
    jobs.forEach((job) => {
      const li = el("li", `forge-job-center__job forge-job-center__job--${job.status}`, {
        "data-job-id": job.id,
      });
      const title = el("strong", "forge-job-center__title");
      title.textContent = job.title;
      li.appendChild(title);
      const status = el("span", "forge-job-center__status");
      status.textContent = job.status;
      li.appendChild(status);
      if (job.detail) {
        const detail = el("p", "forge-job-center__detail");
        detail.textContent = job.detail;
        li.appendChild(detail);
      }
      if (job.updatedAt) {
        const time = el("time", "forge-job-center__time", { dateTime: job.updatedAt });
        time.textContent = job.updatedAt;
        li.appendChild(time);
      }
      if (job.percent != null && (job.status === "running" || job.status === "partial")) {
        const bar = el("div", "forge-job-center__progress", { role: "progressbar" });
        const pct = Math.min(100, Math.max(0, job.percent));
        bar.setAttribute("aria-valuenow", String(pct));
        bar.setAttribute("aria-valuemin", "0");
        bar.setAttribute("aria-valuemax", "100");
        bar.innerHTML = `<div class="forge-job-center__track"><div class="forge-job-center__fill" style="width:${pct}%"></div></div>`;
        li.appendChild(bar);
      }
      if (job.status === "error" && options.onRetry) {
        const retry = el("button", "btn btn-sm btn-outline-light", { type: "button" });
        retry.textContent = "Retry";
        retry.addEventListener("click", () => options.onRetry(job.id));
        li.appendChild(retry);
      }
      list.appendChild(li);
    });
  }

  paint();

  return {
    setJobs(next) {
      if (destroyed) return;
      jobs = next;
      paint();
    },
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
