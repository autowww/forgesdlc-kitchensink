"""Put Kitchensink ``components`` and ``generator`` on ``sys.path``."""

from __future__ import annotations

import sys
from pathlib import Path


def ensure_kitchensink_importable(kitchensink_root: Path) -> Path:
    """Insert KS paths so ``components``, ``layouts``, ``transforms``, ``ks_assets`` import.

    Returns resolved *kitchensink_root*.
    """
    k = kitchensink_root.resolve()
    gen = str(k / "generator")
    comp = str(k / "components")
    if gen not in sys.path:
        sys.path.insert(0, gen)
    if comp not in sys.path:
        sys.path.insert(0, comp)
    return k
