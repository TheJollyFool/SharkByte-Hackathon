# Rol 2 — Robert: Panel app (frontend)

## Tu misión
Todo lo que el estudiante ve dentro del panel: elegir modo, crear el grupo de asesores, el chat estilo
WhatsApp con **tokens + costo bajo cada mensaje**, la vista Mixture, el **flowchart** clickeable y la
descarga en **PDF**. Eres la cara del producto.

## Tus archivos
- Tuyos: `frontend/` (todo)
- No tocas: `extension/`, `backend/`, `data/`. Lees `data/advisors.json` y `shared/` pero no los cambias sin avisar.

## Lee primero
1. `AGENTS.md` (convenciones del panel)
2. `docs/PRODUCT.md` (flujo completo, secciones 2–4)
3. `docs/CONTRACTS.md` → "Shared types", endpoints, sección A (postMessage), "Frontend mock mode"
4. `shared/roadmap.schema.json` y `shared/fixtures/*`
5. `docs/ARCHITECTURE.md` → "Frontend layout"

## Tareas en orden (con hora meta) — code freeze 1:30 AM

| # | Tarea | Meta |
|---|---|---|
| 1 | Scaffold Next.js en `frontend/` (ver `frontend/README.md`), Tailwind, TS strict | 8:20 PM |
| 2 | `lib/types.ts` (tipos de CONTRACTS.md + Roadmap), `lib/api.ts` (mock con `NEXT_PUBLIC_USE_MOCK`, real con `NEXT_PUBLIC_API_URL`), `lib/shark-bridge.ts`. **Pushear** para que Adrian lo cargue | **8:45 PM** |
| 3 | Pantalla inicial: elegir modo (Group Chat / Mixture), diseño para ~400 px | 9:00 PM |
| 4 | "Nuevo grupo": tarjetas de asesores (`data/advisors.json`), agregar/quitar como amigos | 9:30 PM |
| 5 | Chat estilo WhatsApp: loop de turnos (un `POST /chat/reply` por asesor en `order`, agregando cada respuesta antes de la siguiente), typing indicator, burbuja con color del asesor, `UsageBadge` (tokens · $costo), total en el header | 10:30 PM |
| 6 | Flowchart con React Flow (`@xyflow/react`) usando el fixture: carril por ruta, caja por paso coloreada por `kind`, duración, costo, badge "estimado", puntos de entrada al trabajo, warnings, tarjeta de carrera | 11:00 PM |
| 7 | Conectar el chat al backend real de Piero (URL a las 11:00) | **11:15 PM** |
| 8 | Botón "Estoy listo para profundizar" → `POST /roadmap` real → flowchart. Clic en caja → `shark:start_guide`; botón "Abrir página" → `shark:open_url` | 12:00 AM |
| 9 | **Deploy en Vercel** + header `frame-ancestors https://*.mdc.edu http://localhost:*`; URL a Adrian y Piero | **12:15 AM** |
| 10 | PDF: botón que llama `window.print()` con CSS de impresión que muestra solo el flowchart | 12:30 AM |
| 11 | Vista Mixture (respuesta única, "construida por", costo total) — solo si el chat ya funciona | 12:45 AM |
| 12 | Demo completo con el equipo; arreglar solo lo que lo rompa; **pushear a `master`** | 1:30 AM |
| extra | Solo si sobra tiempo: toggle EN/ES (`lib/i18n.ts`) y mandar `language` | — |

## Dependencias
- **No esperas a nadie para empezar:** todo con mocks (`shared/fixtures/`, `data/advisors.json`).
- **Entregas a Adrian (8:45 PM):** `localhost:3000` + `lib/shark-bridge.ts`. **(12:15 AM):** URL de Vercel.
- **Recibes de Piero:** backend con `/chat/reply` (11:00 PM) y `/roadmap` (11:45 PM).

## Terminado cuando
Standalone en el navegador y dentro del iframe en mdc.edu: modo → grupo → chat por turnos con tokens/costo →
"listo" → flowchart con primera caja = programa MDC → PDF descarga → clic en caja manda `shark:start_guide`.
Mixture también llega al flowchart. Funciona en mock y con backend real.

## Si vas atrasado (recorta en este orden)
1. Español (ya es extra)
2. Vista Mixture
3. Diseño fino del flowchart (cajas simples están bien)
4. Nunca recortes: chat por turnos con tokens/costo + flowchart clickeable

## Tips
- El panel mide ~400 px: piensa como celular.
- El frontend guarda la conversación (`Message[]`) en estado; el backend no guarda nada.
- Nunca pongas la API key de Swarms en `frontend/`.

---

## Prompt para tu agente (Codex / Claude) — copia y pega

```text
You are working in the SharkByte-Hackathon repo. I am Robert, owner of Role 2: the panel app in frontend/
(Next.js App Router + TypeScript strict + Tailwind). It runs inside a ~400px iframe injected by our Chrome
extension on mdc.edu, and also standalone at localhost:3000.

First read, in this order: AGENTS.md, docs/CONTEXT.md, docs/roles/rol2-robert-panel.md, docs/PRODUCT.md, docs/CONTRACTS.md
(all of it), shared/roadmap.schema.json, shared/fixtures/*, data/advisors.json, docs/ARCHITECTURE.md
("Frontend layout").

Then follow the task table in my role doc in order. Work only inside frontend/.

Requirements:
- lib/types.ts mirrors the TypeScript types in docs/CONTRACTS.md and the Roadmap in shared/roadmap.schema.json exactly.
- lib/api.ts: getAdvisors(), chatReply(req), mixture(req), createRoadmap(req), getRoadmap(id). When
  NEXT_PUBLIC_USE_MOCK=true, return data/advisors.json and shared/fixtures/* (vary the mock chat reply per advisor_id
  so the chat looks real); otherwise call NEXT_PUBLIC_API_URL. If Next.js refuses imports from outside frontend/,
  add a small "predev"/"prebuild" script that copies data/advisors.json and shared/fixtures/ into frontend/mock/.
- lib/shark-bridge.ts: send/receive the postMessage messages from CONTRACTS.md section A (source: "shark"),
  checking event.origin; no-op safely when not inside an iframe.
- English UI for now; send `language: "en"` in every request. (Spanish toggle is optional, only if time remains.)
- Screens: mode picker -> "New group" advisor picker -> group chat (frontend runs the turn loop: one POST /chat/reply
  per selected advisor in `order`, appending each reply before the next call; typing indicator; usage badge with
  tokens and cost under every advisor message; running total in the header) -> mixture view -> "I'm ready to go
  deeper" -> roadmap flowchart.
- Flowchart with @xyflow/react: one lane per route, one node per step colored by `kind`, show duration, cost and an
  "estimate" badge, workforce entry points between nodes, warnings banner, career card. Clicking a node sends
  shark:start_guide; a secondary "Open page" sends shark:open_url.
- PDF: a button that calls window.print() with a print stylesheet showing only the flowchart.
- next.config headers: Content-Security-Policy frame-ancestors https://*.mdc.edu http://localhost:*.
- Never put any API key in frontend/.

Code freeze is 1:30 AM: keep it simple. Start with tasks 1-2 (scaffold + lib/types.ts, lib/api.ts, lib/shark-bridge.ts)
and push them, then tasks 3-6.
Use branch feat/panel-chat with small commits. Ask me before changing any contract in docs/CONTRACTS.md.
```
