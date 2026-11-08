# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Gemini CLI, Cursor) working in this repo.
Read this file fully before writing code. Humans: read it too.

## What we are building

**Shark Advisor** (working name, final name TBD) — for the SharkByte Hackathon (MDC + Swarms challenges).
A Chrome extension puts a shark 🦈 button on mdc.edu. The student opens it and either:
- **Group Chat** — picks AI advisors like adding friends to a WhatsApp group; each advisor owns one MDC
  challenge section and they answer in turns (one message each, then wait), showing tokens + cost; or
- **Mixture of Agents** — all advisors merged into one best answer.

When ready, the student gets a **flowchart roadmap** (every route starts at a real MDC program,
downloadable as PDF). Clicking a box closes the panel and an **in-page guide** points at what to click
or type on the real mdc.edu page until the student reaches that program/course/certificate.

Full spec: [docs/PRODUCT.md](docs/PRODUCT.md).

## Context: event, team, deadline

- **Event:** SharkByte 2026, Miami Dade College's hackathon (Nov 6–8, 2026). We build for two challenges:
  **MDC North Campus "Smart Career and Education Pathway Navigator"** and **Swarms API**
  ([docs/TRACKS.md](docs/TRACKS.md)). The MDC requirements are in [docs/PRODUCT.md](docs/PRODUCT.md);
  the Swarms API usage (from the official slides) is in [docs/AGENT_PIPELINE.md](docs/AGENT_PIPELINE.md).
- **Team (4 people, 1 role each):** Adrian = Role 1 extension, Robert = Role 2 panel app,
  Piero = Role 3 backend + Swarms, Diego = Role 4 data, agent prompts, pitch.
- **Deadline:** **code freeze Sun Nov 8, 1:30 AM** (everything pushed to `master`). Sunday morning is only
  rehearsal, slides, video and Devpost (submission 10–11 AM). Prefer the simplest thing that works for the demo.
- **Your human will tell you their role.** Read their brief in [docs/roles/](docs/roles/) right after this file
  and work only in the folders that brief owns. If they don't say, ask which role they have.

## Read order (source of truth)

| Doc | What | Who edits |
|---|---|---|
| [docs/CONTEXT.md](docs/CONTEXT.md) | **Background: event, challenge briefs, Swarms slides, research, team, decisions** | Team |
| [docs/roles/](docs/roles/) | **One brief per person: tasks in order, target times, handoffs, cut list** | Team |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | **Scope: what we build and what we DON'T** | **Humans only — read-only for agents** |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Product spec, user flow, advisors, MDC judging checklist | Team |
| [docs/CONTRACTS.md](docs/CONTRACTS.md) | HTTP endpoints, shared types, extension ↔ panel messages | Owners of both sides together |
| [shared/roadmap.schema.json](shared/roadmap.schema.json) | Roadmap (flowchart) JSON shape | Backend + panel together |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Diagrams, folder layouts, deploy, risks | Anyone, keep in sync |
| [docs/AGENT_PIPELINE.md](docs/AGENT_PIPELINE.md) | Swarms calls, agents, prompts, models | Backend |
| [docs/TEAM_PLAN.md](docs/TEAM_PLAN.md) | 4 roles, task checklist, timeline | Team |
| [docs/TRACKS.md](docs/TRACKS.md) | The two challenges and what judges must see | Team |
| [docs/DEMO.md](docs/DEMO.md) | Demo script | Pitch owner |

**Scope rule:** never build anything not in REQUIREMENTS.md, and nothing under its "Out of scope".
If a task seems to need it, stop and ask a human instead of inventing features.

**Diagrams:** Mermaid code blocks in `docs/`. Change architecture/flows → update the diagram in the same PR.

## Architecture (short version)

```
extension/  Chrome MV3: shark button + iframe panel + in-page guide overlay   → load unpacked
frontend/   Next.js (App Router) + TS + Tailwind: the panel app (chat, mixture, flowchart, PDF) → Vercel
backend/    Python 3.11 + FastAPI + httpx + Pydantic v2: calls Swarms           → Render/Railway
data/       Curated MDC data + advisor list (JSON, hand-checked, source_url on every entry)
shared/     Roadmap schema, mock fixtures, pre-recorded guides
docs/       Product, requirements, contracts, architecture, agents, team plan, demo
```

## Golden rules

1. **Contracts are law.** [docs/CONTRACTS.md](docs/CONTRACTS.md) + `shared/roadmap.schema.json`.
   Build against `shared/fixtures/` (mock mode) so nobody waits for anybody. Changing a contract =
   tell the team + update fixtures + both sides in the same PR.
2. **Every route starts at MDC.** The first step of every route is a real MDC program from `data/`.
   Agents get the real list injected and may only pick from it. Never invent programs, ids or agreements.
3. **Honest data.** Numbers not from `data/` are `"estimate": true` and the UI says "estimate". Missing
   data is said, not invented. Limited-access majors get a warning.
4. **Never block the demo on the LLM.** `DEMO_MODE` + disk cache + fixtures for every endpoint;
   pre-recorded guides for the in-page guide.
5. **No secrets outside the backend.** Keys only in `.env` (gitignored). Never in `frontend/`,
   `extension/` or git. Only the backend calls Swarms.
6. **Respect mdc.edu.** The extension only overlays (button, panel, highlight, bubble). It never copies
   MDC's site, changes its content, or clicks/submits for the student. Prefix all injected CSS classes and
   ids with `shark-` so they don't clash with MDC's styles.
7. **Small PRs, short-lived branches.** `feat/<area>-<thing>` (`feat/ext-guide-overlay`,
   `feat/panel-chat`, `feat/backend-mixture`). Rebase on `master` often. Never force-push `master`.
8. **Cost awareness.** Cheap models while developing, low `max_tokens`, cache by request hash.

## Conventions

### Extension (`extension/`)
- Manifest V3. Content script on `*://*.mdc.edu/*`. Service worker makes backend calls.
- Plain TypeScript (or JS) — no React needed. One floating button, one iframe, one overlay layer.
- `config.ts`: `PANEL_ORIGIN`, `API_URL`, `MOCK_NAVIGATE`. Check `event.origin` on every message.
- Guide state in `chrome.storage.session` so it survives page loads.

### Panel app (`frontend/`)
- Next.js App Router, TypeScript strict, Tailwind. Designed for a ~400 px wide panel.
- `lib/types.ts` mirrors CONTRACTS.md types + the roadmap schema. `lib/api.ts` honors
  `NEXT_PUBLIC_USE_MOCK`. `lib/shark-bridge.ts` wraps postMessage. `lib/i18n.ts` holds EN/ES UI strings.
- Flowchart: React Flow (`@xyflow/react`). PDF: html-to-image + jsPDF (or a print stylesheet).
- Must be frameable by mdc.edu (`frame-ancestors https://*.mdc.edu` in `next.config` headers).

### Backend (`backend/`)
- Python 3.11, FastAPI, Pydantic v2, `httpx.AsyncClient`. Layout in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Config via `pydantic-settings` reading `.env`. `ruff format` + `ruff check`. Type hints everywhere.
- CORS: panel origin + `chrome-extension://*`.
- Tests: `pytest`, Swarms mocked — tests never spend credits.

### Data (`data/`)
- Hand-curated from mdc.edu and official aid pages. Every entry has `source_url`. Guesses get `"estimate": true`.

## How to run (once scaffolded)

```bash
cp .env.example .env            # fill SWARMS_API_KEY (backend only)
# backend
cd backend && python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
# panel
cd frontend && npm install && npm run dev   # http://localhost:3000
# extension
# chrome://extensions → Developer mode → Load unpacked → extension/  (set PANEL_ORIGIN=http://localhost:3000)
```

## When you (the agent) finish a task

- Run lint + tests for the part you touched.
- Update the relevant doc in `docs/` if you changed behavior, endpoints, messages or the schema.
- Check off the task in [docs/TEAM_PLAN.md](docs/TEAM_PLAN.md).
- Small commits with clear messages (`feat(ext): ...`, `feat(panel): ...`, `fix(backend): ...`).
