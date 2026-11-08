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

## Tareas en orden (con hora meta)

| # | Tarea | Meta |
|---|---|---|
| 1 | Scaffold Next.js en `frontend/` (ver `frontend/README.md`), Tailwind, TS strict | 8:30 PM |
| 2 | `lib/types.ts` (tipos de CONTRACTS.md + Roadmap del schema), `lib/api.ts` (mock con `NEXT_PUBLIC_USE_MOCK`, real con `NEXT_PUBLIC_API_URL`), `lib/shark-bridge.ts` (postMessage), `lib/i18n.ts` (EN/ES). **Pushear ya** para que Adrian lo cargue | 9:00 PM |
| 3 | Pantalla inicial: elegir modo (Group Chat / Mixture) + toggle EN/ES; diseño para ~400 px de ancho | 9:30 PM |
| 4 | "Nuevo grupo": tarjetas de asesores de `data/advisors.json` (emoji, nombre, rol, sección MDC), agregar/quitar como amigos | 10:15 PM |
| 5 | Chat estilo WhatsApp: el estudiante escribe → loop de turnos (un `POST /chat/reply` por asesor en `order`, agregando cada respuesta al historial antes de la siguiente), typing indicator con el nombre del asesor, burbuja con color del asesor, `UsageBadge` chiquito (tokens · $costo), total en el header | 11:00 PM |
| 6 | Vista Mixture: respuesta única del agregador, "construida por: …", costo total, el estudiante puede responder | 12:00 AM |
| 7 | Botón "Estoy listo para profundizar" (ambos modos) → `POST /roadmap` con loader | 12:15 AM |
| 8 | **Deploy en Vercel** (aunque sea con mocks) y pasar URL a Adrian y Piero. Header `Content-Security-Policy: frame-ancestors https://*.mdc.edu http://localhost:*` en `next.config` | 1:00 AM |
| 9 | Flowchart con React Flow (`@xyflow/react`): carril por ruta (corta/media/larga), caja por paso con color según `kind`, duración, costo, badge "estimado", puntos de entrada al trabajo entre cajas, warnings arriba, tarjeta de la carrera | 1:30 AM |
| 10 | Clic en caja → `shark:start_guide` con `{label, kind, url: source_url, step_id}`; botón secundario "Abrir página" → `shark:open_url`. Mostrar ✓ al recibir `shark:guide_finished` | 2:00 AM |
| 11 | Integración con el backend real (`NEXT_PUBLIC_USE_MOCK=false`) | 2:30 AM |
| 12 | Descargar PDF del flowchart (html-to-image + jsPDF, o print stylesheet) | 3:00 AM |
| 13 | Pulido: estados de error, fuente `source: fallback` invisible para el usuario, español completo | 5:00 AM |

## Dependencias
- **No esperas a nadie para empezar:** todo con mocks (`shared/fixtures/`, `data/advisors.json`).
- **Entregas a Adrian (9:00 PM):** `localhost:3000` corriendo + `lib/shark-bridge.ts`. **(1:00 AM):** URL de Vercel.
- **Entregas a Piero (1:00 AM):** URL de Vercel para CORS.
- **Recibes de Piero (~1:00 AM):** URL del backend desplegado.
- **Recibes de Adrian:** confirmación de que `shark:start_guide` abre la guía.

## Terminado cuando
Standalone en el navegador y dentro del iframe en mdc.edu: modo → grupo → chat por turnos con tokens/costo →
"listo" → flowchart con primera caja = programa MDC → PDF descarga → clic en caja manda `shark:start_guide`.
Mixture también llega al flowchart. Funciona en mock y con backend real.

## Si vas atrasado (recorta en este orden)
1. Español (deja solo inglés)
2. PDF → usa `window.print()` con CSS de impresión
3. Mixture con UI mínima
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

First read, in this order: AGENTS.md, docs/roles/rol2-robert-panel.md, docs/PRODUCT.md, docs/CONTRACTS.md
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
- lib/i18n.ts with EN/ES strings and a toggle; send `language` in every request.
- Screens: mode picker -> "New group" advisor picker -> group chat (frontend runs the turn loop: one POST /chat/reply
  per selected advisor in `order`, appending each reply before the next call; typing indicator; usage badge with
  tokens and cost under every advisor message; running total in the header) -> mixture view -> "I'm ready to go
  deeper" -> roadmap flowchart.
- Flowchart with @xyflow/react: one lane per route, one node per step colored by `kind`, show duration, cost and an
  "estimate" badge, workforce entry points between nodes, warnings banner, career card. Clicking a node sends
  shark:start_guide; a secondary "Open page" sends shark:open_url.
- PDF download of the flowchart (html-to-image + jsPDF).
- next.config headers: Content-Security-Policy frame-ancestors https://*.mdc.edu http://localhost:*.
- Never put any API key in frontend/.

Start with tasks 1-2 (scaffold + lib/types.ts, lib/api.ts, lib/shark-bridge.ts, lib/i18n.ts), then task 3-5.
Use branch feat/panel-chat with small commits. Ask me before changing any contract in docs/CONTRACTS.md.
```
