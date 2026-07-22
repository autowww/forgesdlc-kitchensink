# Mind-map editable API (consumer backend)

Optional backend for `Mme` when not using `data-ks-mindmap-save-demo="1"`.

## GET load

**Request:** `GET {load_url}` with `Accept: application/json`

**Response:**

```json
{
  "version": 1,
  "title": "Kitchen Sink",
  "root": {
    "id": "root",
    "label": "Kitchen Sink",
    "children": []
  }
}
```

## POST save

**Request:** `POST {save_url}` with `Content-Type: application/json`

**Body:**

```json
{
  "version": 1,
  "mindmap_id": "ks-creation",
  "tree": {
    "id": "root",
    "label": "Kitchen Sink",
    "children": []
  }
}
```

**Success:** `{ "ok": true }`

**Failure:** `{ "ok": false, "error": "human-readable message" }` with HTTP 4xx/5xx as appropriate.

## Static hosting (Firebase)

When no POST endpoint exists, set `data-ks-mindmap-save-demo="1"`. The client persists the full payload to `sessionStorage` under key `ks-mindmap-demo:{mindmap_id}`.

## Example stub (FastAPI)

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
STORE: dict[str, dict] = {}

class SaveBody(BaseModel):
    version: int
    mindmap_id: str
    tree: dict

@app.get("/v1/mindmaps/{mindmap_id}")
def load_mindmap(mindmap_id: str):
    return STORE.get(mindmap_id, {"version": 1, "title": "", "root": {"id": "root", "label": "New", "children": []}})

@app.post("/v1/mindmaps/{mindmap_id}")
def save_mindmap(mindmap_id: str, body: SaveBody):
    STORE[mindmap_id] = {"version": body.version, "title": body.tree.get("label", ""), "root": body.tree}
    return {"ok": True}
```

Not shipped in KS CI; documentation reference only.
