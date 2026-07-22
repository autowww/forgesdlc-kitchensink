/**
 * Minimal DOM fixture for node:test dynamic-ui unit tests (no external deps).
 */

export function createMinimalDocument() {
  const listeners = new Map();

  function createElement(tag) {
    const node = {
      tagName: tag.toUpperCase(),
      className: "",
      innerHTML: "",
      textContent: "",
      hidden: false,
      disabled: false,
      dataset: {},
      style: {},
      parentElement: null,
      children: [],
      attributes: {},
      classList: {
        _set: new Set(),
        add(...cls) {
          cls.forEach((c) => this._set.add(c));
          node.className = [...this._set].join(" ");
        },
        remove(...cls) {
          cls.forEach((c) => this._set.delete(c));
          node.className = [...this._set].join(" ");
        },
        toggle(c, on) {
          if (on === undefined) on = !this._set.has(c);
          if (on) this.add(c);
          else this.remove(c);
        },
        contains(c) {
          return this._set.has(c);
        },
      },
      setAttribute(k, v) {
        this.attributes[k] = String(v);
        if (k.startsWith("data-")) {
          const key = k
            .slice(5)
            .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          this.dataset[key] = String(v);
        }
        if (k === "class") this.className = v;
        if (k === "hidden") this.hidden = v === "true" || v === true;
        if (k === "disabled") this.disabled = v === "true" || v === true;
      },
      getAttribute(k) {
        return this.attributes[k] ?? null;
      },
      removeAttribute(k) {
        delete this.attributes[k];
      },
      appendChild(child) {
        child.parentElement = this;
        this.children.push(child);
        return child;
      },
      contains() {
        return false;
      },
      addEventListener(type, fn) {
        if (!listeners.has(node)) listeners.set(node, new Map());
        const map = listeners.get(node);
        if (!map.has(type)) map.set(type, []);
        map.get(type).push(fn);
      },
      dispatchEvent(ev) {
        const map = listeners.get(node);
        const fns = map?.get(ev.type) || [];
        fns.forEach((fn) => fn(ev));
        return true;
      },
      querySelectorAll() {
        return [];
      },
      querySelector() {
        return null;
      },
      focus() {},
    };
    return node;
  }

  const document = {
    readyState: "complete",
    createElement,
    querySelectorAll: () => [],
    addEventListener: () => {},
  };

  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
      this.bubbles = init.bubbles || false;
    }
  }

  return { document, CustomEvent, listeners };
}

export function installGlobals(fixture) {
  globalThis.document = fixture.document;
  globalThis.CustomEvent = fixture.CustomEvent;
  globalThis.HTMLElement = function HTMLElement() {};
}

export function resetGlobals() {
  delete globalThis.document;
  delete globalThis.CustomEvent;
  delete globalThis.HTMLElement;
}
