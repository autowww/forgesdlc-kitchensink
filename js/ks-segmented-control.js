/**
 * Segmented control — sync active class on radio change.
 */
(function () {
  "use strict";

  function init(root) {
    if (root.dataset.ksSegmentedBound) return;
    root.dataset.ksSegmentedBound = "1";
    var inputs = root.querySelectorAll('input[type="radio"]');
    inputs.forEach(function (input) {
      input.addEventListener("change", function () {
        root.querySelectorAll(".ks-segmented__item").forEach(function (item) {
          item.classList.toggle("is-active", item.contains(input) && input.checked);
        });
      });
      if (input.checked && input.parentElement) {
        input.parentElement.classList.add("is-active");
      }
    });
  }

  function boot() {
    document.querySelectorAll("[data-ks-segmented]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
