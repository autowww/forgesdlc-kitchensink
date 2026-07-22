/**
 * KS editable mind-map — label edit, add/delete, GET load + POST save.
 */
(function () {
  "use strict";

  var L = window.KsMindmapLayout;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function uid() {
    return "node-" + Math.random().toString(36).slice(2, 9);
  }

  function findNode(node, id, parent) {
    if (!node) return null;
    if (node.id === id) return { node: node, parent: parent };
    var kids = node.children || [];
    for (var i = 0; i < kids.length; i++) {
      var found = findNode(kids[i], id, node);
      if (found) return found;
    }
    return null;
  }

  function cloneTree(root) {
    return JSON.parse(JSON.stringify(root));
  }

  function parseInline(mount) {
    var script = mount.querySelector("[data-ks-mindmap-data]");
    if (!script) return null;
    try {
      return JSON.parse(script.textContent || "{}");
    } catch (e) {
      return null;
    }
  }

  function setStatus(mount, msg, ok) {
    var el = mount.querySelector("[data-ks-mindmap-status]");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-ok", !!ok);
    el.classList.toggle("is-error", ok === false);
  }

  function renderStaticSvg(viewport, root, title) {
    if (!viewport || !root) return;
    var layout = L.layoutTree(root, {}, viewport.clientWidth || 800);
    var pmap = {};
    for (var i = 0; i < layout.nodes.length; i++) {
      pmap[layout.nodes[i].id] = layout.nodes[i];
    }
    var lines = [];
    L.buildConnectors(root, pmap, {}, lines);
    var parts = [];
    parts.push(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
        layout.width +
        " " +
        layout.height +
        '">'
    );
    parts.push('<rect width="100%" height="100%" fill="#ffffff"/>');
    if (title) {
      parts.push(
        '<text x="' +
          layout.width / 2 +
          '" y="16" text-anchor="middle" font-size="11" fill="#64748b">' +
          esc(title) +
          "</text>"
      );
    }
    for (var li = 0; li < lines.length; li++) {
      parts.push(
        '<path d="' + lines[li].d + '" fill="none" stroke="#94a3b8" stroke-width="1.25"/>'
      );
    }
    for (var ni = 0; ni < layout.nodes.length; ni++) {
      var n = layout.nodes[ni];
      var selected = viewport.getAttribute("data-ks-mm-selected") === n.id;
      parts.push(
        '<g class="ks-mindmap__node' +
          (selected ? " is-selected" : "") +
          '" data-ks-mm-node="' +
          esc(n.id) +
          '" tabindex="0" role="button">'
      );
      parts.push(
        '<rect x="' +
          n.x +
          '" y="' +
          n.y +
          '" width="' +
          n.w +
          '" height="' +
          n.h +
          '" rx="4" fill="' +
          (selected ? "#f0fdfa" : "#ffffff") +
          '" stroke="' +
          (n.isRoot ? "#0f766e" : "#cbd5e1") +
          '" stroke-width="1.25"/>'
      );
      parts.push(
        '<text x="' +
          (n.x + n.w / 2) +
          '" y="' +
          (n.y + n.h / 2 + 4) +
          '" text-anchor="middle" font-size="10.5" fill="#0f172a" pointer-events="none">' +
          esc(n.label) +
          "</text></g>"
      );
    }
    parts.push("</svg>");
    viewport.innerHTML = parts.join("");
  }

  function EditableMindmap(mount) {
    this.mount = mount;
    this.mode = mount.getAttribute("data-ks-mindmap-mode") || "dynamic";
    this.mindmapId = mount.getAttribute("data-ks-mindmap-id") || "mindmap";
    this.loadUrl = mount.getAttribute("data-ks-mindmap-load-url") || "";
    this.saveUrl = mount.getAttribute("data-ks-mindmap-save-url") || "";
    this.saveDemo = mount.getAttribute("data-ks-mindmap-save-demo") === "1";
    this.payload = { version: 1, title: "", root: null };
    this.selectedId = null;
    this.collapsed = {};
    this.collapsible = this.mode === "dynamic";
  }

  EditableMindmap.prototype.storageKey = function () {
    return "ks-mindmap-demo:" + this.mindmapId;
  };

  EditableMindmap.prototype.load = function () {
    var self = this;
    if (this.loadUrl) {
      return fetch(this.loadUrl, { headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("Load failed (" + r.status + ")");
          return r.json();
        })
        .then(function (data) {
          self.applyPayload(data);
        });
    }
    var inline = parseInline(this.mount);
    if (inline) {
      this.applyPayload(inline);
      return Promise.resolve();
    }
    if (this.saveDemo) {
      try {
        var raw = sessionStorage.getItem(this.storageKey());
        if (raw) {
          this.applyPayload(JSON.parse(raw));
          return Promise.resolve();
        }
      } catch (e) {
        /* ignore */
      }
    }
    return Promise.reject(new Error("No mind-map data source"));
  };

  EditableMindmap.prototype.applyPayload = function (data) {
    this.payload.version = data.version || 1;
    this.payload.title = data.title || "";
    this.payload.root = cloneTree(data.root || data);
    if (this.collapsible && L) {
      this.collapsed = L.initialCollapsedState(this.payload.root, 1);
    }
    this.selectedId = null;
    this.updateToolbar();
    this.render();
    setStatus(this.mount, "", null);
  };

  EditableMindmap.prototype.render = function () {
    var viewport = this.mount.querySelector("[data-ks-mindmap-viewport]");
    if (!viewport || !this.payload.root) return;
    viewport.setAttribute("data-ks-mm-selected", this.selectedId || "");

    if (this.mode === "static" || !window.KsMindmapLayout) {
      renderStaticSvg(viewport, this.payload.root, this.payload.title);
    } else {
      var w = this.mount.getBoundingClientRect().width;
      var layout = L.layoutTree(this.payload.root, this.collapsed, w);
      var pmap = {};
      for (var i = 0; i < layout.nodes.length; i++) {
        pmap[layout.nodes[i].id] = layout.nodes[i];
      }
      var lines = [];
      L.buildConnectors(this.payload.root, pmap, this.collapsed, lines);
      var parts = [];
      parts.push(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
          layout.width +
          " " +
          layout.height +
          '">'
      );
      parts.push('<rect width="100%" height="100%" fill="#ffffff"/>');
      for (var li = 0; li < lines.length; li++) {
        parts.push(
          '<path d="' +
            lines[li].d +
            '" fill="none" stroke="#94a3b8" stroke-width="1.25"/>'
        );
      }
      for (var ni = 0; ni < layout.nodes.length; ni++) {
        var n = layout.nodes[ni];
        var sel = this.selectedId === n.id;
        parts.push(
          '<g class="ks-mindmap__node' +
            (sel ? " is-selected" : "") +
            '" data-ks-mm-node="' +
            esc(n.id) +
            '" tabindex="0" role="treeitem">'
        );
        parts.push(
          '<rect x="' +
            n.x +
            '" y="' +
            n.y +
            '" width="' +
            n.w +
            '" height="' +
            n.h +
            '" rx="4" fill="' +
            (sel ? "#f0fdfa" : "#ffffff") +
            '" stroke="#cbd5e1" stroke-width="1.25"/>'
        );
        parts.push(
          '<text x="' +
            (n.x + n.w / 2) +
            '" y="' +
            (n.y + n.h / 2 + 4) +
            '" text-anchor="middle" font-size="10.5" fill="#0f172a" pointer-events="none">' +
            esc(n.label) +
            "</text></g>"
        );
      }
      parts.push("</svg>");
      viewport.innerHTML = parts.join("");
    }
    this.bindViewport();
  };

  EditableMindmap.prototype.bindViewport = function () {
    var self = this;
    var viewport = this.mount.querySelector("[data-ks-mindmap-viewport]");
    if (!viewport) return;
    viewport.onclick = function (ev) {
      var node = ev.target.closest("[data-ks-mm-node]");
      if (!node) return;
      self.select(node.getAttribute("data-ks-mm-node"));
    };
  };

  EditableMindmap.prototype.select = function (id) {
    this.selectedId = id;
    var input = this.mount.querySelector("[data-ks-mindmap-label-input]");
    var hit = findNode(this.payload.root, id);
    if (input) {
      input.disabled = !hit;
      input.value = hit ? hit.node.label : "";
    }
    this.updateToolbar();
    this.render();
  };

  EditableMindmap.prototype.updateToolbar = function () {
    var rootId = this.payload.root && this.payload.root.id;
    var hasSel = !!this.selectedId;
    var isRoot = hasSel && this.selectedId === rootId;
    var addChild = this.mount.querySelector("[data-ks-mindmap-add-child]");
    var addSibling = this.mount.querySelector("[data-ks-mindmap-add-sibling]");
    var del = this.mount.querySelector("[data-ks-mindmap-delete]");
    if (addChild) addChild.disabled = !hasSel;
    if (addSibling) addSibling.disabled = !hasSel || isRoot;
    if (del) del.disabled = !hasSel || isRoot;
  };

  EditableMindmap.prototype.applyLabel = function (label) {
    var hit = findNode(this.payload.root, this.selectedId);
    if (!hit) return;
    hit.node.label = label;
    this.render();
  };

  EditableMindmap.prototype.addChild = function () {
    var hit = findNode(this.payload.root, this.selectedId);
    if (!hit) return;
    if (!hit.node.children) hit.node.children = [];
    var child = { id: uid(), label: "New node", children: [] };
    hit.node.children.push(child);
    this.selectedId = child.id;
    this.updateToolbar();
    this.render();
  };

  EditableMindmap.prototype.addSibling = function () {
    var hit = findNode(this.payload.root, this.selectedId);
    if (!hit || !hit.parent) return;
    if (!hit.parent.children) hit.parent.children = [];
    var sib = { id: uid(), label: "New node", children: [] };
    hit.parent.children.push(sib);
    this.selectedId = sib.id;
    this.updateToolbar();
    this.render();
  };

  EditableMindmap.prototype.deleteSelected = function () {
    var hit = findNode(this.payload.root, this.selectedId);
    if (!hit || !hit.parent) return;
    var kids = hit.parent.children || [];
    hit.parent.children = kids.filter(function (c) {
      return c.id !== this.selectedId;
    }, this);
    this.selectedId = hit.parent.id;
    this.updateToolbar();
    this.render();
  };

  EditableMindmap.prototype.save = function () {
    var self = this;
    var body = {
      version: this.payload.version || 1,
      mindmap_id: this.mindmapId,
      tree: this.payload.root,
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
            if (!r.ok || j.ok === false) {
              throw new Error((j && j.error) || "Save failed");
            }
            setStatus(self.mount, "Saved", true);
          });
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

  EditableMindmap.prototype.saveDemoLocal = function () {
    try {
      sessionStorage.setItem(
        this.storageKey(),
        JSON.stringify({
          version: this.payload.version,
          title: this.payload.title,
          root: this.payload.root,
        })
      );
      setStatus(this.mount, "Saved locally (demo)", true);
    } catch (e) {
      setStatus(this.mount, "Could not save locally", false);
    }
    return Promise.resolve();
  };

  EditableMindmap.prototype.bind = function () {
    var self = this;
    var input = this.mount.querySelector("[data-ks-mindmap-label-input]");
    if (input) {
      input.addEventListener("input", function () {
        self.applyLabel(input.value);
      });
    }
    var addChild = this.mount.querySelector("[data-ks-mindmap-add-child]");
    var addSibling = this.mount.querySelector("[data-ks-mindmap-add-sibling]");
    var del = this.mount.querySelector("[data-ks-mindmap-delete]");
    var save = this.mount.querySelector("[data-ks-mindmap-save]");
    var reload = this.mount.querySelector("[data-ks-mindmap-reload]");
    if (addChild) addChild.addEventListener("click", function () { self.addChild(); });
    if (addSibling)
      addSibling.addEventListener("click", function () { self.addSibling(); });
    if (del) del.addEventListener("click", function () { self.deleteSelected(); });
    if (save) save.addEventListener("click", function () { self.save(); });
    if (reload)
      reload.addEventListener("click", function () {
        self.load().catch(function (err) {
          setStatus(self.mount, err.message, false);
        });
      });
  };

  function init() {
    var mounts = document.querySelectorAll("[data-ks-mindmap-editable]");
    for (var i = 0; i < mounts.length; i++) {
      var mm = new EditableMindmap(mounts[i]);
      mm.bind();
      mm.load().catch(function (err) {
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
