# forge-fleet-app-ui.js

`ForgeFleetAppUi.mount(root, options)` renders FAEP v1 `ui/app.ui.json` widgets inside Fleet `/admin/`.

## Options

| Key | Meaning |
|-----|---------|
| `appId` | Installed app id |
| `uiUrl` | `GET /v1/fleet-apps/{id}/ui` |
| `dataBase` | Prefix for `GET .../data/{binding}` |
| `actionsBase` | Prefix for `POST .../actions/{action}` |
| `token` | Fleet bearer token (optional on loopback) |

## Widget kinds (v1)

`section`, `heading`, `prose`, `kpi_row`, `data_table`, `action_button`, `alert`, `diagnostic_panel`, `docs_link`

KPI tiles load `GET .../data/{binding}` and read `value` or `kpi` object keys.

See `forge-fleet/docs/schemas/fleet-app-ui-v1.schema.json`.
