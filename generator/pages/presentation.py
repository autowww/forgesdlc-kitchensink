"""Presentation controls — stage carousel, rails, logo strips (product / marketing layer)."""
from __future__ import annotations

from presentation import (
    LogoItem,
    RailItem,
    StageSlide,
    render_card_rail,
    render_gallery_carousel,
    render_hero_carousel,
    render_logo_strip,
    render_rail,
    render_stage_carousel,
    render_testimonial_slider,
    render_thumb_gallery,
)

PAGE = {
    "slug": "presentation",
    "title": "Presentation controls",
    "intro": "fs-stage-carousel and fs-rail primitives for marketing and storytelling pages.",
    "family": "Components",
    "layout": "showcase",
    "order": 3.5,
    "toc": [
        ("sec-stage-vs-rail", "Stage vs rail"),
        ("sec-stage-primitive", "Primitive · fs-stage-carousel"),
        ("sec-hero", "fs-hero-carousel"),
        ("sec-gallery", "fs-gallery-carousel"),
        ("sec-thumb", "fs-thumb-gallery"),
        ("sec-rail-primitive", "Primitive · fs-rail"),
        ("sec-card-rail", "fs-card-rail"),
        ("sec-logo-strip", "fs-logo-strip"),
        ("sec-testimonial", "fs-testimonial-slider"),
        ("sec-actions", "Slide actions · link, preview, lightbox"),
    ],
}


def extra_css() -> str:
    return '  <link rel="stylesheet" href="assets/forgesdlc-theme.css" />\n'


def extra_js_paths() -> list[str]:
    return ["assets/fs-presentation.js"]


def _img(name: str) -> str:
    return f"assets/svg/{name}"


def render() -> str:
    hero_slides = [
        StageSlide(
            eyebrow="Methodology",
            title="Calm, full-width story beats",
            body="Hero stages use the same glass-adjacent overlays and typography as the rest of Forge — no generic SaaS chrome.",
            image_src=_img("template-linear-flow.svg"),
            image_alt="Linear flow diagram",
            href="tokens.html",
            cta_label="View tokens",
            badge="Phase 1",
            meta="Autoplay pauses on hover, focus, and manual navigation.",
        ),
        StageSlide(
            eyebrow="Delivery",
            title="Optional autoplay with reduced-motion respect",
            body="When prefers-reduced-motion is set, autoplay does not run.",
            image_src=_img("template-loop-cycle.svg"),
            image_alt="Loop cycle diagram",
            href="surfaces.html",
            cta_label="Surfaces",
        ),
        StageSlide(
            eyebrow="Evidence",
            title="Subtle motion only",
            body="Transforms stay slow; arrows and dots use existing focus rings.",
            image_src=_img("template-roadmap.svg"),
            image_alt="Roadmap diagram",
            href="motion.html",
            cta_label="Motion",
        ),
    ]

    gallery_slides = [
        StageSlide(
            title="Linear flow",
            body="Click opens lightbox on this slide.",
            image_src=_img("template-linear-flow.svg"),
            image_alt="Linear flow",
            preview_mode="lightbox",
        ),
        StageSlide(
            title="Swimlane",
            body="Native link to the diagrams page.",
            image_src=_img("template-swimlane.svg"),
            image_alt="Swimlane",
            preview_mode="link",
            href="diagrams.html",
        ),
        StageSlide(
            title="Funnel",
            body="Third slide — swipe or use arrows.",
            image_src=_img("template-funnel.svg"),
            image_alt="Funnel",
            preview_mode="none",
        ),
    ]

    thumb_slides = [
        StageSlide(
            title="KPI card",
            body="Thumbnail strip syncs with the main stage.",
            image_src=_img("template-kpi-card.svg"),
            image_alt="KPI card",
            preview_mode="none",
        ),
        StageSlide(
            title="Bar chart",
            body="Keyboard-accessible thumbs act as tabs.",
            image_src=_img("template-bar-chart.svg"),
            image_alt="Bar chart",
            preview_mode="none",
        ),
        StageSlide(
            title="Heatmap",
            body="Good for product screenshots and walkthroughs.",
            image_src=_img("template-heatmap.svg"),
            image_alt="Heatmap",
            preview_mode="none",
        ),
    ]

    primitive_stage = render_stage_carousel(
        [
            StageSlide(
                eyebrow="Primitive",
                title="fs-stage-carousel",
                body="Emitted by render_stage_carousel (hero variant) — thin wrappers call the same helper.",
                image_src=_img("template-quadrant.svg"),
                image_alt="Quadrant",
                preview_mode="none",
            ),
            StageSlide(
                eyebrow="Second",
                title="Translate track",
                body="Fixed aspect viewport avoids layout shift between slides.",
                image_src=_img("template-venn.svg"),
                image_alt="Venn",
                preview_mode="none",
            ),
        ],
        carousel_id="demo-primitive-stage",
        variant="hero",
        autoplay=False,
        aspect_ratio="16/9",
    )

    hero_demo = render_hero_carousel(
        hero_slides,
        carousel_id="demo-hero",
        autoplay=True,
        interval_ms=6500,
        loop=True,
        aspect_ratio="21/9",
        content_alignment="start",
    )

    gallery_demo = render_gallery_carousel(
        gallery_slides,
        carousel_id="demo-gallery",
        autoplay=False,
        aspect_ratio="16/9",
    )

    thumb_demo = render_thumb_gallery(
        thumb_slides,
        carousel_id="demo-thumb",
        aspect_ratio="16/9",
        show_dots=True,
    )

    rail_items = [
        RailItem(title="Diagrams", body="SVG templates and modal viewer.", href="diagrams.html", meta="Handbook"),
        RailItem(title="Layouts", body="Showcase, gallery, split, product.", href="layouts.html", meta="Patterns"),
        RailItem(title="Motion", body="Pulse, breathe, stat counters.", href="motion.html", meta="Foundation"),
        RailItem(title="Tokens", body="Color, type, spacing.", href="tokens.html", meta="Foundation"),
    ]
    rail_primitive = render_rail(rail_items, variant="cards", rail_id="demo-rail-primitive")

    card_rail_demo = render_card_rail(
        [
            RailItem(
                title="Product layout preview",
                body="Opens the existing topic preview modal (iframe + embed).",
                href="preview-product.html",
                preview_mode="topic-preview",
                meta="Topic preview",
            ),
            RailItem(
                title="Controls reference",
                body="Standard link card using forge-card surface.",
                href="controls.html",
                preview_mode="none",
                meta="Link",
            ),
            RailItem(
                title="For agents",
                body="Single-page spec for models and tooling.",
                href="for-agents.html",
                preview_mode="none",
                meta="Patterns",
            ),
        ],
        rail_id="demo-card-rail",
    )

    logos = [
        LogoItem(src=_img("template-gate-chain.svg"), alt="Partner A"),
        LogoItem(src=_img("template-tree.svg"), alt="Partner B"),
        LogoItem(src=_img("template-network.svg"), alt="Partner C"),
        LogoItem(src=_img("template-board-columns.svg"), alt="Partner D"),
    ]
    logo_grid = render_logo_strip(logos, mode="grid")
    logo_rail = render_logo_strip(logos, mode="rail", rail_id="demo-logo-rail")
    logo_marquee = render_logo_strip(logos, mode="marquee")

    testimonials = [
        StageSlide(
            quote="The design system stayed coherent because we extended tokens and glass instead of bolting on a new kit.",
            person="Engineering lead",
            role="Director",
            company="Example Corp",
            avatar_src=_img("template-gauge.svg"),
        ),
        StageSlide(
            quote="Rails for cards and logos, carousels for one-up stories — the split matches how we ship pages.",
            person="Product marketing",
            role="PMM",
            company="Example Org",
        ),
    ]
    testimonial_demo = render_testimonial_slider(
        testimonials,
        carousel_id="demo-testimonial",
        autoplay=False,
    )

    action_link = render_gallery_carousel(
        [
            StageSlide(
                title="Link action",
                body="Entire media hit is a normal anchor.",
                image_src=_img("template-checklist.svg"),
                image_alt="Checklist",
                preview_mode="link",
                href="navigation.html",
            ),
        ],
        carousel_id="demo-action-link",
        show_dots=False,
        loop=False,
    )

    action_topic = render_gallery_carousel(
        [
            StageSlide(
                title="Topic preview",
                body="Opens openTopicPreviewModal (same as topic preview card).",
                image_src=_img("layout-schematic-product.svg"),
                image_alt="Product layout",
                preview_mode="topic-preview",
                href="preview-product.html",
            ),
        ],
        carousel_id="demo-action-topic",
        show_dots=False,
        loop=False,
    )

    action_lightbox = render_gallery_carousel(
        [
            StageSlide(
                title="Lightbox",
                body="Button opens fs media lightbox (not the diagram modal).",
                image_src=_img("template-timeline.svg"),
                image_alt="Timeline",
                preview_mode="lightbox",
            ),
        ],
        carousel_id="demo-action-lightbox",
        show_dots=False,
        loop=False,
    )

    return f"""\
<section id="sec-stage-vs-rail" class="ks-section">
  <h2 class="ks-section-title">Stage vs rail</h2>
  <p class="forge-support mb-3">
    Use a <strong>stage carousel</strong> when a single slide should own attention — heroes, testimonials, image-first galleries.
    Use a <strong>rail</strong> when several peers scroll horizontally — case studies, logos, related cards. Rails default to manual scroll
    (snap + optional arrows); stage carousels support autoplay with pause on interaction and respect <code>prefers-reduced-motion</code>.
  </p>
</section>

<section id="sec-stage-primitive" class="ks-section">
  <h2 class="ks-section-title">Primitive · <code>fs-stage-carousel</code></h2>
  <p class="forge-support mb-3">Base track + viewport; variants add modifier classes only.</p>
  {primitive_stage}
</section>

<section id="sec-hero" class="ks-section">
  <h2 class="ks-section-title"><code>fs-hero-carousel</code></h2>
  <p class="forge-support mb-3">Wide stage with overlay copy and CTAs. Autoplay enabled below for demo (pauses on hover / focus / manual nav).</p>
  {hero_demo}
</section>

<section id="sec-gallery" class="ks-section">
  <h2 class="ks-section-title"><code>fs-gallery-carousel</code></h2>
  <p class="forge-support mb-3">Image-first slides with caption overlay. First slide: lightbox; second: link; third: no action.</p>
  {gallery_demo}
</section>

<section id="sec-thumb" class="ks-section">
  <h2 class="ks-section-title"><code>fs-thumb-gallery</code></h2>
  <p class="forge-support mb-3">Main gallery plus thumbnail strip; thumbnails call the same controller as arrows and dots.</p>
  {thumb_demo}
</section>

<section id="sec-rail-primitive" class="ks-section">
  <h2 class="ks-section-title">Primitive · <code>fs-rail</code></h2>
  <p class="forge-support mb-3">CSS scroll-snap scroller; arrows scroll by one viewport chunk. Card variant uses <code>.forge-card</code>.</p>
  {rail_primitive}
</section>

<section id="sec-card-rail" class="ks-section">
  <h2 class="ks-section-title"><code>fs-card-rail</code></h2>
  <p class="forge-support mb-3">First tile uses topic preview; others are plain links.</p>
  {card_rail_demo}
</section>

<section id="sec-logo-strip" class="ks-section">
  <h2 class="ks-section-title"><code>fs-logo-strip</code></h2>
  <p class="section-label text-cyan mb-2">Grid</p>
  {logo_grid}
  <p class="section-label text-cyan mb-2 mt-4">Rail (scroll-snap + arrows)</p>
  {logo_rail}
  <p class="section-label text-cyan mb-2 mt-4">Marquee (static when reduced-motion)</p>
  <p class="forge-support small mb-2">Duplicated segment for seamless loop; animation disabled under <code>prefers-reduced-motion</code>.</p>
  {logo_marquee}
</section>

<section id="sec-testimonial" class="ks-section">
  <h2 class="ks-section-title"><code>fs-testimonial-slider</code></h2>
  <p class="forge-support mb-3">One-up stage with quote typography; autoplay off by default.</p>
  {testimonial_demo}
</section>

<section id="sec-actions" class="ks-section">
  <h2 class="ks-section-title">Slide actions</h2>
  <p class="forge-support mb-3">Three minimal carousels showing <code>preview_mode</code> / hit targets.</p>
  <p class="section-label text-cyan mb-2">Normal link</p>
  {action_link}
  <p class="section-label text-cyan mb-2 mt-4">Topic preview modal</p>
  {action_topic}
  <p class="section-label text-cyan mb-2 mt-4">Image lightbox</p>
  {action_lightbox}
</section>
"""
