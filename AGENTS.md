# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Gemini CLI, Cursor) working in this repo.
Read this file fully before writing code. Humans: read it too.

## What we are building

**MDC Pathways** (working name) — a career roadmap platform for the SharkByte Hackathon.
A student picks a career (e.g. architect, mechanical engineer, chef, cybersecurity specialist,
IT consultant) and gets **several pathways that all start at Miami Dade College (MDC)**:
short routes (certificates, A.S.) and long routes (A.A. → transfer → bachelor's → master's),
each with **estimated time and cost**, certifications, and points where the student can
already enter the workforce.

Target prizes: **MDC Challenge**, **Swarms Challenge**, overall prize. Stretch: Gemini, GoDaddy domain.

## Read order (source of truth)

| Doc | What | Who edits |
|---|---|---|
| [docs/TRACKS.md](docs/TRACKS.md) | Which prizes we target and why | Team |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | **Scope: what we build and what we DON'T** | **Humans only — read-only for agents** |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Product spec + MDC judging checklist | Team |
| [docs/CONTRACTS.md](docs/CONTRACTS.md) | API endpoints, request/response, errors | Backend + frontend together |
| [shared/roadmap.schema.json](shared/roadmap.schema.json) | Roadmap JSON shape | Backend + frontend together |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Diagrams (Mermaid), modules, deploy | Anyone, keep in sync |
| [docs/AGENT_PIPELINE.md](docs/AGENT_PIPELINE.md) | Swarms graph, prompts, models | Backend |
| [docs/TEAM_PLAN.md](docs/TEAM_PLAN.md) | Who does what, task checklist | Team |

**Scope rule:** never build anything not in REQUIREMENTS.md or listed under its "Out of scope".
If a task seems to need it, stop and ask a human instead of inventing features.

**Diagrams:** use Mermaid code blocks in `docs/`. When you change architecture, flow or the
agent graph, update the matching Mermaid diagram in the same PR.

## Architecture (short version)

```
frontend/  Next.js (App Router) + TypeScript + Tailwind   → deploy on Vercel
backend/   Python 3.11 + FastAPI + httpx + Pydantic v2     → deploy on Render/Railway
data/      Curated MDC programs, costs, transfer agreements (JSON, hand-checked)
shared/    The JSON contract between backend and frontend + example fixtures
docs/      Product, architecture, agent pipeline, team plan, demo script
```

The backend calls the **Swarms API graph workflow** (`POST https://api.swarms.world/v1/graph-workflow/completions`).
Five agents:

```
Career Researcher ─┐
MDC Program Finder ─┼─► Pathway Planner ─► Roadmap Writer
Cost & Time Analyst┘
```

- The 3 entry agents run **in parallel** (same level in the graph).
- `Pathway Planner` merges their outputs into 2–4 routes.
- `Roadmap Writer` emits the final JSON that matches [shared/roadmap.schema.json](shared/roadmap.schema.json).

Details, prompts and the request body: [docs/AGENT_PIPELINE.md](docs/AGENT_PIPELINE.md).
Architecture and data flow: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Golden rules

1. **The contract is law.** `shared/roadmap.schema.json` is the single source of truth for the
   roadmap shape. Backend must validate the Writer output against it (Pydantic model mirrors it).
   Frontend builds against `shared/fixtures/*.json`. Changing the schema = tell the team + update
   fixtures + both sides in the same PR.
2. **Every pathway starts at MDC.** The first step of every route is an MDC program from `data/`.
   Never let an agent invent an MDC program — the Program Finder gets the real list injected
   into its prompt and must only pick from it.
3. **Never block the demo on the LLM.** The backend must have a `DEMO_MODE` / cache fallback that
   returns a pre-generated roadmap from `shared/fixtures/` if Swarms fails or is slow. The live
   demo should prefer cached results for the 5 showcase careers.
4. **No secrets in git.** Keys only in `.env` (gitignored). Copy `.env.example`.
5. **Small PRs, short-lived branches.** `feat/<area>-<thing>`, e.g. `feat/backend-swarm-client`.
   Rebase on `main` often. Never force-push `main`.
6. **Cost awareness.** We have limited Swarms credits. Use cheap models while developing,
   set `max_tokens`, cache responses on disk by `(career, preferences)` hash.

## Conventions

### Backend (Python)
- Python 3.11, FastAPI, Pydantic v2, `httpx.AsyncClient` for Swarms calls.
- Layout: `backend/app/{main.py, config.py, api/, swarm/, models/, services/, data_loader.py}`.
- Format/lint: `ruff format` + `ruff check`. Type hints everywhere.
- Config via `pydantic-settings` reading `.env`. Never read `os.environ` ad hoc.
- Endpoints (planned):
  - `GET  /health`
  - `GET  /careers` → list of supported careers (from `data/careers.json`)
  - `POST /roadmap` → body `{career, preferences}` → `Roadmap` (schema in `shared/`)
  - `GET  /roadmap/{id}` → cached roadmap (for shareable links / QR)
- Tests: `pytest`. Mock the Swarms API with fixtures — tests must not spend credits.

### Frontend (TypeScript)
- Next.js App Router, TypeScript strict, Tailwind, shadcn/ui if needed.
- API base URL from `NEXT_PUBLIC_API_URL`. Add a `USE_MOCK` flag that reads fixtures so UI
  work never waits for the backend.
- Types for the roadmap generated from / hand-mirrored to `shared/roadmap.schema.json`
  in `frontend/lib/types.ts`.
- Key screens: Landing → Career picker (search + cards) → Preferences (budget, time, part-time?)
  → Results (route comparison + timeline per route) → Share (link + QR code).
- Mobile-first: judges will scan a QR code and open it on their phone.

### Data
- `data/*.json` is hand-curated from MDC's public catalog. Every entry includes a `source_url`.
- If a number is an estimate, mark `"estimate": true`. Show estimates as estimates in the UI.

## How to run (once scaffolded)

```bash
cp .env.example .env            # fill SWARMS_API_KEY
# backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
# frontend
cd frontend && npm install && npm run dev   # http://localhost:3000
```

## When you (the agent) finish a task

- Run lint + tests for the side you touched.
- Update the relevant doc in `docs/` if you changed behavior, endpoints, or the schema.
- Check off the task in [docs/TEAM_PLAN.md](docs/TEAM_PLAN.md).
- Keep commits small with clear messages (`feat(backend): ...`, `fix(frontend): ...`).
