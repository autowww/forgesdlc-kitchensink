/**
 * ForgeCommentThread — threaded review comments (ENT.APP).
 * @module ks-comment-thread
 */

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) node.setAttribute(k, String(v));
  });
  return node;
}

/**
 * @param {HTMLElement} container
 * @param {{ id?: string, comments?: Array<{ id: string, author: string, body: string, at: string }>, onComment?: (body: string) => void }} options
 */
export function createCommentThread(container, options = {}) {
  let destroyed = false;

  container.innerHTML = "";
  const root = el("section", "forge-comment-thread", {
    hash: "Fct",
    "data-ks-hash": "Fct",
    "data-ks-type": "component",
    "data-ks-name": "forge-comment-thread",
    "aria-label": "Comments",
    id: options.id || undefined,
  });

  const list = el("ul", "forge-comment-thread__list");
  (options.comments || []).forEach((c) => {
    const li = el("li", "forge-comment-thread__comment");
    const author = el("strong", "forge-comment-thread__author");
    author.textContent = c.author;
    const body = el("p", "forge-comment-thread__body");
    body.textContent = c.body;
    const time = el("time", "forge-comment-thread__time", { dateTime: c.at });
    time.textContent = c.at;
    li.appendChild(author);
    li.appendChild(body);
    li.appendChild(time);
    list.appendChild(li);
  });
  root.appendChild(list);

  if (options.onComment) {
    const form = el("form", "forge-comment-thread__form");
    const textarea = el("textarea", "forge-comment-thread__input", { rows: "2" });
    const submit = el("button", "btn btn-sm btn-primary", { type: "submit" });
    submit.textContent = "Add comment";
    form.appendChild(textarea);
    form.appendChild(submit);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (destroyed || !textarea.value.trim()) return;
      options.onComment(textarea.value.trim());
      textarea.value = "";
    });
    root.appendChild(form);
  }
  container.appendChild(root);

  return {
    destroy() {
      destroyed = true;
      container.innerHTML = "";
    },
  };
}
