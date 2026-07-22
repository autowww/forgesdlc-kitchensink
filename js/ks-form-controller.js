/**
 * KS form controller — read/write values on render_form_* markup.
 * @module ks-form-controller
 */

function fieldValue(el) {
  if (!el) return undefined;
  const tag = el.tagName?.toLowerCase();
  const type = (el.type || "").toLowerCase();
  if (type === "checkbox" || type === "radio") return el.checked;
  if (type === "range") return el.value;
  return el.value;
}

function setFieldValue(el, value) {
  if (!el) return;
  const type = (el.type || "").toLowerCase();
  if (type === "checkbox" || type === "radio") {
    el.checked = Boolean(value);
  } else {
    el.value = value == null ? "" : String(value);
  }
}

/**
 * @param {HTMLElement} root
 * @param {{
 *   onChange?: (values: Record<string, unknown>) => void,
 *   validate?: (values: Record<string, unknown>) => Record<string, string>,
 * }} options
 */
export function createFormController(root, options = {}) {
  let destroyed = false;
  const onChange = options.onChange || (() => {});
  const validate = options.validate || (() => ({}));

  function fields() {
    return root.querySelectorAll("input, select, textarea");
  }

  function collect() {
    const values = {};
    fields().forEach((el) => {
      const name = el.name || el.id;
      if (!name) return;
      values[name] = fieldValue(el);
    });
    return values;
  }

  function paintErrors(errors) {
    fields().forEach((el) => {
      const name = el.name || el.id;
      if (!name) return;
      const msg = errors[name];
      el.classList.toggle("is-invalid", Boolean(msg));
      el.classList.toggle("is-valid", !msg && el.value !== "");
      el.setAttribute("aria-invalid", msg ? "true" : "false");
    });
  }

  function emit() {
    if (destroyed) return;
    const values = collect();
    const errors = validate(values);
    paintErrors(errors);
    onChange(values);
    root.dispatchEvent(
      new CustomEvent("ks-form-change", { detail: { values, errors }, bubbles: true })
    );
  }

  fields().forEach((el) => {
    el.addEventListener("input", emit);
    el.addEventListener("change", emit);
  });

  return {
    getValues: () => collect(),
    setValues(next) {
      if (destroyed) return;
      fields().forEach((el) => {
        const name = el.name || el.id;
        if (name && Object.prototype.hasOwnProperty.call(next, name)) {
          setFieldValue(el, next[name]);
        }
      });
      emit();
    },
    setErrors(errors) {
      if (destroyed) return;
      paintErrors(errors || {});
    },
    validate() {
      const values = collect();
      const errors = validate(values);
      paintErrors(errors);
      return { values, errors, valid: !Object.keys(errors).length };
    },
    destroy() {
      destroyed = true;
    },
  };
}

function initExisting(root) {
  if (root.dataset.ksFormBound) return;
  root.dataset.ksFormBound = "1";
  createFormController(root);
}

function boot() {
  document.querySelectorAll("[data-ks-form]").forEach(initExisting);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}
