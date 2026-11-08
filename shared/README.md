# shared/

Contracts and fixtures used by more than one part (panel app, backend, extension). Pre-recorded in-page guides
live in `extension/guides/` (Chrome can only load files inside `extension/`). See [docs/CONTRACTS.md](../docs/CONTRACTS.md).

| Path | What |
|---|---|
| `roadmap.schema.json` | **The roadmap contract** (flowchart data). Backend validates against it; frontend types mirror it. |
| `fixtures/*.example.json` | Mock responses: roadmap, chat reply, mixture, navigate. Frontend mock mode + backend `DEMO_MODE` fallback. |

Replace `*.example.json` with real cached responses for the demo script (keep the example files as templates).
