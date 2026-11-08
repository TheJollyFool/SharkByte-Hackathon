# extension/ — Chrome extension (Manifest V3)

Shark 🦈 button on `*.mdc.edu`, the iframe panel (our Vercel app) and the in-page guide overlay.
Not scaffolded yet. Read [AGENTS.md](../AGENTS.md) (extension conventions + "Respect mdc.edu"),
[docs/CONTRACTS.md](../docs/CONTRACTS.md) section A (postMessage) and `/navigate`, and the layout in
[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

Load it: `chrome://extensions` → Developer mode → **Load unpacked** → this folder (or its `dist/`).
Set `PANEL_ORIGIN`, `NAVIGATE_URL`, and `MOCK_NAVIGATE` in `config.js`.
Set `MOCK_NAVIGATE` to `true` to test the recorded Cybersecurity Analyst guide
from Academic Programs. The default uses the live Navigator and tries the
recorded guide when the initial request fails or returns `open_url`.
