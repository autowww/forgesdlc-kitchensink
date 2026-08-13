#!/usr/bin/env python3
"""ChatGPT UX assessment for Studio UX PDCA (CDP-attached Edge)."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

PROMPT_FILE = Path(__file__).resolve().parent / "prompts" / "assess-studio-ux.txt"
LIB_DIR = Path(__file__).resolve().parent / "lib"
if str(LIB_DIR) not in sys.path:
    sys.path.insert(0, str(LIB_DIR))
from load_ruleset import format_prompt_appendix, validate_findings  # noqa: E402


def _load_text(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def _mock_assessment(cycle_dir: Path) -> dict:
    desc = _load_text(cycle_dir / "description.md")
    page = {}
    page_json = cycle_dir / "page.json"
    if page_json.exists():
        page = json.loads(page_json.read_text(encoding="utf-8"))
    title_mismatch = (page.get("h1") or "").lower() != (page.get("active_rail_label") or "").lower()
    h2 = int(page.get("h2_count") or 0)
    base = 45 if title_mismatch or h2 > 4 else 58
    return {
        "scores": {
            "page_identity": 30 if title_mismatch else 70,
            "job_budget": 35 if h2 > 4 else 65,
            "control_density": 40,
            "human_outcome": base,
            "wiki_functionality": 100,
            "enterprise_ux": base,
            "human_friendliness": base,
            "overall": base,
        },
        "findings": [
            {
                "severity": "critical" if title_mismatch else "major",
                "axis": "page_identity" if title_mismatch else "job_budget",
                "rule_id": "DET.STUDIO.TITLE_NAV_MATCH" if title_mismatch else "DET.STUDIO.JOB_BUDGET",
                "evidence": desc[:400] or "DOM density / title mismatch",
                "suggested_ks_component": "Svc",
            }
        ],
        "wiki_gaps": [],
        "changes_summary": "Align H1 with rail; tab secondary jobs; reduce control density.",
        "pdca_prompt": (
            "# Studio UX PDCA\n\n"
            "## Plan\nFix page identity and job budget per DET.STUDIO.JOB_BUDGET / TITLE_NAV_MATCH.\n\n"
            "## Do\n- Rename H1 to match rail (Watchlists)\n"
            "- Add Lists/Screen/Alerts/Compare tabs (Svc)\n"
            "- One primary CTA per tab\n\n"
            "## Check\n- pytest\n- npx playwright test\n\n"
            "## Adjust\nRe-capture full scroll if density findings remain.\n"
        ),
        "_source": "mock",
        "_mock": True,
    }


def _build_prompt(cycle_dir: Path) -> str:
    description = _load_text(cycle_dir / "description.md")
    wiki = _load_text(cycle_dir / "wiki-context.md")
    prior = ""
    scores_path = cycle_dir / "scores.json"
    if scores_path.exists():
        prior = scores_path.read_text(encoding="utf-8")
    page_meta = {}
    page_json = cycle_dir / "page.json"
    if page_json.exists():
        page_meta = json.loads(page_json.read_text(encoding="utf-8"))
    is_wiki_page = bool(page_meta.get("requires_dual_wiki_gate")) or any(
        k in (page_meta.get("title") or "").lower() for k in ("wiki", "graph")
    )
    page_type = "wiki_graph" if is_wiki_page else "studio_ops"
    ks_base = os.environ.get("KS_PUBLIC_BASE", "https://ks.forgesdlc.com").rstrip("/")
    template = PROMPT_FILE.read_text(encoding="utf-8").replace("{KS_PUBLIC_BASE}", ks_base)
    template = template.replace("`KS_PUBLIC_BASE`", ks_base)
    screenshot = cycle_dir / "before.png"
    shot_note = (
        "A full-length screenshot of the scrollable main pane is ATTACHED to this message. "
        "Judge the entire scroll, including below-the-fold sections."
        if screenshot.exists()
        else "(screenshot missing — judge from DOM description only)"
    )
    return (
        f"{template}\n\n---\n\n{format_prompt_appendix(ks_base)}\n\n"
        f"## KS_PUBLIC_BASE\n\n{ks_base}\n\n"
        f"## Page type\n\n`{page_type}` — slug={page_meta.get('slug', '?')}, "
        f"title={page_meta.get('title', '?')}, path={page_meta.get('path', '?')}\n\n"
        f"## Screenshot\n\n{shot_note}\n\n"
        f"## Page description\n\n{description}\n\n"
        f"## Wiki context\n\n{wiki}\n\n## Prior scores\n\n{prior or '(none)'}\n"
    )


def _strip_fences(text: str) -> str:
    text = text.strip()
    fence = re.match(r"^```(?:json)?\s*([\s\S]*?)\s*```$", text)
    if fence:
        return fence.group(1).strip()
    return text


def _parse_assessment_json(text: str) -> dict:
    from forge_lcdl.kb.category_fragment import parse_json_from_text

    cleaned = _strip_fences(text).replace("\u201c", "'").replace("\u201d", "'")
    attempts = [cleaned]
    try:
        from json_repair import repair_json

        attempts.append(repair_json(cleaned))
    except ImportError:
        pass

    last_exc: Exception | None = None
    for candidate in attempts:
        try:
            return parse_json_from_text(candidate)
        except (ValueError, json.JSONDecodeError) as exc:
            last_exc = exc
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        blob = match.group(0)
        try:
            from json_repair import repair_json

            return json.loads(repair_json(blob))
        except Exception:
            try:
                return json.loads(blob)
            except json.JSONDecodeError:
                pass
    raise ValueError(f"ChatGPT response is not valid assessment JSON: {last_exc}") from last_exc


def _prepare_attach_file(screenshot: Path) -> Path:
    """Prefer JPEG under ~3.5MB for ChatGPT upload."""
    if not screenshot.exists():
        return screenshot
    size = screenshot.stat().st_size
    if size < 3_500_000:
        return screenshot
    try:
        from PIL import Image

        jpg = screenshot.with_suffix(".jpg")
        im = Image.open(screenshot).convert("RGB")
        im.save(jpg, "JPEG", quality=78, optimize=True)
        return jpg
    except Exception:
        return screenshot


def _attach_screenshot(page, screenshot: Path) -> bool:
    """Attach screenshot to ChatGPT composer."""
    if not screenshot.exists():
        return False
    attach_path = _prepare_attach_file(screenshot)

    def _try_set_files(sel: str) -> bool:
        loc = page.locator(sel)
        if loc.count() == 0:
            return False
        try:
            loc.first.set_input_files(str(attach_path))
            page.wait_for_timeout(2500)
            return True
        except Exception:
            return False

    # Prefer known ChatGPT upload inputs (PNG → photos or files).
    for sel in ("#upload-photos", "#upload-files", "input[type='file']"):
        if _try_set_files(sel):
            return True

    # Reveal composer plus menu, then retry.
    try:
        plus = page.locator("[data-testid='composer-plus-btn'], button[aria-label*='Add files' i]").first
        if plus.count() > 0:
            plus.click(timeout=5000)
            page.wait_for_timeout(800)
            for sel in ("#upload-photos", "#upload-files", "input[type='file']"):
                if _try_set_files(sel):
                    return True
            # Menu item click → file chooser
            for name in ("Add photos", "Upload files", "Add files", "Upload from computer"):
                try:
                    item = page.get_by_role("menuitem", name=name)
                    if item.count() == 0:
                        item = page.get_by_text(name, exact=False)
                    if item.count() == 0:
                        continue
                    with page.expect_file_chooser(timeout=8000) as fc_info:
                        item.first.click(timeout=5000)
                    fc_info.value.set_files(str(attach_path))
                    page.wait_for_timeout(2500)
                    return True
                except Exception:
                    continue
    except Exception:
        pass

    selectors = (
        "button[aria-label*='Attach' i]",
        "button[aria-label*='Upload' i]",
        "button[aria-label*='Add photos' i]",
        "[data-testid='composer-attach']",
    )
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            if loc.count() == 0:
                continue
            with page.expect_file_chooser(timeout=8000) as fc_info:
                loc.click(timeout=5000)
            fc_info.value.set_files(str(attach_path))
            page.wait_for_timeout(2000)
            return True
        except Exception:
            continue
    return False


def assess_with_chatgpt(cycle_dir: Path, project: str) -> dict:
    from playwright.sync_api import sync_playwright

    from forge_lcdl.playwright.connectors.chatgpt import (
        append_repair_to_prompt,
        connect_chatgpt_tab,
        default_cdp_url,
        send_chatgpt_prompt,
    )
    from forge_lcdl.result import Err

    prompt = _build_prompt(cycle_dir)
    cdp_url = os.environ.get("CDP_URL", default_cdp_url())
    timeout_sec = int(os.environ.get("CHATGPT_TIMEOUT_SEC", "420"))
    screenshot = cycle_dir / "before.png"
    raw_path = cycle_dir / "chatgpt-response.txt"
    require_attach = os.environ.get("REQUIRE_SCREENSHOT_ATTACH", "1") == "1"
    # File upload needs real Playwright locators (selective CDP shim lacks set_input_files).
    os.environ.setdefault("FORGE_LCDL_CDP_SELECTIVE_ATTACH", "0")

    with sync_playwright() as pw:
        attached = connect_chatgpt_tab(pw, cdp_url, project_name=project or None)
        if isinstance(attached, Err):
            raise RuntimeError(attached.error.message)
        session = attached.value
        try:
            ok_attach = _attach_screenshot(session.page, screenshot)
            if require_attach and screenshot.exists() and not ok_attach:
                raise RuntimeError("Failed to attach full-page screenshot to ChatGPT composer")
            sent = send_chatgpt_prompt(session.page, prompt, timeout_sec=timeout_sec, min_response_chars=40)
            if isinstance(sent, Err):
                raise RuntimeError(sent.error.message)
            response_text = sent.value
            raw_path.write_text(response_text + "\n", encoding="utf-8")

            try:
                assessment = _parse_assessment_json(response_text)
            except ValueError as first_err:
                repair = append_repair_to_prompt(
                    prompt,
                    problems=[
                        str(first_err),
                        "Return ONLY one JSON object matching the schema. No markdown fences. Escape quotes in strings.",
                    ],
                    previous_response=response_text[:6000],
                )
                sent2 = send_chatgpt_prompt(
                    session.page, repair, timeout_sec=timeout_sec, min_response_chars=40
                )
                if isinstance(sent2, Err):
                    raise RuntimeError(f"JSON repair failed: {sent2.error.message}") from first_err
                response_text = sent2.value
                raw_path.write_text(response_text + "\n", encoding="utf-8")
                assessment = _parse_assessment_json(response_text)
        finally:
            session.close_tab()

    assessment["_source"] = "chatgpt"
    assessment["_chatgpt_project"] = project
    assessment["_screenshot_attached"] = True
    assessment["_assessed_at"] = datetime.now(timezone.utc).isoformat()
    assessment.pop("_mock", None)
    pack_warnings = validate_findings(assessment.get("findings") or [])
    if pack_warnings:
        assessment["_ruleset_warnings"] = pack_warnings
    return assessment


def main() -> int:
    ap = argparse.ArgumentParser(description="Studio UX ChatGPT assessment")
    ap.add_argument("cycle_dir", type=Path)
    ap.add_argument(
        "--project",
        default=os.environ.get("FM_STUDIO_UX_CHATGPT_PROJECT", "Forge Market"),
    )
    ap.add_argument("--mock", action="store_true", help="Explicit mock only (never used on CDP failure)")
    args = ap.parse_args()
    cycle_dir = args.cycle_dir.resolve()
    cycle_dir.mkdir(parents=True, exist_ok=True)

    if args.mock or os.environ.get("SKIP_GPT_ASSESSMENT") == "1":
        assessment = _mock_assessment(cycle_dir)
        print("[assess-page-gpt] using explicit mock assessment", file=sys.stderr)
    else:
        print(
            f"[assess-page-gpt] live ChatGPT via CDP project={args.project!r}",
            file=sys.stderr,
        )
        assessment = assess_with_chatgpt(cycle_dir, args.project)

    assessment_path = cycle_dir / "assessment.json"
    assessment_path.write_text(json.dumps(assessment, indent=2) + "\n", encoding="utf-8")
    pdca = assessment.get("pdca_prompt", "")
    pdca_path = cycle_dir / "pdca-prompt.md"
    pdca_path.write_text(pdca if pdca.endswith("\n") else pdca + "\n", encoding="utf-8")
    summary = assessment.get("changes_summary", "")
    if summary:
        (cycle_dir / "changes-summary.md").write_text(summary + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "ok": True,
                "source": assessment.get("_source", "unknown"),
                "assessment_path": str(assessment_path),
                "pdca_prompt_path": str(pdca_path),
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
