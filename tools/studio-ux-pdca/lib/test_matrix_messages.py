#!/usr/bin/env python3
"""Unit tests for Matrix/Element operator message builders."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

LIB_DIR = Path(__file__).resolve().parent
if str(LIB_DIR) not in sys.path:
    sys.path.insert(0, str(LIB_DIR))

from matrix_messages import (  # noqa: E402
    build_complete_message,
    build_start_message,
    clean_purpose,
    format_gate_line,
    matrix_message_content,
    short_cycle_ref,
    suggestion_bullets,
    verdict_label,
)


class MatrixMessagesTests(unittest.TestCase):
    def test_clean_purpose_strips_wiki_dump(self) -> None:
        raw = "# Dual-wiki context\n\n**Page:** Analysis (`/analysis`)\n\n## Feature IDs\n"
        cleaned = clean_purpose(raw, page_title="Analysis")
        self.assertEqual(cleaned, "Review and uplift Analysis")
        self.assertNotIn("#", cleaned)
        self.assertNotIn("Feature IDs", cleaned)

    def test_verdict_and_gates_show_failures(self) -> None:
        gates = {
            "gates": {
                "pytest_ok": False,
                "playwright_ok": True,
                "dual_wiki_ok": True,
                "score_ok": True,
                "passed": False,
            }
        }
        self.assertEqual(verdict_label(gates), "FAIL")
        line = format_gate_line(gates)
        self.assertIn("pytest FAIL", line)
        self.assertIn("playwright OK", line)

    def test_complete_message_is_verdict_first(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            cycle = Path(tmp) / "pages" / "wiki-detail" / "iter-001"
            cycle.mkdir(parents=True)
            (cycle / "scores.json").write_text(
                json.dumps(
                    {
                        "before": {"overall": 72},
                        "after": {"overall": 72},
                        "pytest_ok": False,
                        "playwright_ok": True,
                    }
                ),
                encoding="utf-8",
            )
            (cycle / "gates.json").write_text(
                json.dumps(
                    {
                        "score_gate": {
                            "thresholds": {"absolute_pass": 85, "improvement_delta": 10},
                            "reason": "delta 0 < 10",
                        },
                        "gates": {
                            "pytest_ok": False,
                            "playwright_ok": True,
                            "dual_wiki_ok": True,
                            "score_ok": False,
                            "passed": False,
                        },
                    }
                ),
                encoding="utf-8",
            )
            (cycle / "assessment.json").write_text(
                json.dumps(
                    {
                        "prioritized_suggestions": [
                            {
                                "rank": 1,
                                "title": "Remount actions into Svc",
                                "axis": "control_density",
                                "expected_uplift": "high",
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )
            body = build_complete_message(
                consumer_id="forge-market",
                page_slug="wiki-detail",
                iteration=1,
                cycle_dir=cycle,
                campaign_id="fm-ux-demo",
                page_index=3,
                page_total=16,
                cursor_applied=2,
                cursor_total=3,
            )
            self.assertTrue(body.startswith("**[forge-market] FAIL**"))
            self.assertIn("pytest FAIL", body)
            self.assertIn("Remount actions into Svc", body)
            self.assertIn("pages/wiki-detail/iter-001", body)
            self.assertNotIn(str(cycle.resolve()), body)
            self.assertIn("Cursor: applied/planned 2/3", body)

    def test_start_message_uses_clean_purpose(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            cycle = Path(tmp) / "pages" / "filings" / "iter-001"
            cycle.mkdir(parents=True)
            body = build_start_message(
                consumer_id="forge-market",
                page_slug="filings",
                page_title="Filings",
                page_path="/filings",
                purpose="# Dual-wiki context\n## Feature IDs\n",
                campaign_id="camp-1",
                cycle_dir=cycle,
                page_index=1,
                page_total=4,
            )
            self.assertIn("**[forge-market] START**", body)
            self.assertIn("Review and uplift Filings", body)
            self.assertNotIn("Feature IDs", body)

    def test_rich_html_content(self) -> None:
        content = matrix_message_content("**[x] PASS**\n- one\n- two")
        self.assertEqual(content["msgtype"], "m.text")
        self.assertEqual(content["format"], "org.matrix.custom.html")
        self.assertIn("<strong>", content["formatted_body"])
        self.assertIn("<li>", content["formatted_body"])

    def test_short_cycle_ref(self) -> None:
        path = Path("/home/u/Code/workbench/studio-ux-pdca/forge-market/c1/pages/a/iter-001")
        self.assertEqual(short_cycle_ref(path), "pages/a/iter-001")

    def test_suggestion_fallback_to_summary(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            cycle = Path(tmp)
            (cycle / "changes-summary.md").write_text(
                "Keep the shell. Remount the dense toolbar into tabs.",
                encoding="utf-8",
            )
            bullets = suggestion_bullets(cycle)
            self.assertEqual(len(bullets), 1)
            self.assertIn("Keep the shell", bullets[0])


if __name__ == "__main__":
    raise SystemExit(unittest.main())
