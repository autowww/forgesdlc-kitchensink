"""SEO helpers: meta description truncation and JSON-LD for handbook pages."""

from __future__ import annotations

import json
from typing import Any


def truncate_meta_description(text: str, max_len: int = 300) -> str:
    """Trim plain text for ``meta name=description`` / ``og:description``."""
    t = " ".join((text or "").split())
    if len(t) <= max_len:
        return t
    return t[: max_len - 1].rsplit(" ", 1)[0] + "…"


def handbook_json_ld(
    *,
    page_name: str,
    description: str,
    page_url: str,
    site_name: str,
    site_url: str,
    breadcrumb: list[tuple[str, str]] | None = None,
) -> str:
    """Return JSON-LD ``<script>`` body: WebPage + optional BreadcrumbList."""
    graph: list[dict[str, Any]] = [
        {
            "@type": "WebPage",
            "name": page_name,
            "description": truncate_meta_description(description, 320),
            "url": page_url,
            "isPartOf": {
                "@type": "WebSite",
                "name": site_name,
                "url": site_url.rstrip("/") + "/",
            },
        }
    ]
    if breadcrumb and len(breadcrumb) >= 2:
        graph.append(
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": i + 1,
                        "name": name,
                        "item": url,
                    }
                    for i, (name, url) in enumerate(breadcrumb)
                ],
            }
        )
    payload = {"@context": "https://schema.org", "@graph": graph}
    return json.dumps(payload, ensure_ascii=False)


def organization_json_ld(
    *,
    name: str,
    url: str,
    description: str | None = None,
) -> str:
    """JSON-LD for Organization (e.g. handbook home)."""
    org: dict[str, Any] = {
        "@type": "Organization",
        "name": name,
        "url": url.rstrip("/") + "/",
    }
    if description:
        org["description"] = truncate_meta_description(description, 320)
    return json.dumps(
        {"@context": "https://schema.org", "@graph": [org]},
        ensure_ascii=False,
    )


def blueprint_handbook_hub_json_ld(
    *,
    origin: str,
    page_title: str,
    description: str,
) -> str:
    """Organization + WebSite + WebPage for the Blueprints handbook home."""
    base = origin.rstrip("/")
    desc = truncate_meta_description(description, 320)
    graph: list[dict[str, Any]] = [
        {
            "@type": "Organization",
            "name": "ForgeSDLC",
            "url": base + "/",
        },
        {
            "@type": "WebSite",
            "name": "Blueprints handbook",
            "url": base + "/",
            "description": desc,
        },
        {
            "@type": "WebPage",
            "name": page_title,
            "description": desc,
            "url": base + "/index.html",
        },
    ]
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)


def lenses_handbook_hub_json_ld(
    *,
    origin: str,
    page_title: str,
    description: str,
) -> str:
    """WebPage + SoftwareApplication for the Lenses / Studio / Wizard hub."""
    base = origin.rstrip("/")
    desc = truncate_meta_description(description, 320)
    graph: list[dict[str, Any]] = [
        {
            "@type": "WebPage",
            "name": page_title,
            "description": desc,
            "url": base + "/lenses/index.html",
        },
        {
            "@type": "SoftwareApplication",
            "name": "Forge Lenses",
            "description": desc,
            "url": base + "/lenses/index.html",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Cross-platform",
        },
    ]
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)


def software_application_json_ld(
    *,
    name: str,
    description: str,
    url: str,
    application_category: str = "DeveloperApplication",
) -> str:
    """JSON-LD for a local dev app (e.g. Lenses hub)."""
    app: dict[str, Any] = {
        "@type": "SoftwareApplication",
        "name": name,
        "description": truncate_meta_description(description, 320),
        "url": url.rstrip("/") + "/",
        "applicationCategory": application_category,
        "operatingSystem": "Cross-platform",
    }
    return json.dumps(
        {"@context": "https://schema.org", "@graph": [app]},
        ensure_ascii=False,
    )
