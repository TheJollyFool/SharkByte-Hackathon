# Plan del equipo

> 4 roles, una persona cada uno. Cada uno trabaja en su branch `feat/<area>-<cosa>` y abre PRs chiquitos
> a `main`. Marquen `[x]` cuando terminen. Todos construyen contra los **mocks** de `shared/fixtures/`
> desde el minuto 1 — nadie espera a nadie. Los contratos están en [CONTRACTS.md](CONTRACTS.md).

## Roles

| Rol | Persona | Dueño de | Perfil ideal |
|---|---|---|---|
| **1. Extensión + guía en la página** | _TBD_ | `extension/`, `shared/guides/` | JavaScript, paciencia para probar en el navegador |
| **2. Panel app (frontend)** | _TBD_ | `frontend/` | UI/diseño, React/Next.js con Codex |
| **3. Backend + Swarms** | _TBD_ | `backend/`, `docs/AGENT_PIPELINE.md`, deploy backend | Python, APIs |
| **4. Datos MDC + cerebro de los agentes + pitch** | _TBD_ | `data/*.json`, prompts (contenido) en `backend/app/swarm/prompts.py` junto con Rol 3, `docs/DEMO.md`, slides, Devpost | Conoce MDC y financial aid, habla bien en público |

Regla: los LLMs (Claude, Codex, Gemini) escriben el código leyendo `AGENTS.md`. Los humanos deciden,
revisan y prueban. El que se quede sin tokens pasa su tarea a otro modelo, no se para.

## Horario (hacking termina dom 10:00 AM, Devpost 10–11 AM)

| Hasta | Meta |
|---|---|
| **Fase 0** (30 min) | Todos: clonar, leer `AGENTS.md` + `docs/PRODUCT.md`, confirmar roles, aprobar `REQUIREMENTS.md` |
| **Fase 1** (~2:00 AM) | Cada rol tiene su parte funcionando **con mocks** |
| **Fase 2** (~5:00 AM) | Integración: panel ↔ backend real, extensión ↔ panel, guía ↔ `/navigate` |
| **Fase 3** (~8:00 AM) | Cachear el guion de la demo, deploy, ensayar 3 veces. **Code freeze 8:00 AM** |
| 8:00–10:00 AM | Video, Devpost, slides, último ensayo |

## Fase 0 — Setup (todos)
- [ ] Clonar repo, `cp .env.example .env`
- [ ] API key en cloud.swarms.world/api-keys (una del equipo, por DM, nunca en git) → solo Rol 3 la necesita
- [ ] Leer `AGENTS.md`, `docs/PRODUCT.md`, `docs/CONTRACTS.md`
- [ ] Poner nombres en la tabla de roles
- [ ] Revisar `docs/REQUIREMENTS.md` y cambiar estado a **APPROVED v2**

## Fase 1 — En paralelo, contra los mocks

**Rol 1 — Extensión + guía**
- [ ] `extension/manifest.json` (MV3), content script en `*://*.mdc.edu/*`, service worker
- [ ] Botón tiburón 🦈 flotante abajo a la derecha (clases `shark-*`)
- [ ] Panel: iframe con `PANEL_ORIGIN` (localhost:3000 en dev), abrir/cerrar sin perder estado
- [ ] Puente `postMessage` (`shark:ready`, `shark:close`, `shark:start_guide`, `shark:open_url`, `shark:guide_finished`) con chequeo de `origin`
- [ ] Snapshot de la página: elementos visibles interactivos, máx 150, `data-shark-id`
- [ ] Overlay de guía: anillo de highlight + burbuja + botón "Stop guide"
- [ ] Estado de la guía en `chrome.storage.session` (sobrevive cambios de página)
- [ ] Modo mock (`MOCK_NAVIGATE=true`) con `shared/fixtures/navigate.example.json`
- [ ] 2–3 guías pregrabadas reales en `shared/guides/` (visitar mdc.edu y sacar selectores)

**Rol 2 — Panel app**
- [ ] Scaffold Next.js en `frontend/` (ver `frontend/README.md`)
- [ ] `lib/types.ts` (tipos de CONTRACTS.md + schema), `lib/api.ts` (mock/real), `lib/shark-bridge.ts`, `lib/i18n.ts` (EN/ES)
- [ ] Pantalla inicial: elegir modo (Group Chat / Mixture) + toggle de idioma
- [ ] "Nuevo grupo": tarjetas de asesores (`data/advisors.json`) para agregarlos como amigos
- [ ] Chat estilo WhatsApp: loop de turnos (un `POST /chat/reply` por asesor, en orden), typing indicator, `UsageBadge` (tokens + costo) bajo cada mensaje, total arriba
- [ ] Vista Mixture: respuesta única, "construida por: …", costo total, se puede responder
- [ ] Botón "Estoy listo para profundizar" → `POST /roadmap`
- [ ] Flowchart con React Flow: un carril por ruta, una caja por paso (color por `kind`), puntos de entrada al trabajo, warnings arriba, "estimado" donde aplique
- [ ] Clic en caja → `shark:start_guide`; botón secundario "Abrir página" → `shark:open_url`
- [ ] Descargar PDF del flowchart
- [ ] Header `frame-ancestors https://*.mdc.edu` en `next.config`

**Rol 3 — Backend + Swarms**
- [ ] Scaffold FastAPI: `/health`, `/advisors`, config, CORS (panel + `chrome-extension://*`)
- [ ] Modelos Pydantic: `Message`, `Usage`, `Roadmap` (espejo del schema), `NavStep`
- [ ] Cliente Swarms (`httpx`), primer llamado real a `agent/completions` → anotar respuesta en AGENT_PIPELINE.md
- [ ] `POST /chat/reply` (prompt del asesor + historial + datos MDC filtrados)
- [ ] `POST /mixture` (`swarm/completions`, `MixtureOfAgents`) → anotar cómo elige el agregador
- [ ] `POST /roadmap` (Roadmap Writer → validar → repair → fixture)
- [ ] `POST /navigate` (Navigator, validar `element_id`)
- [ ] Cache en disco + `DEMO_MODE` para todos los endpoints
- [ ] Tests con Swarms mockeado

**Rol 4 — Datos + agentes + pitch**
- [ ] `data/mdc_programs.json`: programas reales de MDC para las carreras del demo (mínimo cybersecurity bien completo) con `source_url`
- [ ] `data/costs.json`: costo por crédito MDC (verificar tarifa actual en mdc.edu/tuition), FIU/FAU/UCF
- [ ] `data/transfer_agreements.json`: FIU Connect4Success (+ aviso limited-access: Architecture, Nursing), FAU, UCF
- [ ] `data/financial_aid.json`: Pell, Bright Futures, FSAG, work-study, becas MDC
- [ ] Escribir los system prompts de los 6 asesores (personalidad, qué cubre cada uno, reglas de honestidad) → pasarlos a Rol 3
- [ ] Elegir la ruta exacta del demo (qué programa, qué caja se clickea) y pasarla a Rol 1 para la guía pregrabada
- [ ] `docs/DEMO.md` final, slides (problema → demo → swarm → impacto), video, Devpost
- [ ] Nombre del producto

## Fase 2 — Integración
- [ ] Panel apunta al backend real (`NEXT_PUBLIC_USE_MOCK=false`)
- [ ] Extensión carga el panel desplegado (Vercel) en mdc.edu
- [ ] Guía usa `/navigate` real; fallback a guía pregrabada funciona
- [ ] Deploy backend (Render/Railway) + panel (Vercel)

## Fase 3 — Pulido y demo
- [ ] Correr el guion del demo en vivo y cachearlo (`DEMO_MODE` lo sirve)
- [ ] Revisar selectores de guías pregrabadas en mdc.edu
- [ ] Probar en español
- [ ] Ensayar 3 veces, con y sin internet
- [ ] Monitor del stand listo con Chrome + extensión cargada
