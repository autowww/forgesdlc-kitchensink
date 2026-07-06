"""Handbook HTML asset URL helpers."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from forge_autodoc.html_assets import cache_bust_handbook_img_src


class CacheBustHandbookImgSrcTests(unittest.TestCase):
    def test_appends_version_query_for_local_assets(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            assets = Path(tmp)
            (assets / "diagram.svg").write_text("<svg></svg>", encoding="utf-8")
            html = '<img src="assets/diagram.svg" alt="x" loading="lazy" />'
            out = cache_bust_handbook_img_src(html, assets)
            self.assertIn("assets/diagram.svg?v=", out)
            self.assertNotIn("assets/diagram.svg\" alt", out)

    def test_skips_remote_and_already_versioned(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            assets = Path(tmp)
            html = (
                '<img src="https://example.com/a.svg" alt="a" />'
                '<img src="assets/a.svg?v=1" alt="b" />'
            )
            out = cache_bust_handbook_img_src(html, assets)
            self.assertEqual(out, html)


if __name__ == "__main__":
    unittest.main()
