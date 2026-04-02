# Lenses Studio (static museum)

This directory holds a **production build** of **Lenses Studio** from the [forge-lenses](https://github.com/autowww/forge-lenses) repo (`lenses-enterprise/`, output normally at `lenses/static/studio/`). It is hosted on the Kitchen Sink site at **`/studio/`** (e.g. [ks.forgesdlc.com/studio/](https://ks.forgesdlc.com/studio/)) alongside the Python-built showcase.

## What this is

- A **read-only snapshot** of the React SPA for demos and design review.
- **`museum/museum-data/`** — JSON fixtures that replace **`GET /api/…`** when the bundle is built with **`VITE_STATIC_MUSEUM=true`** (`npm run build:museum` in `lenses-enterprise`). The client maps API paths to files under **`/studio/museum-data/`** (see `src/api/staticMuseum.ts` in forge-lenses).
- **`/__ks/`** CSS/JS are **not** duplicated under `museum/`; [`scripts/stage-dist.sh`](../scripts/stage-dist.sh) mirrors this repo’s `css/`, `js/`, and `assets/svg/` into `dist/__ks/` so Studio’s `index.html` resolves the same paths as the local Lenses server.

## What this is not

- **Not** a live workspace: POST actions (git, toolset runs, board mutations) are stubbed or disabled in the museum build.
- **Not** produced by `python3 generator/build-showcase.py`. Refresh only when you intentionally update the museum (see below).

## Refreshing the bundle

From the `forgesdlc-kitchensink` repo root, with a sibling checkout of **forge-lenses**:

```bash
./scripts/rebuild-static-studio-museum.sh
```

That runs **`npm run build:museum`** (static museum mode), syncs **`museum/studio/`**, and you should commit **`museum/studio/`** plus any edits to **`museum/museum-data/`** when you want the next deploy to ship updates.

To adjust demo data shown in the UI, edit the JSON files in **`museum/museum-data/`** (keep filenames in sync with `museumFileForApiPath` in forge-lenses).

## Consumers

Sites that embed this repo as the **`kitchensink`** submodule get the museum in the same submodule pointer—no extra submodule.
