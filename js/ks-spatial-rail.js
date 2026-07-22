/**
 * Spatial coverflow rail — sets per-item rotateY / translateZ from scroll position.
 */
(function () {
  "use strict";

  function updateRail(rail) {
    var track = rail.querySelector(".fs-rail__track");
    var items = rail.querySelectorAll(".fs-rail__item");
    if (!track || !items.length) return;

    var center = rail.scrollLeft + rail.clientWidth / 2;
    items.forEach(function (item) {
      var itemCenter = item.offsetLeft + item.offsetWidth / 2;
      var dist = (itemCenter - center) / item.offsetWidth;
      var ry = dist * -35;
      var z = Math.max(0, 40 - Math.abs(dist) * 20);
      item.style.setProperty("--ks-rail-ry", ry.toFixed(1) + "deg");
      item.style.setProperty("--ks-rail-z", z.toFixed(0) + "px");
      item.classList.toggle("is-center", Math.abs(dist) < 0.35);
      item.classList.toggle("is-side", Math.abs(dist) >= 0.35);
    });
  }

  function init() {
    document.querySelectorAll(".fs-rail--spatial").forEach(function (rail) {
      if (rail.dataset.ksSpatialRailBound) return;
      rail.dataset.ksSpatialRailBound = "1";
      rail.addEventListener("scroll", function () {
        updateRail(rail);
      });
      updateRail(rail);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
