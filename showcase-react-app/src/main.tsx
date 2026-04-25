import { StrictMode, useEffect, useState, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { TileDropdownControl, type TileDropdownOption } from "../../react/TileDropdownControl"
import { ForgeKeyValueGrid } from "../../react/ForgeKeyValueGrid"

type KvFileShape = {
  "aria-label"?: string
  items: { label: string; value: string; title?: string }[]
}

function isTileOptions(x: unknown): x is TileDropdownOption[] {
  if (!Array.isArray(x)) return false
  return x.every(
    (o) =>
      o != null &&
      typeof o === "object" &&
      "value" in o &&
      "title" in o &&
      typeof (o as { value: unknown }).value === "string" &&
      typeof (o as { title: unknown }).title === "string",
  )
}

function isKvData(x: unknown): x is KvFileShape {
  if (x == null || typeof x !== "object" || !("items" in x)) return false
  const it = (x as { items: unknown }).items
  if (!Array.isArray(it)) return false
  return it.every(
    (r) =>
      r != null &&
      typeof r === "object" &&
      typeof (r as { label: unknown }).label === "string" &&
      typeof (r as { value: unknown }).value === "string",
  )
}

type LoadState = { kind: "loading" } | { kind: "ok" } | { kind: "error"; message: string }

function PrimitivesFromStaticFiles(): ReactNode {
  const [tile, setTile] = useState<TileDropdownOption[] | null>(null)
  const [tileValue, setTileValue] = useState("")
  const [kv, setKv] = useState<KvFileShape | null>(null)
  const [st, setSt] = useState<LoadState>({ kind: "loading" })
  const [fetched, setFetched] = useState<string | null>(null)

  const root =
    typeof document !== "undefined"
      ? document.getElementById("ks-react-primitives-root")
      : null
  const tileUrl = root?.dataset.tileEndpoint?.trim() || "data/react-primitives/tile-dropdown-options.json"
  const kvUrl = root?.dataset.kvEndpoint?.trim() || "data/react-primitives/metadata-kv.json"

  useEffect(() => {
    let cancelled = false
    setSt({ kind: "loading" })
    setFetched(null)

    async function run() {
      try {
        const [rTile, rKv] = await Promise.all([
          fetch(tileUrl, { method: "GET", cache: "default" }),
          fetch(kvUrl, { method: "GET", cache: "default" }),
        ])
        if (cancelled) return
        if (!rTile.ok) throw new Error(`GET ${tileUrl} → ${rTile.status} ${rTile.statusText}`)
        if (!rKv.ok) throw new Error(`GET ${kvUrl} → ${rKv.status} ${rKv.statusText}`)

        const jTile: unknown = await rTile.json()
        const jKv: unknown = await rKv.json()

        if (cancelled) return
        if (!isTileOptions(jTile)) {
          throw new Error("Tile JSON must be an array of TileDropdownOption (value, title, …)")
        }
        if (!isKvData(jKv)) {
          throw new Error("KV JSON must be { items: { label, value }[] }")
        }

        setTile(jTile)
        setTileValue((jTile[0] as TileDropdownOption | undefined)?.value ?? "")
        setKv(jKv)
        setSt({ kind: "ok" })
        setFetched(new Date().toISOString())
      } catch (e) {
        if (cancelled) return
        const message = e instanceof Error ? e.message : String(e)
        setSt({ kind: "error", message })
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [tileUrl, kvUrl])

  if (st.kind === "loading") {
    return (
      <p className="forge-support" role="status" aria-live="polite">
        Loading JSON via GET…
      </p>
    )
  }

  if (st.kind === "error") {
    return (
      <div
        className="forge-callout border border-danger p-3 rounded"
        style={{ borderColor: "var(--bs-danger, #b91c1c)" }}
      >
        <p className="callout-label text-danger mb-1">Load failed</p>
        <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
          {st.message}
        </p>
        <p className="forge-support small mb-0 mt-2">Serve the <code>showcase/</code> tree over HTTP and run the React bundle build first.</p>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-4">
      {fetched ? (
        <p className="forge-support small mb-0" data-showcase-fetched={fetched}>
          Data loaded: <code>{tileUrl}</code> · <code>{kvUrl}</code>
        </p>
      ) : null}
      <section>
        <h2 className="ks-section-title" id="sec-tile">
          TileDropdownControl
        </h2>
        <p className="forge-support">Options from <code>GET {tileUrl}</code></p>
        {tile && tile.length > 0 ? (
          <TileDropdownControl
            value={tileValue}
            onChange={setTileValue}
            options={tile}
            label="Pick an option (from JSON)"
            panelMinWidth="min(100%, 28rem)"
            panelMaxHeight="min(70vh, 20rem)"
          />
        ) : (
          <p className="forge-support">No tile options in JSON array.</p>
        )}
      </section>
      <section>
        <h2 className="ks-section-title" id="sec-kv">
          ForgeKeyValueGrid
        </h2>
        <p className="forge-support">Rows from <code>GET {kvUrl}</code></p>
        {kv && kv.items.length > 0 ? (
          <ForgeKeyValueGrid
            items={kv.items.map((i) => ({
              label: i.label,
              value: i.value,
              title: i.title,
            }))}
            aria-label={kv["aria-label"] ?? "Example metadata (from JSON)"}
          />
        ) : null}
      </section>
    </div>
  )
}

const el = document.getElementById("ks-react-primitives-root")
if (el) {
  const root = createRoot(el)
  root.render(
    <StrictMode>
      <PrimitivesFromStaticFiles />
    </StrictMode>,
  )
}
