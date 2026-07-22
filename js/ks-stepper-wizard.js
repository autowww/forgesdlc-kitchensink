/**
 * Stepper wizard — Back/Next updates aria-current="step".
 */
(function () {
  "use strict";

  function init(root) {
    if (root.dataset.ksStepperBound) return;
    root.dataset.ksStepperBound = "1";
    var steps = root.querySelectorAll(".ks-stepper__step");
    var idx = 0;
    for (var i = 0; i < steps.length; i += 1) {
      if (steps[i].classList.contains("is-current")) idx = i;
    }

    function render() {
      steps.forEach(function (step, i) {
        step.classList.toggle("is-current", i === idx);
        if (i === idx) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
    }

    var prev = root.querySelector("[data-ks-step-prev]");
    var next = root.querySelector("[data-ks-step-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        idx = Math.max(0, idx - 1);
        render();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        idx = Math.min(steps.length - 1, idx + 1);
        render();
      });
    }
  }

  function boot() {
    document.querySelectorAll("[data-ks-stepper]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
