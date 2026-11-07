# Plan del equipo

> Roles sugeridos — cámbienlos si quieren. Cada uno trabaja en su branch `feat/<area>-<cosa>`
> y abre PRs chiquitos a `main`. Marquen `[x]` cuando terminen.

## Roles

| Persona | Rol | Dueño de |
|---|---|---|
| **Piero** | Backend + Swarms | `backend/`, `docs/AGENT_PIPELINE.md`, prompts, cache, deploy backend |
| **Diego** | Frontend | `frontend/`, UI de resultados, QR, deploy Vercel, monitor para el stand |
| **Robert** | Frontend + integración | timeline/comparador de rutas, animación del grafo de agentes, Gemini en un agente, deploy |
| **Adrian** | Datos MDC + pitch | `data/*.json` (programas, costos, transfer agreements) con `source_url`, `docs/DEMO.md`, slides, ensayar la exposición |

Regla: los LLMs (Claude, Codex, Gemini) escriben el código leyendo `AGENTS.md`. Los humanos
deciden, revisan y prueban. El que tenga límite de uso pasa su tarea a otro modelo, no se para.

## Fase 0 — Setup (todos, 30 min)
- [ ] Clonar repo, `cp .env.example .env`
- [ ] Conseguir API key en cloud.swarms.world/api-keys (una sola del equipo, compartida por DM, nunca en git)
- [ ] Leer `AGENTS.md` + `docs/PRODUCT.md`
- [ ] Confirmar roles

## Fase 1 — En paralelo, contra el contrato (hasta que haya algo funcionando end-to-end)
**Backend (Piero)**
- [ ] Scaffold FastAPI (`/health`, `/careers`, `/roadmap`) + config + CORS
- [ ] Modelo Pydantic `Roadmap` que espeja `shared/roadmap.schema.json`
- [ ] Cliente Swarms + builder del grafo (5 agentes, edges) + prompts
- [ ] Primer llamado real con 1 carrera → anotar forma real de `outputs` en AGENT_PIPELINE.md
- [ ] Validación + repair + fallback + cache en disco + `DEMO_MODE`

**Frontend (Diego + Robert)**
- [ ] `npx create-next-app@latest frontend --ts --tailwind --app --eslint` (dentro del repo)
- [ ] `lib/types.ts` desde el schema + `lib/mock.ts` leyendo `shared/fixtures/`
- [ ] Landing + buscador de carreras
- [ ] Form de preferencias (presupuesto, ritmo, full/part-time, créditos previos)
- [ ] Página de resultados: rutas lado a lado, timeline, totales, credenciales, puntos de entrada al trabajo
- [ ] Share link `/r/[id]` + QR
- [ ] Panel "agentes trabajando" (grafo animado de los 5 agentes)

**Datos (Adrian, con ayuda de quien termine primero)**
- [ ] `data/careers.json` — las 5 carreras showcase + keywords
- [ ] `data/mdc_programs.json` — programas reales de MDC relacionados (A.S., A.A., certificados, B.S.)
- [ ] `data/transfer_agreements.json` — 2+2 / articulación con FIU, FAU, UCF, etc.
- [ ] `data/costs.json` — costo por crédito MDC in-state/out-of-state, universidades destino, libros/fees

**Pitch (Adrian + todos)**
- [ ] Llenar tabla de requisitos MDC en PRODUCT.md mientras se construye
- [ ] `docs/DEMO.md` — guion de 3 min
- [ ] Slides (problema → demo → swarm → impacto → escala)

## Fase 2 — Integración
- [ ] Frontend apunta al backend real (`NEXT_PUBLIC_USE_MOCK=false`)
- [ ] Generar y cachear las 5 carreras showcase con el modelo bueno
- [ ] Deploy backend (Render/Railway) + frontend (Vercel)
- [ ] QR del deploy impreso / en el monitor

## Fase 3 — Pulido y stretch
- [ ] Mobile pass (los jueces escanean el QR con el celular)
- [ ] Gemini en al menos un agente
- [ ] Dominio GoDaddy
- [ ] Ensayar demo 3 veces, con y sin internet (DEMO_MODE)
