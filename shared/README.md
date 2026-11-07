# shared/

- `roadmap.schema.json` — **the contract**. Backend validates against it; frontend types mirror it.
- `fixtures/` — example roadmaps. Frontend uses them in mock mode; backend uses them as demo/fallback.
  Replace `*.example.json` with real generated roadmaps for the 5 showcase careers
  (`cybersecurity.json`, `mechanical-engineer.json`, `architect.json`, `chef.json`, `it-consultant.json`).
