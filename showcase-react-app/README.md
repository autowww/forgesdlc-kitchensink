# Showcase live React bundle

Builds a single IIFE under `dist/react-primitives-demo.js` that mounts
`TileDropdownControl` and `ForgeKeyValueGrid` on the
`#ks-react-primitives-root` node. Option rows and key/value metadata are loaded
from static JSON (normal `GET` requests) in `public/data/react-primitives/`.

**Prerequisite:** run from the **forgesdlc-kitchensink** repo root:

```bash
cd showcase-react-app
npm ci
npm run build
cd ..
python3 generator/build-showcase.py
```

`build-showcase.py` copies this package’s `dist/react-primitives-demo.js` into
`showcase/assets/` and `dist/data/**` into `showcase/data/`.

**Preview** (static server must be rooted at `showcase/` so relative `data/...`
and `assets/...` resolve):

```bash
cd showcase
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/react-primitives-live.html`.

To change sample payloads, edit the JSON in `public/data/react-primitives/` and
re-run `npm run build` then `build-showcase.py`. To change endpoints without
rebuilding, edit the `data-tile-endpoint` / `data-kv-endpoint` attributes in
`generator/pages/react_primitives_live.py` and rebuild **only** the static HTML
step.
