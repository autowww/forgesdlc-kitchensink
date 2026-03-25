"""Shared diagram lightbox shell for ``forge-theme.js`` (`openDiagramModal` / `closeDiagramModal`).

Used by ``handbook_page``, ``product_page``, and ``chapter_page`` when Mermaid (or other SVG
inside ``.forge-diagram``) should expand. Same markup as the KS showcase diagram modal;
``showcase.js`` adds ``openDiagramWithDetail`` + legend wiring on top of this shell.
"""
from __future__ import annotations


def render_diagram_expand_modal_html() -> str:
    """Backdrop + dialog with canvas (cloned SVG) and optional detail panel."""
    return """\
<div id="diagramModal" class="diagram-modal-backdrop">
  <div class="diagram-modal">
    <div class="diagram-modal-header">
      <h3 id="diagramModalTitle" class="forge-gradient-text">Diagram</h3>
      <button class="diagram-modal-close" onclick="closeDiagramModal()" aria-label="Close">&times;</button>
    </div>
    <div class="diagram-modal-body">
      <div id="diagramModalCanvas" class="diagram-modal-canvas"></div>
      <div id="diagramModalDetail" class="diagram-modal-detail"></div>
    </div>
  </div>
</div>"""
