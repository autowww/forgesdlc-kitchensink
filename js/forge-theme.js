/**
 * Forge — AI-native theme interactions
 * =====================================
 * Diagram modal expand/collapse, node ↔ detail hover wiring,
 * cluster/subgraph breathing, and SVG scaling for 16:9 screens.
 *
 * Include after Bootstrap JS and before </body>.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * Diagram expand modal
   * ---------------------------------------------------------------- */
  window.openDiagramModal = function (trigger) {
    var svg = trigger.querySelector('svg');
    if (!svg) return;
    var canvas = document.getElementById('diagramModalCanvas');
    if (!canvas) return;
    canvas.innerHTML = svg.outerHTML;
    var modalSvg = canvas.querySelector('svg');
    if (modalSvg) {
      modalSvg.removeAttribute('width');
      modalSvg.removeAttribute('height');
      modalSvg.style.width = '100%';
      modalSvg.style.height = 'auto';
      modalSvg.style.minHeight = '55vh';

      var vb = modalSvg.getAttribute('viewBox');
      if (!vb) {
        var bbox = svg.getBBox ? svg.getBBox() : null;
        if (bbox && bbox.width > 0) {
          modalSvg.setAttribute('viewBox', '0 0 ' + bbox.width + ' ' + bbox.height);
        }
      }
    }
    document.getElementById('diagramModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    wireDiagramHovers();
  };

  window.closeDiagramModal = function () {
    var modal = document.getElementById('diagramModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  /* ------------------------------------------------------------------
   * Find the enclosing cluster(s) for a node
   * ---------------------------------------------------------------- */
  function findParentClusters(nodeEl) {
    var clusters = [];
    var parent = nodeEl.parentElement;
    while (parent) {
      if (parent.classList && parent.classList.contains('cluster')) {
        clusters.push(parent);
      }
      parent = parent.parentElement;
    }
    return clusters;
  }

  /* ------------------------------------------------------------------
   * Node ↔ detail hover wiring (bidirectional) + cluster breathing
   * ---------------------------------------------------------------- */
  function wireDiagramHovers() {
    var canvas = document.getElementById('diagramModalCanvas');
    var detail = document.getElementById('diagramModalDetail');
    if (!canvas || !detail) return;

    var nodes = canvas.querySelectorAll('.node');
    var clusters = canvas.querySelectorAll('.cluster');
    var detailItems = detail.querySelectorAll('.detail-item[data-node]');

    nodes.forEach(function (node) {
      var labelEl = node.querySelector('.nodeLabel') ||
                    node.querySelector('text') ||
                    node.querySelector('span');
      if (!labelEl) return;
      var label = (labelEl.textContent || '').trim();

      node.addEventListener('mouseenter', function () {
        node.classList.add('node-glow');

        var parentClusters = findParentClusters(node);
        parentClusters.forEach(function (c) { c.classList.add('cluster-glow'); });

        detailItems.forEach(function (item) {
          if (item.getAttribute('data-node') === label) {
            item.classList.add('highlight');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        });
      });
      node.addEventListener('mouseleave', function () {
        node.classList.remove('node-glow');
        clusters.forEach(function (c) { c.classList.remove('cluster-glow'); });
        detailItems.forEach(function (item) { item.classList.remove('highlight'); });
      });
    });

    clusters.forEach(function (cluster) {
      cluster.addEventListener('mouseenter', function () {
        cluster.classList.add('cluster-glow');
      });
      cluster.addEventListener('mouseleave', function () {
        cluster.classList.remove('cluster-glow');
      });
    });

    detailItems.forEach(function (item) {
      var nodeName = item.getAttribute('data-node');
      item.addEventListener('mouseenter', function () {
        item.classList.add('highlight');
        nodes.forEach(function (node) {
          var labelEl = node.querySelector('.nodeLabel') ||
                        node.querySelector('text') ||
                        node.querySelector('span');
          if (labelEl && (labelEl.textContent || '').trim() === nodeName) {
            node.classList.add('node-glow');
            var parentClusters = findParentClusters(node);
            parentClusters.forEach(function (c) { c.classList.add('cluster-glow'); });
          }
        });
      });
      item.addEventListener('mouseleave', function () {
        item.classList.remove('highlight');
        nodes.forEach(function (node) { node.classList.remove('node-glow'); });
        clusters.forEach(function (c) { c.classList.remove('cluster-glow'); });
      });
    });
  }

  /* ------------------------------------------------------------------
   * Keyboard & backdrop close
   * ---------------------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.closeDiagramModal();
  });
  var backdrop = document.getElementById('diagramModal');
  if (backdrop) {
    backdrop.addEventListener('click', function (e) {
      if (e.target === this) window.closeDiagramModal();
    });
  }
})();
