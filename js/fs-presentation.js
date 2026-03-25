/**
 * fs-presentation.js — Forge product-layer presentation primitives
 * (stage carousel, thumb gallery sync, horizontal rail, image lightbox)
 */
(function () {
  'use strict';

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  var ARROW_LEFT =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>';
  var ARROW_RIGHT =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>';

  function parseBool(s, def) {
    if (s == null || s === '') return def;
    return s === 'true' || s === '1';
  }

  // -----------------------------------------------------------------
  // Image lightbox
  // -----------------------------------------------------------------
  function ensureLightbox() {
    var el = document.getElementById('fsMediaLightbox');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'fsMediaLightbox';
    el.className = 'fs-media-lightbox-backdrop';
    el.setAttribute('role', 'presentation');
    el.innerHTML =
      '<div class="fs-media-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Enlarged image">' +
      '<button type="button" class="fs-media-lightbox-close" data-fs-lightbox-close aria-label="Close">&times;</button>' +
      '<img src="" alt="" data-fs-lightbox-img />' +
      '</div>';
    document.body.appendChild(el);

    var img = el.querySelector('[data-fs-lightbox-img]');
    function close() {
      el.classList.remove('fs-media-lightbox--open');
      el.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (img) {
        img.removeAttribute('src');
        img.alt = '';
      }
    }

    el.addEventListener('click', function (ev) {
      if (ev.target === el) close();
    });
    el.querySelector('[data-fs-lightbox-close]').addEventListener('click', close);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && el.classList.contains('fs-media-lightbox--open')) {
        ev.preventDefault();
        close();
      }
    });
    return el;
  }

  function openLightbox(src, alt) {
    var el = ensureLightbox();
    var img = el.querySelector('[data-fs-lightbox-img]');
    if (!img) return;
    img.alt = alt || '';
    img.src = src;
    el.removeAttribute('hidden');
    el.classList.add('fs-media-lightbox--open');
    document.body.style.overflow = 'hidden';
  }

  window.fsOpenMediaLightbox = openLightbox;

  function syncThumbStrip(stageRoot, idx) {
    var wrap = stageRoot.closest('.fs-thumb-gallery');
    if (!wrap) return;
    var thumbs = wrap.querySelectorAll('.fs-thumb-gallery__thumb');
    thumbs.forEach(function (t, i) {
      t.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }

  // -----------------------------------------------------------------
  // Stage carousel (one controller per root)
  // -----------------------------------------------------------------
  function wireStageCarousel(root) {
    if (root._fsStageWired) return;
    root._fsStageWired = true;

    var viewport = root.querySelector('.fs-stage-carousel__viewport');
    var track = root.querySelector('.fs-stage-carousel__track');
    var slides = root.querySelectorAll('.fs-stage-carousel__slide');
    var live = root.querySelector('.fs-stage-carousel__live');
    if (!viewport || !track || !slides.length) return;

    var n = slides.length;
    var index = 0;
    var timer = null;
    var touchStartX = null;
    var userPaused = false;

    function readAutoplayFlag() {
      return parseBool(root.getAttribute('data-fs-autoplay'), false) && !prefersReducedMotion();
    }

    var loop = parseBool(root.getAttribute('data-fs-loop'), true);
    var intervalMs = parseInt(root.getAttribute('data-fs-interval-ms') || '6000', 10) || 6000;
    var showArrows = parseBool(root.getAttribute('data-fs-show-arrows'), true);
    var showDots = parseBool(root.getAttribute('data-fs-show-dots'), true);

    var prevBtn = root.querySelector('.fs-stage-carousel__arrow--prev');
    var nextBtn = root.querySelector('.fs-stage-carousel__arrow--next');
    var dotsRoot = root.querySelector('.fs-stage-carousel__dots');

    function clearAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function scheduleAutoplay() {
      clearAutoplay();
      if (userPaused) return;
      if (!readAutoplayFlag() || n < 2) return;
      timer = setInterval(function () {
        go(1, false);
      }, intervalMs);
    }

    function announce() {
      if (!live) return;
      live.textContent = 'Slide ' + (index + 1) + ' of ' + n;
    }

    function updateUi() {
      track.style.transform = 'translateX(' + -(index * 100) + '%)';
      slides.forEach(function (slide, i) {
        var hidden = i !== index;
        slide.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        slide.tabIndex = hidden ? -1 : 0;
      });
      if (dotsRoot) {
        var dots = dotsRoot.querySelectorAll('.fs-stage-carousel__dot');
        dots.forEach(function (dot, i) {
          var sel = i === index;
          dot.setAttribute('aria-selected', sel ? 'true' : 'false');
          dot.tabIndex = sel ? 0 : -1;
        });
      }
      if (prevBtn) {
        prevBtn.disabled = !loop && index === 0;
        prevBtn.setAttribute('aria-disabled', !loop && index === 0 ? 'true' : 'false');
      }
      if (nextBtn) {
        nextBtn.disabled = !loop && index === n - 1;
        nextBtn.setAttribute('aria-disabled', !loop && index === n - 1 ? 'true' : 'false');
      }
      announce();
      syncThumbStrip(root, index);
    }

    function go(delta, fromUser) {
      if (fromUser) {
        userPaused = true;
        clearAutoplay();
      }
      var next = index + delta;
      if (loop) next = ((next % n) + n) % n;
      else next = Math.max(0, Math.min(n - 1, next));
      index = next;
      updateUi();
    }

    function goTo(i, fromUser) {
      if (fromUser) {
        userPaused = true;
        clearAutoplay();
      }
      index = Math.max(0, Math.min(n - 1, i));
      updateUi();
    }

    root._fsStageGo = function (i) {
      goTo(i, true);
    };

    if (prevBtn) {
      prevBtn.innerHTML = ARROW_LEFT;
      prevBtn.addEventListener('click', function () {
        go(-1, true);
      });
    }
    if (nextBtn) {
      nextBtn.innerHTML = ARROW_RIGHT;
      nextBtn.addEventListener('click', function () {
        go(1, true);
      });
    }

    if (!showArrows) {
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
    }
    if (!showDots && dotsRoot) dotsRoot.hidden = true;

    if (dotsRoot && showDots) {
      dotsRoot.innerHTML = '';
      var labelBase = root.getAttribute('aria-label') || 'carousel';
      for (var d = 0; d < n; d++) {
        (function (j) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'fs-stage-carousel__dot';
          b.setAttribute('role', 'tab');
          b.setAttribute('aria-label', labelBase + ' slide ' + (j + 1));
          b.setAttribute('aria-controls', slides[j].id || '');
          b.addEventListener('click', function () {
            goTo(j, true);
          });
          dotsRoot.appendChild(b);
        })(d);
      }
    }

    root.addEventListener('mouseenter', clearAutoplay);
    root.addEventListener('mouseleave', function () {
      userPaused = false;
      scheduleAutoplay();
    });
    root.addEventListener('focusin', function (ev) {
      if (root.contains(ev.target)) clearAutoplay();
    });
    root.addEventListener('focusout', function (ev) {
      if (!root.contains(ev.relatedTarget)) {
        userPaused = false;
        scheduleAutoplay();
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearAutoplay();
      else scheduleAutoplay();
    });

    root.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') {
        ev.preventDefault();
        go(-1, true);
      } else if (ev.key === 'ArrowRight') {
        ev.preventDefault();
        go(1, true);
      } else if (ev.key === 'Home') {
        ev.preventDefault();
        goTo(0, true);
      } else if (ev.key === 'End') {
        ev.preventDefault();
        goTo(n - 1, true);
      }
    });

    viewport.addEventListener(
      'touchstart',
      function (ev) {
        if (!ev.changedTouches || !ev.changedTouches.length) return;
        touchStartX = ev.changedTouches[0].clientX;
      },
      { passive: true }
    );
    viewport.addEventListener(
      'touchend',
      function (ev) {
        if (touchStartX == null || !ev.changedTouches || !ev.changedTouches.length) return;
        var dx = ev.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(dx) < 48) return;
        if (dx > 0) go(-1, true);
        else go(1, true);
      },
      { passive: true }
    );

    slides.forEach(function (slide) {
      slide.querySelectorAll('[data-fs-slide-action]').forEach(function (hit) {
        hit.addEventListener('click', function (ev) {
          var mode = hit.getAttribute('data-fs-slide-action');
          if (mode === 'lightbox') {
            ev.preventDefault();
            var src = hit.getAttribute('data-fs-lightbox-src') || '';
            var alt = hit.getAttribute('data-fs-lightbox-alt') || '';
            if (src) openLightbox(src, alt);
            clearAutoplay();
            scheduleAutoplay();
          } else if (mode === 'topic') {
            ev.preventDefault();
            var href = hit.getAttribute('data-fs-topic-href') || '';
            var title = hit.getAttribute('data-fs-topic-title') || '';
            if (href && typeof window.openTopicPreviewModal === 'function') {
              window.openTopicPreviewModal(href, title);
            } else if (href) {
              window.location.href = href;
            }
            clearAutoplay();
            scheduleAutoplay();
          }
        });
      });
    });

    updateUi();
    scheduleAutoplay();
  }

  function wireThumbGalleries() {
    document.querySelectorAll('.fs-thumb-gallery').forEach(function (wrap) {
      var stage = wrap.querySelector('[data-fs-stage-carousel]');
      if (!stage || !stage._fsStageGo) return;
      var thumbs = wrap.querySelectorAll('.fs-thumb-gallery__thumb');
      thumbs.forEach(function (thumb, i) {
        thumb.addEventListener('click', function () {
          stage._fsStageGo(i);
        });
      });
    });
  }

  // -----------------------------------------------------------------
  // Horizontal rail
  // -----------------------------------------------------------------
  function wireRail(root) {
    if (root._fsRailWired) return;
    root._fsRailWired = true;

    var scroller = root.querySelector('.fs-rail__scroller');
    var prevBtn = root.querySelector('.fs-rail__arrow--prev');
    var nextBtn = root.querySelector('.fs-rail__arrow--next');
    if (!scroller) return;

    function scrollPage(dir) {
      var amount = Math.max(120, scroller.clientWidth * 0.72);
      scroller.scrollBy({
        left: dir * amount,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }

    if (prevBtn) {
      prevBtn.innerHTML = ARROW_LEFT;
      prevBtn.addEventListener('click', function () {
        scrollPage(-1);
      });
    }
    if (nextBtn) {
      nextBtn.innerHTML = ARROW_RIGHT;
      nextBtn.addEventListener('click', function () {
        scrollPage(1);
      });
    }

    if (!parseBool(root.getAttribute('data-fs-rail-arrows'), true)) {
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
    }

    if (parseBool(root.getAttribute('data-fs-rail-wheel'), false)) {
      scroller.addEventListener(
        'wheel',
        function (ev) {
          if (prefersReducedMotion()) return;
          if (Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;
          if (ev.defaultPrevented) return;
          ev.preventDefault();
          scroller.scrollBy({ left: ev.deltaY, behavior: 'auto' });
        },
        { passive: false }
      );
    }

    root.querySelectorAll('[data-fs-rail-action="topic"]').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        ev.preventDefault();
        var href = el.getAttribute('data-fs-topic-href') || '';
        var title = el.getAttribute('data-fs-topic-title') || '';
        if (href && typeof window.openTopicPreviewModal === 'function') {
          window.openTopicPreviewModal(href, title);
        }
      });
    });
  }

  function boot() {
    document.querySelectorAll('[data-fs-stage-carousel]').forEach(wireStageCarousel);
    wireThumbGalleries();
    document.querySelectorAll('[data-fs-rail]').forEach(wireRail);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
