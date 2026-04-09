"""Shared diagram lightbox shell for ``forge-theme.js`` (`openDiagramModal` / `closeDiagramModal`).

Used by ``handbook_page``, ``product_page``, and ``chapter_page`` when diagram-as-code (or other SVG
inside ``.forge-diagram``) should expand. Same markup as the KS showcase diagram modal;
``showcase.js`` adds ``openDiagramWithDetail`` + legend wiring on top of this shell.

The root uses the HTML ``hidden`` attribute so closed-modal scaffold text is omitted from
readers/crawlers; ``forgeApplyDiagramModalOpen`` / ``forgeApplyDiagramModalClose`` toggle it.
"""
from __future__ import annotations


def render_diagram_expand_modal_html() -> str:
    """Backdrop + dialog with canvas (cloned SVG) and optional detail panel."""
    return """\
<div id="diagramModal" class="diagram-modal-backdrop" hidden aria-hidden="true">
  <div class="diagram-modal">
    <div class="diagram-modal-header">
      <div id="diagramModalTitle" class="diagram-modal__title forge-gradient-text" role="heading" aria-level="2"></div>
      <button type="button" class="diagram-modal-close" onclick="closeDiagramModal()" aria-label="Close"><span class="diagram-modal-close-icon" aria-hidden="true"></span></button>
    </div>
    <div class="diagram-modal-body">
      <div id="diagramModalCanvas" class="diagram-modal-canvas"></div>
      <div id="diagramModalDetail" class="diagram-modal-detail"></div>
    </div>
  </div>
</div>"""
