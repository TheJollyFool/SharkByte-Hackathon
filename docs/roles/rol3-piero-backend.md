# Rol 3 — Piero: Backend + Swarms API

## Tu misión
El backend FastAPI que habla con Swarms: un asesor por turno (`/chat/reply`), el swarm Mixture
(`/mixture`), el Roadmap Writer (`/roadmap`) y el Navigator (`/navigate`). Con cache y `DEMO_MODE` para
que el demo nunca dependa del internet. Eres el **camino crítico**: el resto puede avanzar con mocks, pero
el producto real depende de ti.

## Tus archivos
- Tuyos: `backend/` (todo), `docs/AGENT_PIPELINE.md`, `.env` (local, nunca en git)
- No tocas: `frontend/`, `extension/`. `data/` y `docs/agents/` son de Diego: los lees, él los llena.

## Lee primero
1. `AGENTS.md`
2. `docs/CONTRACTS.md` (sección B completa + "Shared types")
3. `docs/AGENT_PIPELINE.md` (todo)
4. `docs/ARCHITECTURE.md` → "Backend module layout", flujos
5. `shared/roadmap.schema.json`, `data/advisors.json`

## Tareas en orden (con hora meta) — code freeze 1:30 AM

| # | Tarea | Meta |
|---|---|---|
| 1 | API key (cloud.swarms.world/api-keys) en `.env`; `GET /v1/models/available` | 8:15 PM |
| 2 | Scaffold FastAPI: `main.py`, `config.py`, CORS (localhost:3000, Vercel, `chrome-extension://*`), `/health`, `/advisors` | 8:30 PM |
| 3 | Cliente Swarms + **primera llamada real** a `POST /v1/agent/completions` → pegar respuesta recortada en AGENT_PIPELINE.md y avisar al equipo | **8:45 PM** |
| 4 | Modelos Pydantic: `Usage`, `Message`, `Roadmap` (espejo del schema) | 9:15 PM |
| 5 | `POST /chat/reply`: prompt del asesor (de `docs/agents/`, Diego los entrega 9:30; antes placeholders) + historial + datos MDC → `Message` con `usage` | 10:00 PM |
| 6 | Cache en disco + `DEMO_MODE` para `/chat/reply` | 10:30 PM |
| 7 | **Deploy** (Render/Railway) con `/advisors` + `/chat/reply` → URL a Robert | **11:00 PM** |
| 8 | `POST /roadmap`: Roadmap Writer → validar → 1 repair → fixture `fallback`; primera caja = programa MDC de `data/` (Diego entrega datos 10:30) | **11:45 PM** |
| 9 | `POST /mixture` (`swarm/completions`, `MixtureOfAgents`) + cache — después de que `/roadmap` funcione | 12:30 AM |
| 10 | Correr el guion del demo en vivo para llenar el cache; probar `DEMO_MODE=true`; **pushear a `master`** | 1:30 AM |
| extra | Solo si sobra tiempo: `POST /navigate`, tests `pytest` con Swarms mockeado | — |

## Dependencias
- **Recibes de Diego:** prompts de los asesores (9:30 PM), datos del MDC del demo (10:30 PM). Antes, placeholders.
- **Recibes de Robert (12:15 AM):** URL de Vercel para CORS.
- **Entregas a todos (8:45 PM):** forma real de la respuesta de Swarms. **A Robert:** `/chat/reply` desplegado (11:00 PM), `/roadmap` (11:45 PM).

## Terminado cuando
Backend desplegado; los 5 endpoints cumplen CONTRACTS.md; cada respuesta trae `usage` y `source`;
el roadmap pasa la validación del schema y su primera caja es un programa MDC real; con `DEMO_MODE=true`
el guion del demo corre completo sin llamar a Swarms.

## Si vas atrasado (recorta en este orden)
1. `/navigate` y tests (ya son extra)
2. `/mixture`
3. Nunca recortes: `/chat/reply` con usage, `/roadmap` válido, `DEMO_MODE`

## Tips
- `max_tokens` bajos: chat ≈ 300, agregador ≈ 600, writer ≈ 4000, navigator ≈ 200.
- Inyecta solo los programas relevantes a la carrera (filtra por keywords) — tokens = créditos.
- La key **solo** en `.env` del backend. Nunca en git, nunca al frontend ni a la extensión.

---

## Prompt para tu agente (Codex / Claude) — copia y pega

```text
You are working in the SharkByte-Hackathon repo. I am Piero, owner of Role 3: the FastAPI backend that calls
the Swarms API.

First read, in this order: AGENTS.md, docs/CONTEXT.md, docs/roles/rol3-piero-backend.md, docs/CONTRACTS.md (section B and
"Shared types"), docs/AGENT_PIPELINE.md, docs/ARCHITECTURE.md ("Backend module layout" and flows),
shared/roadmap.schema.json, data/advisors.json, .env.example.

Then follow the task table in my role doc in order. Work only inside backend/ and docs/AGENT_PIPELINE.md.

Requirements:
- Python 3.11, FastAPI, Pydantic v2, httpx.AsyncClient, pydantic-settings reading .env. Layout from
  docs/ARCHITECTURE.md. ruff format + ruff check. Type hints everywhere.
- CORS for http://localhost:3000, the Vercel origin from CORS_ORIGINS, and chrome-extension://*.
- Endpoints exactly as docs/CONTRACTS.md section B: GET /health, GET /advisors, POST /chat/reply, POST /mixture,
  POST /roadmap, GET /roadmap/{id}, POST /navigate. Same error shape. If a cached/fixture answer exists, return
  200 with source "fallback" instead of an error.
- Swarms: POST /v1/agent/completions for chat replies, Roadmap Writer, Navigator and JSON repair;
  POST /v1/swarm/completions with swarm_type "MixtureOfAgents" for /mixture. Header x-api-key. Map Swarms
  usage (input_tokens, output_tokens, total_tokens, total_cost) to our Usage (cost_usd).
- System prompts: one constant per agent in backend/app/swarm/prompts.py. Load advisor prompts from
  docs/agents/<id>.md (section "System prompt") if present, else use short placeholders.
- Task strings follow the templates in docs/AGENT_PIPELINE.md. Inject only MDC programs relevant to the career.
- /roadmap: validate the Writer output with the Pydantic Roadmap model; one repair call; else the closest fixture
  from shared/fixtures with source "fallback". First step of every route must be an MDC program from data/.
- /navigate is OPTIONAL (only if time remains before the 1:30 AM freeze): element_id must exist in page.elements;
  retry once; else action open_url with goal.url.
- Disk cache keyed by sha256(endpoint + normalized request). DEMO_MODE=true never calls Swarms.
- Order of work: /chat/reply deployed first, then /roadmap, then /mixture. Tests (pytest, Swarms mocked) only if time.

Start with tasks 2-3: scaffold + Swarms client, then make ONE real call to /v1/agent/completions with a cheap model
and paste the trimmed real response into docs/AGENT_PIPELINE.md "Observed responses". Use branch
feat/backend-core with small commits. Ask me before changing any contract in docs/CONTRACTS.md.
```
