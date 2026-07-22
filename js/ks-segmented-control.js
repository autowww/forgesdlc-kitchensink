/**
 * Segmented control — sync active class + programmatic API.
 * @module ks-segmented-control
 */

/**
 * @param {HTMLElement} root
 * @param {{ onChange?: (value: string) => void }} options
 */
export function createSegmentedControl(root, options = {}) {
  if (root.dataset.ksSegmentedBound) {
    return bindApi(root, options);
  }
  root.dataset.ksSegmentedBound = "1";
  const inputs = root.querySelectorAll('input[type="radio"]');
  const onChange = options.onChange || (() => {});

  function currentValue() {
    const checked = root.querySelector('input[type="radio"]:checked');
    return checked ? checked.value : "";
  }

  function setValue(val) {
    inputs.forEach((input) => {
      input.checked = input.value === String(val);
      if (input.parentElement) {
        input.parentElement.classList.toggle("is-active", input.checked);
      }
    });
    onChange(currentValue());
    root.dispatchEvent(
      new CustomEvent("ks-segmented-change", {
        detail: { value: currentValue() },
        bubbles: true,
      })
    );
  }

  function paintActive() {
    inputs.forEach((input) => {
      if (input.parentElement) {
        input.parentElement.classList.toggle("is-active", input.checked);
      }
    });
  }

  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      paintActive();
      onChange(currentValue());
      root.dispatchEvent(
        new CustomEvent("ks-segmented-change", {
          detail: { value: currentValue() },
          bubbles: true,
        })
      );
    });
    if (input.checked && input.parentElement) {
      input.parentElement.classList.add("is-active");
    }
  });

  return bindApi(root, options, { setValue, getValue: currentValue });
}

function bindApi(root, options, helpers = null) {
  const getValue = helpers?.getValue || (() => {
    const checked = root.querySelector('input[type="radio"]:checked');
    return checked ? checked.value : "";
  });
  const setValue =
    helpers?.setValue ||
    ((val) => {
      root.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.checked = input.value === String(val);
        if (input.parentElement) {
          input.parentElement.classList.toggle("is-active", input.checked);
        }
      });
    });

  return {
    getValue,
    setValue,
    destroy() {
      root.dataset.ksSegmentedBound = "";
      if (options.onChange) options.onChange = () => {};
    },
  };
}

function init(root) {
  createSegmentedControl(root);
}

function boot() {
  document.querySelectorAll("[data-ks-segmented]").forEach(init);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}
