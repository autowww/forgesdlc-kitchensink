/**
 * Stepper wizard — Back/Next + programmatic step API.
 * @module ks-stepper-wizard
 */

/**
 * @param {HTMLElement} root
 * @param {{ onChange?: (step: number) => void, steps?: string[] }} options
 */
export function createStepperWizard(root, options = {}) {
  if (root.dataset.ksStepperBound) {
    return bindApi(root);
  }
  root.dataset.ksStepperBound = "1";

  let steps = root.querySelectorAll(".ks-stepper__step");
  if (!steps.length && options.steps?.length) {
    const list = root.querySelector(".ks-stepper__list") || root.appendChild(document.createElement("ol"));
    list.className = "ks-stepper__list";
    list.innerHTML = "";
    options.steps.forEach((label, i) => {
      const li = document.createElement("li");
      li.className = "ks-stepper__step";
      li.innerHTML = `<span class="ks-stepper__num">${i + 1}</span><span class="ks-stepper__label"></span>`;
      li.querySelector(".ks-stepper__label").textContent = label;
      list.appendChild(li);
    });
    steps = root.querySelectorAll(".ks-stepper__step");
  }

  let idx = 0;
  for (let i = 0; i < steps.length; i += 1) {
    if (steps[i].classList.contains("is-current")) idx = i;
  }

  const onChange = options.onChange || (() => {});

  function render() {
    steps.forEach((step, i) => {
      step.classList.toggle("is-current", i === idx);
      if (i === idx) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
    onChange(idx);
    root.dispatchEvent(
      new CustomEvent("ks-stepper-change", { detail: { step: idx }, bubbles: true })
    );
  }

  const prev = root.querySelector("[data-ks-step-prev]");
  const next = root.querySelector("[data-ks-step-next]");
  if (prev) {
    prev.addEventListener("click", () => {
      idx = Math.max(0, idx - 1);
      render();
    });
  }
  if (next) {
    next.addEventListener("click", () => {
      idx = Math.min(steps.length - 1, idx + 1);
      render();
    });
  }

  return bindApi(root, { getIdx: () => idx, setIdx: (n) => { idx = n; render(); }, steps });
}

function bindApi(root, state = null) {
  const steps = state?.steps || root.querySelectorAll(".ks-stepper__step");
  let idx = 0;
  steps.forEach((step, i) => {
    if (step.classList.contains("is-current")) idx = i;
  });

  return {
    getValue: () => (state ? state.getIdx() : idx),
    setValue(n) {
      const next = Math.min(steps.length - 1, Math.max(0, Number(n)));
      if (state) state.setIdx(next);
      else {
        idx = next;
        steps.forEach((step, i) => {
          step.classList.toggle("is-current", i === idx);
          if (i === idx) step.setAttribute("aria-current", "step");
          else step.removeAttribute("aria-current");
        });
      }
    },
    destroy() {
      root.dataset.ksStepperBound = "";
    },
  };
}

function init(root) {
  createStepperWizard(root);
}

function boot() {
  document.querySelectorAll("[data-ks-stepper]").forEach(init);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}
