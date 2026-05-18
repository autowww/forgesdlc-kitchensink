---
hash: "XYZ"
name: "example-visual"
type: "component"
status: "proposed"
source_paths: []
showcase_url: ""
screenshot_url: "https://ks.forgesdlc.com/showcase/screenshots/XYZ.png"
screenshot_status: "planned"
---

# XYZ — Example visual

## Purpose

What job this visual performs for a user.

## Expected look

Describe the desired visual impression: scale, spacing, rhythm, density, hierarchy, tone, enterprise feel, and relationship to surrounding surfaces.

## Anatomy

- Root
- Header/title region
- Body/content region
- Actions/controls
- Optional media/diagram region
- Status/metadata region

## Content rules

- Allowed copy length
- Required/optional fields
- Empty/loading/error copy behavior
- Terminology constraints

## States

- Default
- Hover, focus, active/selected, disabled
- Empty, loading, error, success
- Reduced motion

## Variants

List supported variants and when to use each.

## Responsive behavior

Desktop, tablet, mobile, and desktop-app/pane behavior where relevant.

## Accessibility contract

- Semantic role/landmark expectations
- Keyboard behavior and focus visibility
- Contrast expectations
- Image/diagram alt requirements
- Motion-reduction expectations

## Enterprise look/feel rules

- Spacious but information-efficient
- Calm, high-trust visual language
- Clear boundaries, hierarchy, and control points

## Forbidden patterns

- Dense link walls
- Unlabeled icon-only controls
- Mystery-meat interactions

## Source paths

- `path/to/source`

## Dependencies

- CSS, JS, assets, tokens as applicable

## Showcase and screenshots

- Showcase: TBD
- Screenshot: `https://ks.forgesdlc.com/showcase/screenshots/XYZ.png`
- Status: planned

## Acceptance checklist

- [ ] Root emits `hash="XYZ"` and `data-ks-hash="XYZ"`.
- [ ] Registry row exists and source paths are current.
- [ ] Contract describes expected look and states.
- [ ] Showcase reference exists or is planned.
- [ ] Screenshot captured or marked planned.
- [ ] Catalog validation passes.

## Change rules

Keep this hash for copy refinements, small spacing/token refinements, bug fixes, and accessibility improvements that preserve visual identity. Allocate a new hash for breaking role changes, incompatible anatomy, or a new reusable visual type.

## Changelog

- YYYY-MM-DD — Created.
