/**
 * Forge roadmap Initial/Target date editor — binds Save on .forge-roadmap-date-editor.
 * Loaded from Lenses /__ks/js/roadmap-dates.js; call ForgeRoadmapDates.init(root) after SPA inject.
 */
(function () {
  "use strict";

  function statusEl(root) {
    return root.querySelector(".forge-roadmap-date-status");
  }

  function gatherUpdates(root) {
    var payload = JSON.parse(root.getAttribute("data-payload") || "{}");
    var rowsIn = payload.rows || [];
    var out = [];
    var trs = root.querySelectorAll("tbody tr");
    trs.forEach(function (tr, idx) {
      var row = rowsIn[idx];
      if (!row) return;
      var upd = { epic_id: row.epic_id || "" };
      tr.querySelectorAll(".forge-roadmap-date-input").forEach(function (inp) {
        var f = inp.getAttribute("data-field");
        if (!f) return;
        upd[f] = (inp.value || "").trim();
      });
      out.push(upd);
    });
    return out;
  }

  function bindOne(root) {
    if (root.getAttribute("data-roadmap-dates-bound") === "1") return;
    root.setAttribute("data-roadmap-dates-bound", "1");
    var api = root.getAttribute("data-api-url") || "/api/roadmap-dates";
    var payload = JSON.parse(root.getAttribute("data-payload") || "{}");
    var rel = payload.rel_path || "";
    var btn = root.querySelector(".forge-roadmap-date-save");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var st = statusEl(root);
      var updates = gatherUpdates(root);
      btn.disabled = true;
      if (st) st.textContent = "Saving…";
      fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rel_path: rel, updates: updates }),
        credentials: "same-origin",
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok, json: j };
          });
        })
        .then(function (ref) {
          var ok = ref.ok;
          var j = ref.json;
          if (st) {
            st.textContent =
              ok && j.ok
                ? "Saved. Reload the timeline to refresh charts."
                : (j && j.error) || "Save failed";
          }
          if (ok && j.ok) {
            root.dispatchEvent(
              new CustomEvent("forge-roadmap-dates-saved", {
                detail: { rel_path: rel },
              })
            );
          }
        })
        .catch(function (e) {
          if (st) st.textContent = e && e.message ? String(e.message) : "Network error";
        })
        .finally(function () {
          btn.disabled = false;
        });
    });
  }

  function init(root) {
    root = root || document;
    root.querySelectorAll("[data-forge-roadmap-date-editor]").forEach(bindOne);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init(document);
    });
  } else {
    init(document);
  }

  window.ForgeRoadmapDates = { init: init };
})();
