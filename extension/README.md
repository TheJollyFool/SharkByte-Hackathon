# extension/ — Chrome extension (Manifest V3)

Shark 🦈 button on `*.mdc.edu`, the iframe panel (our Vercel app) and the in-page guide overlay.
Not scaffolded yet. Read [AGENTS.md](../AGENTS.md) (extension conventions + "Respect mdc.edu"),
[docs/CONTRACTS.md](../docs/CONTRACTS.md) section A (postMessage) and `/navigate`, and the layout in
[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

Load it: `chrome://extensions` → Developer mode → **Load unpacked** → this folder (or its `dist/`).
Set `PANEL_ORIGIN` / `API_URL` / `MOCK_NAVIGATE` in `config.ts`.
