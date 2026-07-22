/**
 * Section swimlanes — collapse scrolled-past section titles into a dock under the site header.
 *
 * Markup: sections with [data-fs-section-lane] and a visible heading (h2 or data-fs-lane-heading).
 * Dock:   <div class="fs-section-swimlanes" id="fsSectionSwimlanes" role="navigation"></div>
 *
 * API: ForgeSectionSwimlanes.init({ maxLanes: 6, headerSelector: '.cap-header', dockSelector: '#fsSectionSwimlanes' })
 */
(function () {
  "use strict";

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var MORPH_MS = 420;
  var LANE_FONT_PX = 13;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function init(options) {
    options = options || {};
    if (init._bound) return;
    init._bound = true;
    var maxLanes = options.maxLanes || 6;
    var headerSelector = options.headerSelector || ".cap-header";
    var dockSelector = options.dockSelector || "#fsSectionSwimlanes";
    var dock = document.querySelector(dockSelector);
    if (!dock) return;

    var header = document.querySelector(headerSelector);
    var sections = Array.prototype.slice.call(
      document.querySelectorAll("[data-fs-section-lane]")
    );
    if (!sections.length) return;

    var laneHeight = 32;
    var reduceMotion = mqReduce.matches;
    var lanes = [];
    var animating = Object.create(null);
    var syncPending = false;
    var collapseHold = Object.create(null);
    var navigationLock = 0;

    function holdCollapse(id, ms) {
      collapseHold[id] = Date.now() + (ms || 1200);
    }

    function isCollapseHeld(id) {
      return collapseHold[id] && Date.now() < collapseHold[id];
    }

    function holdNavigation(ms) {
      navigationLock = Date.now() + (ms || 900);
    }

    function isNavigationLocked() {
      return navigationLock && Date.now() < navigationLock;
    }

    function documentTop(el) {
      var y = 0;
      while (el) {
        y += el.offsetTop || 0;
        el = el.offsetParent;
      }
      return y;
    }

    function measureHeader() {
      var nav = header ? header.querySelector(".cap-header__nav") : null;
      var el = nav || header;
      var h = el ? el.offsetHeight : 56;
      document.documentElement.style.setProperty("--fs-site-header-h", h + "px");
      return h;
    }

    function dockHeightPx() {
      return (
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--fs-swimlanes-h"
          ) || "0",
          10
        ) || 0
      );
    }

    function dockLineY() {
      return measureHeader() + dockHeightPx() + 6;
    }

    function updateDockHeight() {
      var count = dock.querySelectorAll(".fs-section-swimlane").length;
      var h = count * laneHeight;
      document.documentElement.style.setProperty("--fs-swimlanes-h", h + "px");
      if (count === 0) {
        dock.setAttribute("hidden", "");
      } else {
        dock.removeAttribute("hidden");
      }
      if (window.innerWidth <= 390 && h > window.innerHeight * 0.4) {
        dock.setAttribute("data-fs-swimlanes-collapsed", "true");
      } else {
        dock.removeAttribute("data-fs-swimlanes-collapsed");
      }
    }

    function getTitleEl(section) {
      var sel = section.getAttribute("data-fs-lane-heading");
      if (sel) {
        var custom = section.querySelector(sel);
        if (custom) return custom;
      }
      return section.querySelector(
        ".fs-section-lane-title, h2.cap-section__title, h2[id], h1.cap-hero__title"
      );
    }

    function getSectionTitle(section) {
      var titleEl = getTitleEl(section);
      if (titleEl && titleEl.textContent) {
        return titleEl.textContent.trim();
      }
      var attr = section.getAttribute("data-fs-lane-title");
      if (!attr) return "";
      var tmp = document.createElement("div");
      tmp.innerHTML = attr;
      return (tmp.textContent || "").trim();
    }

    function getSectionId(section) {
      var titleEl = getTitleEl(section);
      if (titleEl && titleEl.id) return titleEl.id;
      return section.id || "";
    }

    function findSectionById(id) {
      for (var i = 0; i < sections.length; i++) {
        if (getSectionId(sections[i]) === id) return sections[i];
      }
      return null;
    }

    function hasLane(id) {
      for (var i = 0; i < lanes.length; i++) {
        if (lanes[i].id === id) return true;
      }
      return false;
    }

    function setGarageOut(section, on) {
      var titleEl = getTitleEl(section);
      if (!titleEl) return;
      titleEl.classList.toggle("fs-section-title--garage-out", on);
      if (!on) {
        titleEl.classList.remove("fs-section-title--garage-in");
      }
    }

    function revealTitle(section, instant) {
      var titleEl = getTitleEl(section);
      if (!titleEl) return;
      section.removeAttribute("data-fs-garage");
      if (instant || reduceMotion) {
        setGarageOut(section, false);
        return;
      }
      titleEl.classList.remove("fs-section-title--garage-out");
      titleEl.classList.add("fs-section-title--garage-in");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          titleEl.classList.remove("fs-section-title--garage-in");
        });
      });
    }

    function pageScrollY() {
      return (
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        0
      );
    }

    function heroSection() {
      return sections[0] || null;
    }

    function heroNeedsRestore() {
      var hero = heroSection();
      if (!hero) return false;
      var id = getSectionId(hero);
      var titleEl = getTitleEl(hero);
      if (!titleEl) return false;
      if (
        !titleEl.classList.contains("fs-section-title--garage-out") &&
        !hasLane(id) &&
        hero.getAttribute("data-fs-garage") !== "out"
      ) {
        return false;
      }
      var headerH = measureHeader();
      var heroTop = hero.getBoundingClientRect().top;
      return (
        pageScrollY() <= 420 &&
        heroTop >= headerH - 16 &&
        heroTop <= headerH + dockHeightPx() + 140
      );
    }

    function shouldResetAll() {
      return pageScrollY() <= 120 || heroNeedsRestore();
    }

    function titleHasPassed(section, titleEl, line) {
      var id = getSectionId(section);
      var collapsed =
        section.getAttribute("data-fs-garage") === "out" ||
        hasLane(id) ||
        animating[id];

      if (collapsed) {
        return section.getBoundingClientRect().top < line - 24;
      }

      var rect = titleEl.getBoundingClientRect();
      if (rect.height >= 8) {
        return rect.bottom <= line + 2;
      }
      return section.getBoundingClientRect().top < line - 24;
    }

    function resetAllSections() {
      document.querySelectorAll(".fs-section-title-morph").forEach(function (node) {
        node.remove();
      });
      sections.forEach(function (section) {
        var id = getSectionId(section);
        delete animating[id];
        removeLaneForSection(id);
        revealTitle(section, true);
      });
      setActiveLane(null);
      updateDockHeight();
    }

    function syncGarage() {
      syncPending = false;

      if (shouldResetAll()) {
        resetAllSections();
        return;
      }

      var line = dockLineY();
      var revealed = false;

      sections.forEach(function (section) {
        var titleEl = getTitleEl(section);
        var id = getSectionId(section);
        if (!titleEl || !id) return;

        if (titleHasPassed(section, titleEl, line)) {
          if (
            section.getAttribute("data-fs-garage") === "out" ||
            animating[id] ||
            isCollapseHeld(id)
          ) {
            return;
          }
          animating[id] = true;
          section.setAttribute("data-fs-garage", "out");
          morphTitleToLane(section, function () {
            delete animating[id];
            scheduleSync();
          });
        } else if (
          section.getAttribute("data-fs-garage") === "out" ||
          hasLane(id)
        ) {
          if (isNavigationLocked() || animating[id]) return;
          delete animating[id];
          removeLaneForSection(id);
          revealTitle(section, true);
          revealed = true;
        }
      });

      if (revealed) {
        line = dockLineY();
      }

      setActiveLane(lanes.length ? lanes[lanes.length - 1].id : null);

      if (revealed && lanes.length) {
        scheduleSync();
      }
    }

    function laneSlotMetrics() {
      var headerH = measureHeader();
      var laneCount = dock.querySelectorAll(
        ".fs-section-swimlane:not(.fs-section-swimlane--morph-pending)"
      ).length;
      var pad = Math.min(32, Math.max(16, window.innerWidth * 0.03));
      return {
        top: headerH + laneCount * laneHeight + laneHeight * 0.22,
        left: pad,
        width: Math.max(200, window.innerWidth - pad * 2),
      };
    }

    function scrollToSection(section, instant) {
      if (section.classList.contains("cap-hero")) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        return;
      }
      (getTitleEl(section) || section).scrollIntoView({
        behavior: instant || reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }

    function jumpToSection(section) {
      scrollToSection(section, true);
      window.setTimeout(function () {
        scrollToSection(section, true);
        scheduleSync();
      }, 50);
    }

    function restoreSection(section) {
      var id = getSectionId(section);
      var titleEl = getTitleEl(section);
      if (!id) return;
      delete animating[id];
      section.removeAttribute("data-fs-garage");
      if (titleEl) {
        titleEl.classList.remove(
          "fs-section-title--garage-out",
          "fs-section-title--garage-in"
        );
      }
      removeLaneForSection(id);
      setActiveLane(lanes.length ? lanes[lanes.length - 1].id : null);
      updateDockHeight();
    }

    function createLaneButton(id, title) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fs-section-swimlane";
      btn.setAttribute("data-fs-lane-section", id);
      btn.setAttribute("aria-label", "Jump to section: " + title);
      btn.innerHTML =
        '<span class="fs-section-swimlane__label">' + escapeHtml(title) + "</span>";
      btn.addEventListener("click", function () {
        var section = findSectionById(id);
        if (!section) return;
        holdNavigation(1000);
        holdCollapse(id, 1200);
        restoreSection(section);
        jumpToSection(section);
      });
      return btn;
    }

    function setActiveLane(id) {
      lanes.forEach(function (lane) {
        lane.el.classList.toggle("fs-section-swimlane--active", lane.id === id);
      });
    }

    function removeLaneForSection(sectionId) {
      var kept = [];
      lanes.forEach(function (lane) {
        if (lane.id === sectionId) {
          lane.el.remove();
        } else {
          kept.push(lane);
        }
      });
      lanes = kept;
      updateDockHeight();
    }

    function commitLane(id, title, btn) {
      removeLaneForSection(id);
      if (!btn.parentNode) {
        dock.appendChild(btn);
      }
      lanes.push({ id: id, title: title, el: btn });
      while (lanes.length > maxLanes) {
        var dropped = lanes.shift();
        dropped.el.remove();
        var evicted = findSectionById(dropped.id);
        if (evicted) {
          delete animating[dropped.id];
          evicted.removeAttribute("data-fs-garage");
          revealTitle(evicted, true);
        }
      }
      if (!btn.classList.contains("fs-section-swimlane--morph-pending")) {
        btn.classList.add("fs-section-swimlane--entering");
        btn.addEventListener(
          "animationend",
          function () {
            btn.classList.remove("fs-section-swimlane--entering");
          },
          { once: true }
        );
      }
      setActiveLane(id);
      updateDockHeight();
    }

    function addLaneInstant(section) {
      var id = getSectionId(section);
      var title = getSectionTitle(section);
      if (!id || !title) return;
      var btn = createLaneButton(id, title);
      btn.classList.add("fs-section-swimlane--active");
      commitLane(id, title, btn);
    }

    function morphTitleToLane(section, done) {
      var titleEl = getTitleEl(section);
      var id = getSectionId(section);
      var title = getSectionTitle(section);
      if (!titleEl || !id || !title) {
        done();
        return;
      }

      if (reduceMotion) {
        setGarageOut(section, true);
        addLaneInstant(section);
        done();
        return;
      }

      var fromRect = titleEl.getBoundingClientRect();
      if (fromRect.height < 4 || fromRect.width < 4) {
        setGarageOut(section, true);
        addLaneInstant(section);
        done();
        return;
      }

      var computed = window.getComputedStyle(titleEl);
      var toSlot = laneSlotMetrics();
      var fromFont = parseFloat(computed.fontSize) || 32;
      var scale = Math.min(
        0.62,
        LANE_FONT_PX / fromFont,
        (toSlot.width * 0.92) / fromRect.width
      );
      var dx = toSlot.left - fromRect.left;
      var dy = toSlot.top - fromRect.top;

      var btn = createLaneButton(id, title);
      btn.classList.add("fs-section-swimlane--morph-pending");
      dock.removeAttribute("hidden");

      var morph = document.createElement("div");
      morph.className = "fs-section-title-morph";
      morph.setAttribute("aria-hidden", "true");
      morph.textContent = titleEl.textContent;
      morph.style.left = fromRect.left + "px";
      morph.style.top = fromRect.top + "px";
      morph.style.width = fromRect.width + "px";
      morph.style.fontFamily = computed.fontFamily;
      morph.style.fontSize = computed.fontSize;
      morph.style.fontWeight = computed.fontWeight;
      morph.style.lineHeight = computed.lineHeight;
      morph.style.letterSpacing = computed.letterSpacing;
      morph.style.color = computed.color;

      document.body.appendChild(morph);
      setGarageOut(section, true);

      function finishMorph() {
        if (morph.parentNode) morph.parentNode.removeChild(morph);
        btn.classList.remove("fs-section-swimlane--morph-pending");
        btn.classList.add("fs-section-swimlane--active");
        commitLane(id, title, btn);
        done();
        scheduleSync();
      }

      var anim =
        morph.animate &&
        morph.animate(
          [
            {
              transform: "translate(0, 0) scale(1)",
              opacity: 1,
              fontSize: computed.fontSize,
            },
            {
              transform: "translate(" + dx + "px, " + dy + "px) scale(" + scale + ")",
              opacity: 0.88,
              fontSize: LANE_FONT_PX + "px",
            },
          ],
          {
            duration: MORPH_MS,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            fill: "forwards",
          }
        );

      if (anim && anim.finished) {
        anim.finished.then(finishMorph).catch(finishMorph);
      } else {
        window.setTimeout(finishMorph, MORPH_MS + 20);
      }
    }

    function scheduleSync() {
      if (syncPending) return;
      syncPending = true;
      requestAnimationFrame(syncGarage);
    }

    window.addEventListener("scroll", scheduleSync, { passive: true });
    if ("onscrollend" in window) {
      window.addEventListener("scrollend", scheduleSync, { passive: true });
    }
    window.addEventListener(
      "resize",
      function () {
        updateDockHeight();
        scheduleSync();
      },
      { passive: true }
    );

    updateDockHeight();
    scheduleSync();
  }

  window.ForgeSectionSwimlanes = { init: init };
})();
