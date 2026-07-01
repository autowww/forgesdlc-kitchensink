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

  function badgeClass(value, variants) {
    var key = String(value == null ? "" : value).toLowerCase();
    if (variants && variants[key]) return variants[key];
    if (value === true || key === "true" || key === "active" || key === "running") return "fleet-pill st-running";
    if (value === false || key === "false" || key === "expired") return "fleet-pill st-failed";
    if (key === "completed" || key === "ok") return "fleet-pill st-completed";
    return "fleet-pill st-queued";
  }

  function renderCell(c, row) {
    var val = row[c.key];
    if (c.format === "badge") {
      return (
        '<span class="' +
        esc(badgeClass(val, c.variants)) +
        '">' +
        esc(val) +
        "</span>"
      );
    }
    if (c.format === "link") {
      if (!val) return '<span class="text-body-secondary">—</span>';
      return (
        '<a class="btn btn-sm btn-outline-secondary fleet-app-link" href="' +
        esc(val) +
        '" target="_blank" rel="noopener">Open</a>'
      );
    }
    if (c.format === "row_action") {
      var body = {};
      (c.body_keys || [c.key]).forEach(function (k) {
        if (row[k] != null && row[k] !== "") body[k] = row[k];
      });
      var act = c.action || "";
      if (!act) return '<span class="text-body-secondary">—</span>';
      return (
        '<button type="button" class="btn btn-sm btn-outline-danger fleet-app-action fleet-app-row-action"' +
        ' data-action="' +
        esc(act) +
        '" data-body="' +
        esc(JSON.stringify(body)) +
        '">' +
        esc(c.action_label || c.label || "Run") +
        "</button>"
      );
    }
    return esc(val);
  }

  var CHANNEL_MONOGRAM = {
    teams: "T",
    outlook: "O",
    linkedin: "in",
    sharepoint: "S",
    crm: "C",
  };

  function surfaceMonogram(row) {
    var ch = String((row && row.channel_type) || "").toLowerCase();
    if (CHANNEL_MONOGRAM[ch]) return CHANNEL_MONOGRAM[ch];
    var sid = String((row && row.surface_id) || "");
    if (sid.indexOf("outlook") === 0) return "O";
    if (sid.indexOf("teams") === 0) return "T";
    return sid.slice(0, 2).toUpperCase() || "?";
  }

  function tileKey(row) {
    return String(row.surface_id || "") + "|" + String(row.cdp_url || "");
  }

  function SurfaceWallController(mountEl) {
    this.mountEl = mountEl;
    this.tiles = {};
    this.timers = {};
    this.sockets = {};
    this.blobUrls = {};
    this.lastFrameAt = {};
  }

  SurfaceWallController.prototype.destroy = function () {
    var self = this;
    Object.keys(self.timers).forEach(function (k) {
      clearInterval(self.timers[k]);
    });
    Object.keys(self.sockets).forEach(function (k) {
      try {
        self.sockets[k].close();
      } catch (e) {
        /* ignore */
      }
    });
    Object.keys(self.blobUrls).forEach(function (k) {
      try {
        URL.revokeObjectURL(self.blobUrls[k]);
      } catch (e2) {
        /* ignore */
      }
    });
    self.timers = {};
    self.sockets = {};
    self.blobUrls = {};
    self.tiles = {};
  };

  SurfaceWallController.prototype.sync = function (rows) {
    var self = this;
    var list = Array.isArray(rows) ? rows : [];
    var seen = {};
    list.forEach(function (row) {
      var key = tileKey(row);
      seen[key] = true;
      if (!self.tiles[key]) self._createTile(key, row);
      else self._updateMeta(key, row);
      self._syncMedia(key, row);
    });
    Object.keys(self.tiles).forEach(function (key) {
      if (!seen[key]) self._removeTile(key);
    });
  };

  SurfaceWallController.prototype._removeTile = function (key) {
    var self = this;
    if (self.timers[key]) {
      clearInterval(self.timers[key]);
      delete self.timers[key];
    }
    if (self.sockets[key]) {
      try {
        self.sockets[key].close();
      } catch (e) {
        /* ignore */
      }
      delete self.sockets[key];
    }
    if (self.blobUrls[key]) {
      try {
        URL.revokeObjectURL(self.blobUrls[key]);
      } catch (e2) {
        /* ignore */
      }
      delete self.blobUrls[key];
    }
    var el = self.tiles[key];
    if (el && el.parentNode) el.parentNode.removeChild(el);
    delete self.tiles[key];
  };

  SurfaceWallController.prototype._tileClass = function (row) {
    var activity = String(row.activity || "offline");
    var cls = "fleet-surface-tile fleet-surface-tile--" + activity;
    if (row.is_hero && activity === "working") cls += " fleet-surface-tile--hero";
    return cls;
  };

  SurfaceWallController.prototype._createTile = function (key, row) {
    var self = this;
    var el = document.createElement("article");
    el.className = self._tileClass(row);
    el.setAttribute("data-surface-key", key);
    el.innerHTML =
      '<div class="fleet-surface-tile__frame">' +
      '<img class="fleet-surface-tile__img" alt="" hidden />' +
      '<div class="fleet-surface-tile__icon" aria-hidden="true"></div>' +
      "</div>" +
      '<div class="fleet-surface-tile__meta">' +
      '<div class="fleet-surface-tile__title"></div>' +
      '<div class="fleet-surface-tile__status"></div>' +
      '<div class="fleet-surface-tile__detail small text-body-secondary"></div>' +
      "</div>";
    self.mountEl.appendChild(el);
    self.tiles[key] = el;
    self._updateMeta(key, row);
  };

  SurfaceWallController.prototype._updateMeta = function (key, row) {
    var el = this.tiles[key];
    if (!el) return;
    el.className = this._tileClass(row);
    var title = el.querySelector(".fleet-surface-tile__title");
    var status = el.querySelector(".fleet-surface-tile__status");
    var detail = el.querySelector(".fleet-surface-tile__detail");
    var icon = el.querySelector(".fleet-surface-tile__icon");
    if (title) title.textContent = row.display_name || row.surface_id || "";
    if (status) {
      var act = String(row.activity || "offline");
      status.innerHTML =
        '<span class="' +
        esc(badgeClass(act === "working" ? "active" : act === "idle" ? "queued" : "expired")) +
        '">' +
        esc(act) +
        "</span>";
      if (row.teams_stream_disabled) {
        status.innerHTML +=
          ' <span class="fleet-pill st-queued" title="Set FORGE_CDP_STREAM_TEAMS=1">stream off</span>';
      }
    }
    if (detail) {
      var parts = [];
      if (row.progress) parts.push(row.progress);
      if (row.progress_message) parts.push(row.progress_message);
      if (row.sync_run_id) parts.push("run " + row.sync_run_id);
      if (row.lease_owner) parts.push(row.lease_owner);
      detail.textContent = parts.join(" · ");
    }
    if (icon) icon.textContent = surfaceMonogram(row);
  };

  SurfaceWallController.prototype._setPreview = function (key, src, isBlob) {
    var el = this.tiles[key];
    if (!el) return;
    var img = el.querySelector(".fleet-surface-tile__img");
    var icon = el.querySelector(".fleet-surface-tile__icon");
    if (!img) return;
    if (src) {
      img.src = src;
      img.hidden = false;
      if (icon) icon.hidden = true;
    } else {
      img.removeAttribute("src");
      img.hidden = true;
      if (icon) icon.hidden = false;
    }
    if (isBlob && this.blobUrls[key]) {
      try {
        URL.revokeObjectURL(this.blobUrls[key]);
      } catch (e) {
        /* ignore */
      }
    }
    if (isBlob) this.blobUrls[key] = src;
  };

  SurfaceWallController.prototype._syncMedia = function (key, row) {
    var self = this;
    var activity = String(row.activity || "offline");

    if (activity !== "working") {
      if (self.sockets[key]) {
        try {
          self.sockets[key].close();
        } catch (e) {
          /* ignore */
        }
        delete self.sockets[key];
      }
    }

    if (activity === "working" && row.stream_ws_url && !row.teams_stream_disabled) {
      var sid = String(row.session_id || "");
      var wsKey = key + "|" + sid;
      if (self.sockets[key] && self.sockets[key]._fleetSid === sid) return;
      if (self.sockets[key]) {
        try {
          self.sockets[key].close();
        } catch (e2) {
          /* ignore */
        }
      }
      if (self.timers[key]) {
        clearInterval(self.timers[key]);
        delete self.timers[key];
      }
      try {
        var ws = new WebSocket(row.stream_ws_url);
        ws.binaryType = "arraybuffer";
        ws._fleetSid = sid;
        ws.onmessage = function (ev) {
          if (!(ev.data instanceof ArrayBuffer)) return;
          var now = Date.now();
          if (self.lastFrameAt[key] && now - self.lastFrameAt[key] < 950) return;
          self.lastFrameAt[key] = now;
          var blob = new Blob([ev.data], { type: "image/jpeg" });
          self._setPreview(key, URL.createObjectURL(blob), true);
        };
        self.sockets[key] = ws;
      } catch (e3) {
        /* ignore */
      }
      return;
    }

    if (activity === "idle" && row.snapshot_href && !row.teams_stream_disabled) {
      if (self.sockets[key]) {
        try {
          self.sockets[key].close();
        } catch (e4) {
          /* ignore */
        }
        delete self.sockets[key];
      }
      var href = row.snapshot_href;
      function loadSnap() {
        if (document.visibilityState === "hidden") return;
        self._setPreview(key, href + (href.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now(), false);
      }
      if (!self.timers[key]) {
        loadSnap();
        self.timers[key] = setInterval(loadSnap, 60000);
      }
      return;
    }

    if (self.timers[key]) {
      clearInterval(self.timers[key]);
      delete self.timers[key];
    }
    self._setPreview(key, "", false);
  };

  function renderWidget(w, ctx) {
    var kind = w.kind || "";
    if (kind === "section") {
      var inner = (w.widgets || [])
        .map(function (c) {
          return renderWidget(c, ctx);
        })
        .join("");
      if (w.collapsed && w.title) {
        return (
          '<section class="card mb-3 border-secondary-subtle shadow-sm fleet-app-section fleet-app-section--collapsed">' +
          '<div class="card-body py-3">' +
          '<details class="fleet-app-section-details">' +
          '<summary class="h6 text-uppercase text-body-secondary mb-0 fleet-app-section-summary">' +
          esc(w.title) +
          '</summary><div class="fleet-app-section__body mt-3">' +
          inner +
          "</div></details></div></section>"
        );
      }
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
    if (kind === "alert_list") {
      var alerts = (ctx.alerts && ctx.alerts[w.binding]) || [];
      if (!alerts.length) return "";
      return alerts
        .map(function (a) {
          var av = (a && a.variant) || "info";
          var acls =
            av === "danger"
              ? "alert-danger"
              : av === "warning"
                ? "alert-warning"
                : av === "success"
                  ? "alert-success"
                  : "alert-info";
          return '<div class="alert ' + acls + ' py-2 px-3 small mb-2">' + esc((a && a.text) || "") + "</div>";
        })
        .join("");
    }
    if (kind === "status_badge") {
      var sbVal = ctx.kpi && w.binding ? ctx.kpi[w.binding] : "—";
      return (
        '<span class="' +
        esc(badgeClass(sbVal, w.variants)) +
        ' fleet-app-status-badge" data-binding="' +
        esc(w.binding || "") +
        '">' +
        esc(sbVal) +
        "</span>"
      );
    }
    if (kind === "toggle") {
      var checked = !!(ctx.kpi && w.binding && ctx.kpi[w.binding]);
      var act = w.action || "";
      var bodyTpl = w.body ? JSON.stringify(w.body) : "";
      return (
        '<div class="form-check form-switch fleet-app-toggle mb-2">' +
        '<input class="form-check-input fleet-app-toggle-input" type="checkbox" role="switch"' +
        ' data-action="' +
        esc(act) +
        '" data-binding="' +
        esc(w.binding || "") +
        '" data-body-template="' +
        esc(bodyTpl) +
        '"' +
        (checked ? " checked" : "") +
        ">" +
        '<label class="form-check-label">' +
        esc(w.label || w.binding || "") +
        "</label></div>"
      );
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
      return (
        '<div class="fleet-tile-row fleet-one-row mb-2" data-fleet-app-kpi="1" data-binding="' +
        esc(w.binding || "") +
        '">' +
        tiles +
        "</div>"
      );
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
        (rows.length
          ? rows
              .map(function (row) {
                return (
                  "<tr>" +
                  cols
                    .map(function (c) {
                      return "<td>" + renderCell(c, row) + "</td>";
                    })
                    .join("") +
                  "</tr>"
                );
              })
              .join("")
          : '<tr><td colspan="' + cols.length + '" class="text-body-secondary">No rows</td></tr>') +
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
    if (kind === "event_feed") {
      var feed = (ctx.events && ctx.events[w.binding]) || [];
      var lines = feed.length
        ? feed
            .slice()
            .reverse()
            .map(function (ev) {
              return (
                '<div class="fleet-app-event-row small py-1 border-bottom border-secondary-subtle">' +
                '<span class="fleet-mono text-body-secondary me-2">' +
                esc(ev.ts || "") +
                "</span>" +
                '<span class="badge bg-secondary-subtle text-body-secondary me-2">' +
                esc(ev.kind || "") +
                "</span>" +
                esc(ev.summary || "") +
                "</div>"
              );
            })
            .join("")
        : '<p class="small text-body-secondary mb-0">No events yet.</p>';
      return (
        '<div class="fleet-app-event-feed mb-2" data-binding="' +
        esc(w.binding || "") +
        '">' +
        (w.title ? '<div class="small text-uppercase text-body-secondary mb-2">' + esc(w.title) + "</div>" : "") +
        lines +
        "</div>"
      );
    }
    if (kind === "action_button") {
      var act = w.action || "";
      var abody = w.body ? JSON.stringify(w.body) : "{}";
      return (
        '<button type="button" class="btn btn-sm btn-outline-primary fleet-app-action" data-action="' +
        esc(act) +
        '" data-body="' +
        esc(abody) +
        '">' +
        esc(w.label || act) +
        "</button>"
      );
    }
    if (kind === "action_row") {
      var rowButtons = (w.buttons || [])
        .map(function (b) {
          var cls =
            b.variant === "primary"
              ? "btn-primary"
              : b.variant === "ghost"
                ? "btn-outline-secondary"
                : "btn-outline-primary";
          var rowBody = b.body ? JSON.stringify(b.body) : "{}";
          return (
            '<button type="button" class="btn btn-sm ' +
            esc(cls) +
            ' fleet-app-action" data-action="' +
            esc(b.action || "") +
            '" data-body="' +
            esc(rowBody) +
            '">' +
            esc(b.label || b.action || "") +
            "</button>"
          );
        })
        .join("");
      return (
        '<div class="fleet-app-action-row d-flex flex-wrap align-items-center gap-2 mb-3">' +
        (w.title ? '<div class="small text-body-secondary w-100 mb-1">' + esc(w.title) + "</div>" : "") +
        rowButtons +
        "</div>"
      );
    }
    if (kind === "link_button") {
      var href = w.href || (ctx.kpi && w.binding ? ctx.kpi[w.binding] : "") || "#";
      return (
        '<a class="btn btn-sm btn-outline-secondary fleet-app-link-button" href="' +
        esc(href) +
        '" target="_blank" rel="noopener">' +
        esc(w.label || "Open") +
        "</a>"
      );
    }
    if (kind === "health_card") {
      var card = ctx.health && w.binding ? ctx.health[w.binding] : null;
      if (!card || typeof card !== "object") {
        return (
          '<p class="small text-body-secondary mb-0">' +
          esc("Health information is not available yet.") +
          "</p>"
        );
      }
      var st = String(card.status || "unknown").toLowerCase();
      var pill =
        st === "healthy"
          ? "fleet-pill st-completed"
          : st === "degraded"
            ? "fleet-pill st-running"
            : st === "disabled"
              ? "fleet-pill st-queued"
              : "fleet-pill st-failed";
      var points = (card.points || [])
        .map(function (line) {
          return "<li>" + esc(line) + "</li>";
        })
        .join("");
      return (
        '<div class="fleet-app-health-card border border-secondary-subtle rounded p-3 mb-2" data-binding="' +
        esc(w.binding || "") +
        '">' +
        (w.title ? '<div class="small text-uppercase text-body-secondary mb-2">' + esc(w.title) + "</div>" : "") +
        '<div class="d-flex flex-wrap align-items-center gap-2 mb-2">' +
        '<span class="' +
        esc(pill) +
        '">' +
        esc(card.status_label || card.status || "—") +
        "</span>" +
        '<span class="fw-semibold">' +
        esc(card.headline || "") +
        "</span></div>" +
        (card.detail
          ? '<p class="small text-body-secondary mb-2">' + esc(card.detail) + "</p>"
          : "") +
        (points ? '<ul class="small mb-0 ps-3">' + points + "</ul>" : "") +
        "</div>"
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
      var dhref = w.href || ctx.docsIndex || "#";
      return '<p class="small"><a href="' + esc(dhref) + '">' + esc(w.label || "Open in-package docs") + "</a></p>";
    }
    if (kind === "surface_wall") {
      var bid = w.binding || "surface_wall";
      var rows = (ctx.tables && ctx.tables[bid]) || [];
      var empty =
        rows.length === 0
          ? '<p class="small text-body-secondary mb-0">No surfaces registered or daemon unreachable.</p>'
          : "";
      return (
        '<div class="fleet-surface-wall-wrap mb-2" data-binding="' +
        esc(bid) +
        '">' +
        (w.title ? '<div class="small text-uppercase text-body-secondary mb-2">' + esc(w.title) + "</div>" : "") +
        '<div class="fleet-surface-wall" data-fleet-persistent="surface-wall" data-binding="' +
        esc(bid) +
        '"></div>' +
        empty +
        "</div>"
      );
    }
    return "";
  }

  function collectBindings(spec) {
    var data = [];
    var kpis = [];
    var diag = [];
    var events = [];
    var minPoll = spec.poll_ms || 5000;
    function walk(list) {
      (list || []).forEach(function (w) {
        if (w.kind === "data_table" && w.binding) data.push(w.binding);
        if (w.kind === "surface_wall" && w.binding) data.push(w.binding);
        if (w.kind === "alert_list" && w.binding) data.push(w.binding);
        if (w.kind === "event_feed" && w.binding) {
          events.push(w.binding);
          if (w.poll_ms) minPoll = Math.min(minPoll, w.poll_ms);
        }
        if (w.kind === "diagnostic_panel" && w.binding) diag.push(w.binding);
        if (w.kind === "health_card" && w.binding) data.push(w.binding);
        if (w.kind === "kpi_row") {
          if (w.binding) data.push(w.binding);
          if (w.items) {
            w.items.forEach(function (it) {
              if (it.binding) kpis.push(it.binding);
            });
          }
        }
        if (w.kind === "toggle" && w.binding) {
          data.push("control");
        }
        if (w.kind === "status_badge" && w.binding) kpis.push(w.binding);
        if (w.widgets) walk(w.widgets);
      });
    }
    walk(spec.widgets || []);
    return { data: data, kpis: kpis, diag: diag, events: events, minPoll: minPoll };
  }

  function applyBindingPayload(ctx, binding, j, need) {
    if (j.rows) ctx.tables[binding] = j.rows;
    if (j.events) ctx.events[binding] = j.events;
    if (j.kpi && typeof j.kpi === "object") Object.assign(ctx.kpi, j.kpi);
    if (j.value != null) ctx.kpi[binding] = j.value;
    if (j.health_card && typeof j.health_card === "object") {
      ctx.health = ctx.health || {};
      ctx.health[binding] = j.health_card;
    }
    if (j.alerts && Array.isArray(j.alerts)) {
      ctx.alerts = ctx.alerts || {};
      ctx.alerts[binding] = j.alerts;
    }
    if (need.diag.indexOf(binding) >= 0) ctx.diag[binding] = j;
    if (binding === "control" || j.manager_enabled !== undefined || j.daemon_enabled !== undefined) {
      Object.assign(ctx.kpi, j);
    }
  }

  function resolveActionBody(template, value) {
    if (!template) return {};
    try {
      var raw = JSON.stringify(template);
      raw = raw.replace(/"\{\{value\}\}"/g, JSON.stringify(!!value));
      raw = raw.replace(/\{\{value\}\}/g, String(!!value));
      return JSON.parse(raw);
    } catch (e) {
      return { enabled: !!value };
    }
  }

  function postAction(actionsBase, token, act, body) {
    return fetch(actionsBase + "/" + encodeURIComponent(act), {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, authHeaders(token)),
      body: JSON.stringify(body && typeof body === "object" ? body : {}),
    }).then(function (r) {
      return r.json();
    });
  }

  function mount(root, options) {
    if (!root || !options) return;
    var appId = options.appId || "";
    var token = options.token || "";
    var uiUrl = options.uiUrl || "";
    var dataBase = options.dataBase || "";
    var actionsBase = options.actionsBase || "";
    var pollMs = options.pollMs || 5000;
    var docsIndex = options.docsIndex || "";
    var timer = null;
    var spec = null;
    var wallCtrl = null;
    var wallBinding = "";

    function findSurfaceWallBinding(widgets) {
      var found = "";
      function walk(list) {
        (list || []).forEach(function (w) {
          if (w.kind === "surface_wall" && w.binding) found = w.binding;
          if (w.widgets) walk(w.widgets);
        });
      }
      walk(widgets || []);
      return found;
    }

    function preserveSurfaceWall() {
      if (!wallCtrl || !wallBinding) return null;
      var node = root.querySelector(
        '.fleet-surface-wall[data-binding="' + wallBinding.replace(/"/g, '\\"') + '"]'
      );
      return node || null;
    }

    function restoreSurfaceWall(saved) {
      if (!saved) return;
      var fresh = root.querySelector(
        '.fleet-surface-wall[data-binding="' + wallBinding.replace(/"/g, '\\"') + '"]'
      );
      if (fresh && fresh.parentNode) fresh.parentNode.replaceChild(saved, fresh);
    }

    function syncSurfaceWall(ctx) {
      if (!wallBinding) return;
      var rows = (ctx.tables && ctx.tables[wallBinding]) || [];
      var node = root.querySelector(
        '.fleet-surface-wall[data-binding="' + wallBinding.replace(/"/g, '\\"') + '"]'
      );
      if (!node) return;
      if (!wallCtrl) wallCtrl = new SurfaceWallController(node);
      wallCtrl.sync(rows);
    }

    function loadData(binding) {
      return fetchJson(dataBase + "/" + encodeURIComponent(binding), {
        headers: authHeaders(token),
      });
    }

    function wireActions() {
      root.querySelectorAll(".fleet-app-action").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var act = btn.getAttribute("data-action");
          if (!act) return;
          btn.disabled = true;
          var body = {};
          var raw = btn.getAttribute("data-body");
          if (raw) {
            try {
              body = JSON.parse(raw);
            } catch (e) {
              body = { force: true };
            }
          } else {
            body = {};
          }
          postAction(actionsBase, token, act, body)
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
      root.querySelectorAll(".fleet-app-toggle-input").forEach(function (input) {
        input.addEventListener("change", function () {
          var act = input.getAttribute("data-action");
          if (!act) return;
          input.disabled = true;
          var tpl = null;
          var rawTpl = input.getAttribute("data-body-template");
          if (rawTpl) {
            try {
              tpl = JSON.parse(rawTpl);
            } catch (e) {
              tpl = null;
            }
          }
          var body = resolveActionBody(tpl, input.checked);
          postAction(actionsBase, token, act, body)
            .then(function () {
              return refresh();
            })
            .catch(function () {
              input.checked = !input.checked;
            })
            .finally(function () {
              input.disabled = false;
            });
        });
      });
    }

    function refresh() {
      if (!spec) return Promise.resolve();
      var need = collectBindings(spec);
      var ctx = { tables: {}, kpi: {}, diag: {}, events: {}, health: {}, alerts: {}, docsIndex: docsIndex };
      var jobs = [];
      var seen = {};
      need.data.concat(need.kpis).concat(need.diag).concat(need.events).forEach(function (b) {
        if (!b || seen[b]) return;
        seen[b] = true;
        jobs.push(
          loadData(b)
            .then(function (j) {
              applyBindingPayload(ctx, b, j, need);
            })
            .catch(function () {
              /* keep partial UI on per-binding failures */
            })
        );
      });
      return Promise.all(jobs).then(function () {
        var savedWall = preserveSurfaceWall();
        var html = (spec.widgets || [])
          .map(function (w) {
            return renderWidget(w, ctx);
          })
          .join("");
        root.innerHTML = html;
        restoreSurfaceWall(savedWall);
        if (!wallBinding) wallBinding = findSurfaceWallBinding(spec.widgets);
        syncSurfaceWall(ctx);
        wireActions();
      });
    }

    root.innerHTML = '<p class="text-body-secondary small" role="status">Loading app UI…</p>';
    fetchJson(uiUrl, { headers: authHeaders(token) })
      .then(function (j) {
        spec = j.ui || j;
        if (spec.poll_ms) pollMs = spec.poll_ms;
        var need = collectBindings(spec);
        if (need.minPoll) pollMs = Math.min(pollMs, need.minPoll);
        wallBinding = findSurfaceWallBinding(spec.widgets);
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
        if (wallCtrl) {
          wallCtrl.destroy();
          wallCtrl = null;
        }
      },
    };
  }

  global.ForgeFleetAppUi = { mount: mount, renderWidget: renderWidget };
})(typeof window !== "undefined" ? window : globalThis);
