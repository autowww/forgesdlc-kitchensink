"""Repo artifact link neutralization."""

from __future__ import annotations

import unittest

from forge_autodoc.repo_link_html import neutralize_repo_artifact_links


class RepoLinkHtmlTests(unittest.TestCase):
    def test_py_link_becomes_code(self) -> None:
        html = '<p><a href="../../examples/basic/run_fake_task.py">runner.py</a></p>'
        out = neutralize_repo_artifact_links(html)
        self.assertIn('<code class="forge-path-ref">runner.py</code>', out)
        self.assertNotIn("href=", out)

    def test_https_left_alone(self) -> None:
        html = '<a href="https://example.com/file.py">x</a>'
        self.assertEqual(neutralize_repo_artifact_links(html), html)

    def test_md_links_left_alone(self) -> None:
        html = '<a href="../reference/CLIENT-API.md">API</a>'
        self.assertEqual(neutralize_repo_artifact_links(html), html)

    def test_cursor_rules_neutralized(self) -> None:
        html = '<a href="../.cursor/rules/lcdl-core.mdc">rule pack</a>'
        out = neutralize_repo_artifact_links(html)
        self.assertIn("forge-path-ref", out)
        self.assertNotIn(".cursor/rules", out)
