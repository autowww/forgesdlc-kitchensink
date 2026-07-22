/**
 * KS editable roadmap — swimlane + date table, unified GET/POST save.
 */
(function () {
  "use strict";

  var L = window.KsRoadmapLayout;
  var G = window.KsRoadmapGrid;
  var Drag = window.KsRoadmapDrag;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function uid() {
    return "bar-" + Math.random().toString(36).slice(2, 9);
  }

  function setStatus(mount, msg, ok) {
    var el = mount.querySelector("[data-ks-roadmap-status]");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-ok", !!ok);
    el.classList.toggle("is-error", ok === false);
  }

  function renderEditableGrid(level, selectedId, editable) {
    if (!G) return "";
    var cols = level.columns || [];
    var tracks = level.tracks || [];
    var bars = level.bars || [];
    var n = cols.length;
    var html =
      '<div class="ks-nrm-grid" style="--ks-nrm-cols:' + n + '">';
    html += '<div class="ks-nrm-corner" aria-hidden="true"></div>';
    for (var ci = 0; ci < cols.length; ci++) {
      html += '<div class="ks-nrm-col-head">' + G.esc(cols[ci].label) + "</div>";
    }
    var barsByTrack = {};
    for (var bi = 0; bi < bars.length; bi++) {
      var tid = bars[bi].trackId || "";
      if (!barsByTrack[tid]) barsByTrack[tid] = [];
      barsByTrack[tid].push(bars[bi]);
    }
    for (var ti = 0; ti < tracks.length; ti++) {
      var tr = tracks[ti];
      html += '<div class="ks-nrm-track-label">' + G.esc(tr.label) + "</div>";
      html += '<div class="ks-nrm-lane">';
      var rowBars = barsByTrack[tr.id] || [];
      for (var ri = 0; ri < rowBars.length; ri++) {
        var bar = rowBars[ri];
        var tone =
          G.TONES[(G.biHash(bar.id) % G.TONES.length + ri) % G.TONES.length];
        var gc = G.barGridColumn(level, bar);
        var sel = selectedId === bar.id ? " ks-nrm-bar--selected" : "";
        var handles = "";
        if (editable) {
          handles =
            '<span class="ks-roadmap__resize-handle ks-roadmap__resize-handle--left" data-ks-rm-resize="start"></span>' +
            '<span class="ks-roadmap__resize-handle ks-roadmap__resize-handle--right" data-ks-rm-resize="end"></span>';
        }
        html +=
          '<div class="ks-nrm-bar ks-nrm-bar--leaf ks-nrm-bar--' +
          tone +
          (editable ? " ks-nrm-bar--editable" : "") +
          sel +
          '" style="grid-column:' +
          gc +
          '" data-ks-rm-bar-id="' +
          G.escAttr(bar.id) +
          '" tabindex="0" role="button" aria-label="' +
          G.escAttr(bar.label) +
          '">';
        html += handles;
        html +=
          '<span class="ks-nrm-bar__label">' + G.esc(bar.label) + "</span></div>";
      }
      html += "</div>";
    }
    html += "</div>";
    return html;
  }

  function EditableRoadmap(mount) {
    this.mount = mount;
    this.mode = mount.getAttribute("data-ks-roadmap-mode") || "dynamic";
    this.roadmapId = mount.getAttribute("data-ks-roadmap-id") || "roadmap";
    this.loadUrl = mount.getAttribute("data-ks-roadmap-load-url") || "";
    this.saveUrl = mount.getAttribute("data-ks-roadmap-save-url") || "";
    this.saveDemo = mount.getAttribute("data-ks-roadmap-save-demo") === "1";
    this.doc = null;
    this.selectedBarId = null;
    this.draggable = this.mode === "dynamic";
    this.viewport = mount.querySelector("[data-ks-roadmap-viewport]");
  }

  EditableRoadmap.prototype.storageKey = function () {
    return "ks-roadmap-demo:" + this.roadmapId;
  };

  EditableRoadmap.prototype.level = function () {
    if (!this.doc) return { columns: [], tracks: [], bars: [] };
    return {
      version: this.doc.version,
      title: this.doc.title,
      columns: this.doc.columns,
      tracks: this.doc.tracks,
      bars: this.doc.bars,
    };
  };

  EditableRoadmap.prototype.load = function () {
    var self = this;
    if (this.loadUrl) {
      return fetch(this.loadUrl, { headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("Load failed (" + r.status + ")");
          return r.json();
        })
        .then(function (data) {
          self.applyDoc(data);
        });
    }
    var script = this.mount.querySelector("[data-ks-roadmap-data]");
    if (script) {
      this.applyDoc(JSON.parse(script.textContent || "{}"));
      return Promise.resolve();
    }
    if (this.saveDemo) {
      try {
        var raw = sessionStorage.getItem(this.storageKey());
        if (raw) {
          this.applyDoc(JSON.parse(raw));
          return Promise.resolve();
        }
      } catch (e) {
        /* ignore */
      }
    }
    return Promise.reject(new Error("No roadmap data source"));
  };

  EditableRoadmap.prototype.applyDoc = function (doc) {
    this.doc = doc;
    if (!this.doc.date_rows) this.doc.date_rows = [];
    this.selectedBarId = null;
    this.paint();
    this.syncDateInputs();
    setStatus(this.mount, "", null);
  };

  EditableRoadmap.prototype.findBar = function (id) {
    var bars = (this.doc && this.doc.bars) || [];
    for (var i = 0; i < bars.length; i++) {
      if (bars[i].id === id) return bars[i];
    }
    return null;
  };

  EditableRoadmap.prototype.selectBar = function (id) {
    this.selectedBarId = id;
    var del = this.mount.querySelector("[data-ks-roadmap-delete-bar]");
    if (del) del.disabled = !id;
    this.paint();
  };

  EditableRoadmap.prototype.paint = function () {
    if (!this.viewport) return;
    this.viewport.innerHTML = renderEditableGrid(
      this.level(),
      this.selectedBarId,
      this.draggable
    );
    this.wireViewport();
    if (this.draggable && Drag) {
      Drag.bindDrag(this);
    }
  };

  EditableRoadmap.prototype.wireViewport = function () {
    var self = this;
    this.viewport.onclick = function (ev) {
      if (ev.target.closest(".ks-roadmap__resize-handle")) return;
      var barEl = ev.target.closest("[data-ks-rm-bar-id]");
      if (!barEl) return;
      self.selectBar(barEl.getAttribute("data-ks-rm-bar-id"));
    };
  };

  EditableRoadmap.prototype.syncDateInputs = function () {
    if (!this.doc || !L) return;
    var rows = this.doc.date_rows || [];
    var table = this.mount.querySelector("[data-ks-roadmap-date-table]");
    if (!table) return;
    var trs = table.querySelectorAll("tbody tr");
    for (var i = 0; i < trs.length; i++) {
      var eid = trs[i].getAttribute("data-epic-id");
      var row = null;
      for (var j = 0; j < rows.length; j++) {
        if (rows[j].epic_id === eid) {
          row = rows[j];
          break;
        }
      }
      if (!row) continue;
      trs[i].querySelectorAll(".ks-roadmap-date-input").forEach(function (inp) {
        var f = inp.getAttribute("data-field");
        if (f && row[f] != null) inp.value = row[f];
      });
    }
  };

  EditableRoadmap.prototype.bindDateInputs = function () {
    var self = this;
    var table = this.mount.querySelector("[data-ks-roadmap-date-table]");
    if (!table) return;
    table.addEventListener("change", function (ev) {
      var inp = ev.target.closest(".ks-roadmap-date-input");
      if (!inp) return;
      var tr = inp.closest("tr");
      var eid = tr.getAttribute("data-epic-id");
      var field = inp.getAttribute("data-field");
      var rows = self.doc.date_rows || [];
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].epic_id === eid) {
          rows[i][field] = inp.value;
          if (field === "target_start" || field === "target_end") {
            L.syncBarFromDateRow(self.level(), rows[i], self.doc.bars);
            self.paint();
          }
          break;
        }
      }
    });
  };

  EditableRoadmap.prototype.addBar = function () {
    var tracks = this.doc.tracks || [];
    var cols = this.doc.columns || [];
    if (!tracks.length || !cols.length) return;
    var bar = {
      id: uid(),
      epic_id: uid(),
      label: "New bar",
      trackId: tracks[0].id,
      startColumnId: cols[0].id,
      endColumnId: cols[Math.min(1, cols.length - 1)].id,
    };
    this.doc.bars.push(bar);
    this.doc.date_rows.push({
      epic_id: bar.epic_id,
      label: bar.label,
      initial_start: cols[0].start || "",
      initial_end: cols[0].end || "",
      target_start: cols[0].start || "",
      target_end: cols[Math.min(1, cols.length - 1)].end || "",
    });
    this.appendDateRow(bar);
    this.selectBar(bar.id);
  };

  EditableRoadmap.prototype.appendDateRow = function (bar) {
    var table = this.mount.querySelector("[data-ks-roadmap-date-table] tbody");
    if (!table) return;
    var row = this.doc.date_rows[this.doc.date_rows.length - 1];
    var tr = document.createElement("tr");
    tr.setAttribute("data-epic-id", bar.epic_id);
    tr.innerHTML =
      "<td><span class='text-muted small'>" +
      esc(bar.label) +
      "</span><code class='ms-1'>" +
      esc(bar.epic_id) +
      "</code></td>" +
      ["initial_start", "initial_end", "target_start", "target_end"]
        .map(function (k) {
          return (
            "<td><input type='date' class='form-control form-control-sm " +
            "forge-roadmap-date-input ks-roadmap-date-input' data-field='" +
            k +
            "' value='" +
            esc(row[k] || "") +
            "' /></td>"
          );
        })
        .join("");
    table.appendChild(tr);
  };

  EditableRoadmap.prototype.deleteBar = function () {
    if (!this.selectedBarId) return;
    var id = this.selectedBarId;
    var bar = this.findBar(id);
    this.doc.bars = (this.doc.bars || []).filter(function (b) {
      return b.id !== id;
    });
    if (bar && bar.epic_id) {
      this.doc.date_rows = (this.doc.date_rows || []).filter(function (r) {
        return r.epic_id !== bar.epic_id;
      });
      var tr = this.mount.querySelector(
        'tr[data-epic-id="' + bar.epic_id + '"]'
      );
      if (tr) tr.remove();
    }
    this.selectedBarId = null;
    var del = this.mount.querySelector("[data-ks-roadmap-delete-bar]");
    if (del) del.disabled = true;
    this.paint();
  };

  EditableRoadmap.prototype.save = function () {
    var self = this;
    var body = {
      version: 2,
      roadmap_id: this.roadmapId,
      rel_path: this.doc.rel_path || "ROADMAP.md",
      level: this.level(),
      date_rows: this.doc.date_rows || [],
      columns: this.doc.columns,
      tracks: this.doc.tracks,
      bars: this.doc.bars,
      title: this.doc.title,
    };
    if (this.saveUrl) {
      return fetch(this.saveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok, json: j };
          });
        })
        .then(function (ref) {
          if (!ref.ok || ref.json.ok === false) {
            throw new Error((ref.json && ref.json.error) || "Save failed");
          }
          setStatus(self.mount, "Saved", true);
        })
        .catch(function (err) {
          if (self.saveDemo) return self.saveDemoLocal();
          setStatus(self.mount, err.message || "Save failed", false);
        });
    }
    if (this.saveDemo) return this.saveDemoLocal();
    setStatus(this.mount, "No save URL configured", false);
    return Promise.resolve();
  };

  EditableRoadmap.prototype.saveDemoLocal = function () {
    try {
      sessionStorage.setItem(this.storageKey(), JSON.stringify(this.doc));
      setStatus(this.mount, "Saved locally (demo)", true);
    } catch (e) {
      setStatus(this.mount, "Could not save locally", false);
    }
    return Promise.resolve();
  };

  EditableRoadmap.prototype.bind = function () {
    var self = this;
    var add = this.mount.querySelector("[data-ks-roadmap-add-bar]");
    var del = this.mount.querySelector("[data-ks-roadmap-delete-bar]");
    var save = this.mount.querySelector("[data-ks-roadmap-save]");
    var reload = this.mount.querySelector("[data-ks-roadmap-reload]");
    if (add) add.addEventListener("click", function () { self.addBar(); });
    if (del) del.addEventListener("click", function () { self.deleteBar(); });
    if (save) save.addEventListener("click", function () { self.save(); });
    if (reload)
      reload.addEventListener("click", function () {
        self.load().catch(function (err) {
          setStatus(self.mount, err.message, false);
        });
      });
    this.bindDateInputs();
  };

  function init() {
    var mounts = document.querySelectorAll("[data-ks-roadmap-editable]");
    for (var i = 0; i < mounts.length; i++) {
      var rm = new EditableRoadmap(mounts[i]);
      rm.bind();
      rm.load().catch(function (err) {
        setStatus(mounts[i], err.message, false);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
