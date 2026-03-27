/**
 * Primary nav dropdowns: wide viewports use CSS :hover / :focus-within; narrow
 * viewports toggle .fs-nav-dropdown--open on trigger click (touch-friendly).
 */
(function () {
  "use strict";

  var mq = window.matchMedia("(max-width: 991.98px)");

  function closeAll(except) {
    document.querySelectorAll(".fs-nav-dropdown.fs-nav-dropdown--open").forEach(function (el) {
      if (except && el === except) return;
      el.classList.remove("fs-nav-dropdown--open");
      var t = el.querySelector(".fs-nav-dropdown__trigger");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  }

  function bind() {
    document.querySelectorAll("[data-fs-nav-dropdown]").forEach(function (root) {
      var trig = root.querySelector(".fs-nav-dropdown__trigger");
      if (!trig || trig.dataset.fsNavDropdownBound) return;
      trig.dataset.fsNavDropdownBound = "1";

      trig.addEventListener("click", function (ev) {
        if (!mq.matches) return;
        ev.preventDefault();
        var open = root.classList.toggle("fs-nav-dropdown--open");
        trig.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) closeAll(root);
        else closeAll(null);
      });
    });
  }

  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    closeAll(null);
  });

  document.addEventListener("click", function (ev) {
    if (!mq.matches) return;
    var t = ev.target;
    if (t.closest && t.closest("[data-fs-nav-dropdown]")) return;
    closeAll(null);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
