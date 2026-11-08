# shared/

Contracts and fixtures used by more than one part (panel app, backend, extension). See [docs/CONTRACTS.md](../docs/CONTRACTS.md).

| Path | What |
|---|---|
| `roadmap.schema.json` | **The roadmap contract** (flowchart data). Backend validates against it; frontend types mirror it. |
| `fixtures/*.example.json` | Mock responses: roadmap, chat reply, mixture, navigate. Frontend mock mode + backend `DEMO_MODE` fallback. |
| `guides/*.json` | Pre-recorded in-page guides (fallback for the Navigator agent). |

Replace `*.example.json` with real cached responses for the demo script (keep the example files as templates).
