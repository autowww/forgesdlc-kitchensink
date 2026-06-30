/**
 * Forge Fleet App UI — declarative FAEP v1 widget host for /admin/apps/{id}/.
 * See forge-fleet docs/schemas/fleet-app-ui-v1.schema.json
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function authHeaders(token) {
    var h = { Accept: "application/json" };
    if (token) h.Authorization = "Bearer " + token;
    return h;
  }

  function fetchJson(url, opts) {
    return fetch(url, opts || {}).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) {
          var err = new Error((j && j.error) || r.statusText || "request_failed");
          err.payload = j;
          throw err;
        }
        return j;
      });
    });
  }

  function renderWidget(w, ctx) {
    var kind = w.kind || "";
    if (kind === "section") {
      var inner = (w.widgets || [])
        .map(function (c) {
          return renderWidget(c, ctx);
        })
        .join("");
      return (
        '<section class="card mb-3 border-secondary-subtle shadow-sm fleet-app-section">' +
        '<div class="card-body py-3">' +
        (w.title ? '<h2 class="h6 text-uppercase text-body-secondary mb-3">' + esc(w.title) + "</h2>" : "") +
        inner +
        "</div></section>"
      );
    }
    if (kind === "heading") {
      var lvl = w.level || 3;
      var tag = "h" + Math.min(4, Math.max(2, lvl));
      return "<" + tag + ' class="fleet-app-heading">' + esc(w.text || w.title || "") + "</" + tag + ">";
    }
    if (kind === "prose") {
      return '<p class="text-body-secondary small">' + esc(w.text || "") + "</p>";
    }
    if (kind === "alert") {
      var v = w.variant || "info";
      var cls = v === "danger" ? "alert-danger" : v === "warning" ? "alert-warning" : v === "success" ? "alert-success" : "alert-info";
      return '<div class="alert ' + cls + ' py-2 px-3 small">' + esc(w.text || "") + "</div>";
    }
    if (kind === "kpi_row") {
      var items = w.items || [];
      var tiles = items
        .map(function (it) {
          var val = ctx.kpi && it.binding ? ctx.kpi[it.binding] : "—";
          return (
            '<div class="fleet-tile fleet-tile--cpu">' +
            '<div class="fleet-tile__label">' +
            esc(it.label || it.binding) +
            "</div>" +
            '<div class="fleet-tile__value">' +
            esc(val) +
            "</div></div>"
          );
        })
        .join("");
      return '<div class="fleet-tile-row fleet-one-row mb-2" data-fleet-app-kpi="1">' + tiles + "</div>";
    }
    if (kind === "data_table") {
      var bid = w.binding || "";
      var cols = w.columns || [];
      var rows = (ctx.tables && ctx.tables[bid]) || [];
      var head =
        "<thead><tr>" +
        cols
          .map(function (c) {
            return "<th>" + esc(c.label || c.key) + "</th>";
          })
          .join("") +
        "</tr></thead>";
      var body =
        "<tbody>" +
        rows
          .map(function (row) {
            return (
              "<tr>" +
              cols
                .map(function (c) {
                  return "<td>" + esc(row[c.key]) + "</td>";
                })
                .join("") +
              "</tr>"
            );
          })
          .join("") +
        "</tbody>";
      return (
        '<div class="table-responsive fleet-app-table-wrap" data-binding="' +
        esc(bid) +
        '"><table class="table table-sm table-striped align-middle mb-0">' +
        head +
        body +
        "</table></div>"
      );
    }
    if (kind === "action_button") {
      var act = w.action || "";
      return (
        '<button type="button" class="btn btn-sm btn-outline-primary fleet-app-action" data-action="' +
        esc(act) +
        '">' +
        esc(w.label || act) +
        "</button>"
      );
    }
    if (kind === "diagnostic_panel") {
      var raw = ctx.diag && w.binding ? ctx.diag[w.binding] : null;
      return (
        '<details class="fleet-app-diag small border rounded p-2 mb-2">' +
        "<summary>" +
        esc(w.title || "Diagnostics") +
        "</summary>" +
        '<pre class="fleet-mono small mb-0 mt-2" style="max-height:14rem;overflow:auto">' +
        esc(JSON.stringify(raw, null, 2)) +
        "</pre></details>"
      );
    }
    if (kind === "docs_link") {
      var href = w.href || ctx.docsIndex || "#";
      return '<p class="small"><a href="' + esc(href) + '">' + esc(w.label || "Open in-package docs") + "</a></p>";
    }
    return "";
  }

  function collectBindings(spec) {
    var data = [];
    var kpis = [];
    var diag = [];
    function walk(list) {
      (list || []).forEach(function (w) {
        if (w.kind === "data_table" && w.binding) data.push(w.binding);
        if (w.kind === "diagnostic_panel" && w.binding) diag.push(w.binding);
        if (w.kind === "kpi_row" && w.items) {
          w.items.forEach(function (it) {
            if (it.binding) kpis.push(it.binding);
          });
        }
        if (w.widgets) walk(w.widgets);
      });
    }
    walk(spec.widgets || []);
    return { data: data, kpis: kpis, diag: diag };
  }

  function mount(root, options) {
    if (!root || !options) return;
    var appId = options.appId || "";
    var token = options.token || "";
    var uiUrl = options.uiUrl || "";
    var dataBase = options.dataBase || "";
    var actionsBase = options.actionsBase || "";
    var pollMs = options.pollMs || 5000;
    var timer = null;
    var spec = null;

    function loadData(binding) {
      return fetchJson(dataBase + "/" + encodeURIComponent(binding), {
        headers: authHeaders(token),
      });
    }

    function refresh() {
      if (!spec) return Promise.resolve();
      var need = collectBindings(spec);
      var ctx = { tables: {}, kpi: {}, diag: {} };
      var jobs = [];
      need.data.concat(need.kpis).concat(need.diag).forEach(function (b) {
        jobs.push(
          loadData(b).then(function (j) {
            if (j.rows) ctx.tables[b] = j.rows;
            if (j.kpi && typeof j.kpi === "object") Object.assign(ctx.kpi, j.kpi);
            if (j.value != null) ctx.kpi[b] = j.value;
            if (need.diag.indexOf(b) >= 0) ctx.diag[b] = j;
          })
        );
      });
      return Promise.all(jobs).then(function () {
        var html = (spec.widgets || [])
          .map(function (w) {
            return renderWidget(w, ctx);
          })
          .join("");
        root.innerHTML = html;
        root.querySelectorAll(".fleet-app-action").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var act = btn.getAttribute("data-action");
            if (!act) return;
            btn.disabled = true;
            fetch(actionsBase + "/" + encodeURIComponent(act), {
              method: "POST",
              headers: Object.assign({ "Content-Type": "application/json" }, authHeaders(token)),
              body: JSON.stringify({ force: true }),
            })
              .then(function (r) {
                return r.json();
              })
              .then(function () {
                return refresh();
              })
              .catch(function () {
                /* ignore */
              })
              .finally(function () {
                btn.disabled = false;
              });
          });
        });
      });
    }

    root.innerHTML = '<p class="text-body-secondary small" role="status">Loading app UI…</p>';
    fetchJson(uiUrl, { headers: authHeaders(token) })
      .then(function (j) {
        spec = j.ui || j;
        if (spec.poll_ms) pollMs = spec.poll_ms;
        return refresh();
      })
      .catch(function (ex) {
        root.innerHTML =
          '<div class="alert alert-danger small">Failed to load app UI: ' + esc(ex.message || ex) + "</div>";
      });

    timer = setInterval(function () {
      refresh();
    }, pollMs);

    return {
      destroy: function () {
        if (timer) clearInterval(timer);
      },
    };
  }

  global.ForgeFleetAppUi = { mount: mount, renderWidget: renderWidget };
})(typeof window !== "undefined" ? window : globalThis);
