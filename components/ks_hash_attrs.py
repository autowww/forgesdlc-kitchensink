"""Emit stable visual hash attributes for KS DOM roots (design catalog).

Validated hashes: /^[A-Za-z]{3}$/ with three distinct letters unless registry
documents an exception (runtime does not read the registry here).
"""
from __future__ import annotations

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass

try:
    from .components import e
except ImportError:
    from components import e

_HASH_RE = re.compile(r"^[A-Za-z]{3}$")


def _validate_hash(hash_id: str) -> None:
    if not _HASH_RE.match(hash_id):
        raise ValueError(f"ks visual hash must match /^[A-Za-z]{{3}}$/: {hash_id!r}")
    if len(set(hash_id)) != 3:
        raise ValueError(f"ks visual hash must use three distinct letters: {hash_id!r}")


def ks_hash_attrs(hash_id: str, visual_type: str, name: str) -> str:
    """Return HTML attribute fragment for a visual root (values escaped)."""
    _validate_hash(hash_id)
    return (
        f'hash="{e(hash_id)}" data-ks-hash="{e(hash_id)}" '
        f'data-ks-type="{e(visual_type)}" data-ks-name="{e(name)}"'
    )
