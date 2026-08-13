/**
 * ForgeGovernedForm — form controller + error summary + submit guard (ENT.APP.04).
 * @module ks-governed-form
 */

import { createFormController } from "./ks-form-controller.js";

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

const FIELD_LABELS = {};

/**
 * @param {HTMLElement} container
 * @param {{
 *   id?: string,
 *   formHtml: string,
 *   fieldLabels?: Record<string, string>,
 *   validate?: (values: Record<string, unknown>) => Record<string, string>,
 *   onSubmit?: (values: Record<string, unknown>) => void | Promise<void>,
 *   submitLabel?: string,
 * }} options
 */
export function createGovernedForm(container, options) {
  let destroyed = false;
  const labels = { ...FIELD_LABELS, ...(options.fieldLabels || {}) };
  let submitting = false;

  container.innerHTML = "";
  const root = el("div", "forge-governed-form", {
    hash: "Fgf",
    "data-ks-hash": "Fgf",
    "data-ks-type": "composition",
    "data-ks-name": "forge-governed-form",
    "data-studio-workspace": "governed-form",
    id: options.id || undefined,
  });

  const summaryHost = el("div", "forge-governed-form__summary", { role: "alert", "aria-live": "assertive" });
  summaryHost.hidden = true;
  root.appendChild(summaryHost);

  const formWrap = el("div", "forge-governed-form__form");
  formWrap.innerHTML = options.formHtml;
  const formEl = formWrap.querySelector("form") || formWrap;
  formEl.setAttribute("data-ks-form", "");
  root.appendChild(formWrap);

  const actions = el("div", "forge-governed-form__actions");
  const submitBtn = el("button", "btn btn-primary", {
    type: "button",
    "data-studio-primary-cta": "",
  });
  submitBtn.textContent = options.submitLabel || "Submit";
  actions.appendChild(submitBtn);
  root.appendChild(actions);

  container.appendChild(root);

  function paintSummary(errors) {
    const keys = Object.keys(errors || {});
    if (!keys.length) {
      summaryHost.hidden = true;
      summaryHost.innerHTML = "";
      return;
    }
    summaryHost.hidden = false;
    const title = el("h2", "forge-governed-form__summary-title");
    title.textContent = `Fix ${keys.length} field${keys.length === 1 ? "" : "s"} to continue`;
    summaryHost.appendChild(title);
    const list = el("ul", "forge-governed-form__summary-list");
    keys.forEach((key) => {
      const li = el("li");
      const btn = el("button", "forge-governed-form__summary-link", { type: "button" });
      const label = labels[key] || key;
      btn.textContent = `${label}: ${errors[key]}`;
      btn.addEventListener("click", () => {
        const field = formEl.querySelector(`[name="${key}"], #${key}`);
        if (field) field.focus();
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
    summaryHost.innerHTML = "";
    summaryHost.appendChild(title);
    summaryHost.appendChild(list);
  }

  const controller = createFormController(formEl, {
    validate: options.validate,
    onChange: () => paintSummary({}),
  });

  submitBtn.addEventListener("click", async () => {
    if (destroyed || submitting) return;
    const { values, errors, valid } = controller.validate();
    paintSummary(errors);
    if (!valid) return;
    submitting = true;
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    try {
      await Promise.resolve(options.onSubmit ? options.onSubmit(values) : undefined);
    } finally {
      submitting = false;
      submitBtn.disabled = false;
      submitBtn.removeAttribute("aria-busy");
    }
  });

  return {
    getValues: () => controller.getValues(),
    setValues: (v) => controller.setValues(v),
    validate: () => {
      const result = controller.validate();
      paintSummary(result.errors);
      return result;
    },
    destroy() {
      destroyed = true;
      controller.destroy();
      container.innerHTML = "";
    },
  };
}
