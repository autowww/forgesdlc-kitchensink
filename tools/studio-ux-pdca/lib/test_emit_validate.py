#!/usr/bin/env python3
"""Unit tests for emit_pdca_prompts and validate_suggestions."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

LIB_DIR = Path(__file__).resolve().parent
if str(LIB_DIR) not in sys.path:
    sys.path.insert(0, str(LIB_DIR))

from emit_pdca_prompts import (  # noqa: E402
    MAX_SUGGESTIONS,
    emit_pdca_prompts,
    normalize_prioritized_suggestions,
)
from validate_suggestions import validate_suggestions  # noqa: E402


class EmitValidateTests(unittest.TestCase):
    def test_render_from_structured_fields(self) -> None:
        assessment = {
            "scores": {"overall": 55, "wiki_functionality": 100},
            "prioritized_suggestions": [
                {
                    "rank": 1,
                    "id": "tab-jobs",
                    "title": "Move Screen behind tabs",
                    "axis": "job_budget",
                    "rule_id": "DET.STUDIO.JOB_BUDGET",
                    "severity": "major",
                    "expected_uplift": "high",
                    "plan": ["Goal: one primary job"],
                    "do": ["Add Svc tabs", "Hide Screen panel by default"],
                    "check": ["pytest -q"],
                    "adjust": ["Keep deep links working"],
                }
            ],
        }
        with tempfile.TemporaryDirectory() as tmp:
            info = emit_pdca_prompts(assessment, Path(tmp))
            self.assertEqual(info["count"], 1)
            prompt_path = Path(info["prompt_paths"][0])
            body = prompt_path.read_text(encoding="utf-8")
            self.assertIn("## Plan", body)
            self.assertIn("Add Svc tabs", body)
            self.assertIn("implement this change only", body)
            self.assertNotIn("pdca_prompt", body)

    def test_legacy_findings_fallback(self) -> None:
        assessment = {
            "scores": {"overall": 50, "wiki_functionality": 100},
            "findings": [
                {
                    "severity": "major",
                    "axis": "job_budget",
                    "rule_id": "DET.STUDIO.JOB_BUDGET",
                    "evidence": "three H2s above fold",
                    "suggested_ks_component": "Svc",
                }
            ],
        }
        suggestions = normalize_prioritized_suggestions(assessment)
        self.assertEqual(len(suggestions), 1)
        self.assertEqual(suggestions[0]["axis"], "job_budget")

    def test_wiki_boost_injects_wiki_suggestion(self) -> None:
        assessment = {
            "scores": {"overall": 60, "wiki_functionality": 70},
            "findings": [
                {
                    "severity": "major",
                    "axis": "job_budget",
                    "rule_id": "DET.STUDIO.JOB_BUDGET",
                    "evidence": "competing jobs",
                }
            ],
            "wiki_gaps": ["No evidence path visible"],
            "prioritized_suggestions": [
                {
                    "rank": 1,
                    "id": "jobs",
                    "title": "Fix jobs",
                    "axis": "job_budget",
                    "rule_id": "DET.STUDIO.JOB_BUDGET",
                    "do": ["Add tabs"],
                }
            ],
        }
        page_meta = {"requires_dual_wiki_gate": True, "title": "Wiki article"}
        suggestions = normalize_prioritized_suggestions(assessment, page_meta)
        axes = {s["axis"] for s in suggestions}
        self.assertIn("wiki_functionality", axes)

    def test_validate_caps_at_max(self) -> None:
        raw = [
            {
                "rank": i,
                "id": f"s{i}",
                "title": f"Suggestion {i}",
                "axis": "job_budget",
                "rule_id": "DET.STUDIO.JOB_BUDGET",
                "do": [f"task {i}"],
            }
            for i in range(1, 8)
        ]
        assessment = {"prioritized_suggestions": raw, "scores": {"wiki_functionality": 100}}
        result = validate_suggestions(assessment, max_suggestions=MAX_SUGGESTIONS)
        self.assertTrue(result["truncated"])
        self.assertEqual(len(result["suggestions"]), MAX_SUGGESTIONS)
        self.assertTrue(any("truncated" in w for w in result["warnings"]))

    def test_validate_rejects_bad_rule_id(self) -> None:
        assessment = {
            "prioritized_suggestions": [
                {
                    "rank": 1,
                    "id": "bad",
                    "title": "Bad rule",
                    "axis": "job_budget",
                    "rule_id": "DET.SECTION.SINGLE_JOB",
                    "do": ["fix"],
                }
            ],
            "scores": {"wiki_functionality": 100},
        }
        result = validate_suggestions(assessment)
        self.assertTrue(any("out-of-pack" in w for w in result["warnings"]))

    def test_validate_laundry_list_warning(self) -> None:
        examples = Path(__file__).resolve().parent.parent / "prompts" / "examples"
        bad = json.loads((examples / "bad-laundry-list.json").read_text(encoding="utf-8"))
        assessment = {"prioritized_suggestions": [bad], "scores": {"wiki_functionality": 100}}
        result = validate_suggestions(assessment)
        self.assertTrue(any("laundry-list" in w for w in result["warnings"]))
        self.assertLessEqual(len(result["suggestions"][0]["do"]), 6)

    def test_high_score_caps_suggestions(self) -> None:
        assessment = {
            "scores": {"overall": 90, "wiki_functionality": 100},
            "prioritized_suggestions": [
                {
                    "rank": i,
                    "id": f"s{i}",
                    "title": f"Polish {i}",
                    "axis": "human_outcome",
                    "rule_id": "null",
                    "severity": "minor",
                    "do": [f"polish {i}"],
                }
                for i in range(1, 5)
            ],
        }
        suggestions = normalize_prioritized_suggestions(assessment)
        self.assertLessEqual(len(suggestions), 2)


if __name__ == "__main__":
    unittest.main()
