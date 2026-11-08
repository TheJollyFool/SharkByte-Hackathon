# Rol 1 — Adrian: Extensión de Chrome + guía en la página

## Tu misión
Que el tiburón aparezca en mdc.edu, abra el panel, y que al hacer clic en una caja del flowchart el
estudiante sea **guiado paso a paso sobre la página real de mdc.edu** (highlight + burbuja) hasta el
programa/curso/certificado. Este es el momento "wow" del demo.

## Tus archivos
- Tuyos: `extension/` (todo, incluidas las guías grabadas en `extension/guides/`)
- No tocas: `frontend/`, `backend/`, `data/`. Si necesitas un cambio en un contrato, avisa a Robert (panel) o Piero (backend).

## Lee primero
1. `AGENTS.md` (regla 6 "Respect mdc.edu")
2. `docs/PRODUCT.md` secciones 1 y 5
3. `docs/CONTRACTS.md` → sección **A** (postMessage) y `POST /navigate`
4. `docs/ARCHITECTURE.md` → "In-page guide" y "Extension layout"

## Tareas en orden (con hora meta) — code freeze 1:30 AM

| # | Tarea | Meta |
|---|---|---|
| 1 | `extension/manifest.json` MV3: content script en `*://*.mdc.edu/*`, service worker, permiso `storage`; `config.ts` con `PANEL_ORIGIN`, `API_URL`, `MOCK_NAVIGATE` | 8:30 PM |
| 2 | Botón tiburón flotante abajo a la derecha (Shadow DOM, clases `shark-*`, `z-index` alto) | 8:40 PM |
| 3 | Panel: iframe (~400 px, lado derecho, alto completo) con `PANEL_ORIGIN`; abrir/cerrar sin destruir el iframe. Prueba con `https://example.com` hasta que Robert tenga `localhost:3000` (8:45) | 9:00 PM |
| 4 | Puente postMessage: recibir `shark:ready`, `shark:close`, `shark:start_guide`, `shark:open_url`; enviar `shark:guide_finished`. Verificar `event.origin` | 9:30 PM |
| 5 | Overlay de guía: anillo de highlight sobre un elemento (sigue scroll/resize), burbuja con texto, botón "Stop guide", scroll automático | 10:15 PM |
| 6 | Estado de la guía en `chrome.storage.session` (sobrevive cambios de página): en cada carga, si hay guía activa, mostrar el paso que toca | 10:45 PM |
| 7 | **Guía grabada** de la ruta de Diego (llega 8:30): visitar mdc.edu, sacar selectores, llenar `extension/guides/<id>.json` (con `match.goal_urls` = URL del programa); el runner elige el paso por `url_pattern` y resalta `selector` | 11:15 PM |
| 8 | `shark:start_guide` desde el panel → cierra panel → arranca la guía cuyo `match.goal_urls` coincide con `goal.url`; si no hay guía → `open_url` | 11:30 PM |
| 9 | Cargar el panel desplegado de Vercel (URL de Robert 12:15) en vez de localhost | 12:30 AM |
| 10 | Demo completo en mdc.edu con todo el equipo; arreglar solo lo que lo rompa; **pushear a `master`** | 1:30 AM |
| extra | Solo si sobra tiempo: snapshot de la página (máx 150 elementos, `data-shark-id`) + llamar `POST /navigate` desde el service worker, con la guía grabada como respaldo | — |

## Dependencias
- **Recibes de Diego (8:30 PM):** la ruta exacta del demo (programa, URL final, clics desde la home).
- **Recibes de Robert (8:45 PM):** panel en `localhost:3000` + `lib/shark-bridge.ts`. **(12:15 AM):** URL de Vercel.
- **Entregas a todos (12:30 AM):** el demo completo funcionando dentro de mdc.edu.

## Terminado cuando
En `www.mdc.edu` con la extensión cargada: tiburón → panel abre/cierra → desde el panel, clic en una caja →
panel se cierra → highlight + burbuja guían clic por clic hasta la página del programa → al llegar,
`shark:guide_finished` con `done`. Funciona con `/navigate` y, si se cae, con la guía pregrabada.

## Si vas atrasado (recorta en este orden)
1. La guía en vivo con `/navigate` (ya es extra)
2. Scroll/resize perfecto del highlight
3. Nunca recortes: tiburón + panel + la guía grabada de la ruta del demo

## Tips
- Carga la extensión: `chrome://extensions` → Developer mode → Load unpacked → `extension/`. Después de cada cambio, botón ↻ y recarga mdc.edu.
- Todo el CSS inyectado con prefijo `shark-` y preferiblemente dentro de un Shadow DOM para no romper estilos de MDC.
- La extensión **nunca** hace clic ni escribe por el estudiante: solo señala.

---

## Prompt para tu agente (Codex / Claude) — copia y pega

```text
You are working in the SharkByte-Hackathon repo. I am Adrian, owner of Role 1: the Chrome extension and the in-page guide.

First read, in this order: AGENTS.md, docs/CONTEXT.md, docs/roles/rol1-adrian-extension.md, docs/PRODUCT.md (sections 1 and 5),
docs/CONTRACTS.md (section A "Extension <-> Panel messages" and "POST /navigate"), docs/ARCHITECTURE.md
("In-page guide", "Extension layout", "Known risks").

Then build extension/ as a Chrome Manifest V3 extension, following the task table in my role doc in order.
Work only inside extension/. Do not touch frontend/, backend/ or data/. Chrome loads only the extension/ folder,
so everything the extension needs (guides, mock JSON, icons) must live inside extension/.

Requirements:
- Content script on *://*.mdc.edu/* injects a floating shark button (bottom-right) and a ~400px right-side iframe
  panel whose src is PANEL_ORIGIN from extension/config.ts. Toggle visibility; never destroy the iframe.
- Use a Shadow DOM root for everything injected; prefix classes/ids with "shark-".
- Implement the postMessage bridge exactly as in CONTRACTS.md section A, checking event.origin on every message.
- Guide overlay: highlight ring that follows scroll/resize, a bubble with the step text, a "Stop guide" button,
  auto-scroll to the element. The extension NEVER clicks or types for the student.
- Guide state in chrome.storage.session so it survives page navigations; on every load, if a guide is active,
  show the step that matches the current URL.
- Guides come from pre-recorded files in extension/guides/ (see extension/guides/example.json and CONTRACTS.md:
  pick the guide whose match.goal_urls prefix-matches goal.url, else match.step_ids; each step has url_pattern,
  selector, action, bubble). Expose them via web_accessible_resources or bundle them. If there is no guide for the box, open goal.url. Code freeze is 1:30 AM, so the live Navigator
  (page snapshot + POST {API_URL}/navigate from the service worker) is OPTIONAL and comes only after everything
  else works.
- Prefer plain JavaScript (no build step, Chrome loads it directly). If you use TypeScript, add a minimal esbuild
  build to extension/dist/ and load that folder. No React. Keep a short extension/README.md section on how to load and configure it.

Start with tasks 1-4 (manifest, shark button, iframe panel, postMessage bridge), make it loadable unpacked,
and tell me how to test it on www.mdc.edu. Commit on branch feat/ext-shell with small commits. Ask me before
changing any contract in docs/CONTRACTS.md.
```
