# Rol 1 — Adrian: Extensión de Chrome + guía en la página

## Tu misión
Que el tiburón aparezca en mdc.edu, abra el panel, y que al hacer clic en una caja del flowchart el
estudiante sea **guiado paso a paso sobre la página real de mdc.edu** (highlight + burbuja) hasta el
programa/curso/certificado. Este es el momento "wow" del demo.

## Tus archivos
- Tuyos: `extension/` (todo), `shared/guides/*.json`
- No tocas: `frontend/`, `backend/`, `data/`. Si necesitas un cambio en un contrato, avisa a Robert (panel) o Piero (backend).

## Lee primero
1. `AGENTS.md` (regla 6 "Respect mdc.edu")
2. `docs/PRODUCT.md` secciones 1 y 5
3. `docs/CONTRACTS.md` → sección **A** (postMessage) y `POST /navigate`
4. `docs/ARCHITECTURE.md` → "In-page guide" y "Extension layout"

## Tareas en orden (con hora meta)

| # | Tarea | Meta |
|---|---|---|
| 1 | `extension/manifest.json` MV3: content script en `*://*.mdc.edu/*`, service worker, `storage` permission, `host_permissions` para el backend; `config.ts` con `PANEL_ORIGIN`, `API_URL`, `MOCK_NAVIGATE` | 8:45 PM |
| 2 | Botón tiburón flotante abajo a la derecha (SVG/emoji, clases `shark-*`, `z-index` alto) | 9:00 PM |
| 3 | Panel: iframe (~400 px, lado derecho, alto completo) con `PANEL_ORIGIN`; abrir/cerrar sin destruir el iframe (así no se pierde la conversación) | 9:30 PM |
| 4 | Puente postMessage: recibir `shark:ready`, `shark:close`, `shark:start_guide`, `shark:open_url`; enviar `shark:guide_finished`, `shark:page_context`. Verificar `event.origin` | 10:30 PM |
| 5 | Snapshot de página: elementos visibles interactivos (`a, button, input, select, [role=button]`), máx 150, texto ≤ 80 chars, asigna `data-shark-id="eN"` | 11:15 PM |
| 6 | Overlay de guía: anillo de highlight sobre el elemento (sigue scroll/resize), burbuja con texto, botón "Stop guide", scroll automático al elemento | 12:30 AM |
| 7 | Estado de la guía en `chrome.storage.session`; en cada carga de página: si hay guía activa → snapshot → pedir siguiente paso | 1:00 AM |
| 8 | Modo mock (`MOCK_NAVIGATE=true`) usando `shared/fixtures/navigate.example.json` | 1:00 AM |
| 9 | Guía pregrabada real para la ruta del demo (Diego te pasa la ruta 9 PM): visita mdc.edu, saca selectores, llena `shared/guides/<id>.json` | 2:30 AM |
| 10 | Integración: service worker llama `POST /navigate` real (Piero, ~2 AM); si falla → guía pregrabada → si no hay → `open_url` | 3:30 AM |
| 11 | Cargar el panel desplegado de Vercel (URL de Robert ~1 AM) en vez de localhost | 3:30 AM |
| 12 | Probar todo el demo en el laptop del stand; revisar selectores en la mañana | 7:00 AM |

## Dependencias
- **Recibes de Robert (9:00 PM):** panel corriendo en `localhost:3000` y `lib/shark-bridge.ts`. Antes de eso, prueba el iframe con cualquier página (`https://example.com`) o un `panel-test.html` tuyo.
- **Recibes de Diego (9:00 PM):** la ruta exacta del demo (qué programa, URL final).
- **Recibes de Piero (~2:00 AM):** `/navigate` en vivo. Antes, usa mock.
- **Entregas a Robert:** confirmación de que `shark:start_guide` funciona (para que él pruebe el clic en caja).

## Terminado cuando
En `www.mdc.edu` con la extensión cargada: tiburón → panel abre/cierra → desde el panel, clic en una caja →
panel se cierra → highlight + burbuja guían clic por clic hasta la página del programa → al llegar,
`shark:guide_finished` con `done`. Funciona con `/navigate` y, si se cae, con la guía pregrabada.

## Si vas atrasado (recorta en este orden)
1. Guía en vivo con `/navigate` → quédate solo con la guía pregrabada del demo
2. Scroll/resize perfecto del highlight
3. Nunca recortes: tiburón + panel + una guía pregrabada que funcione

## Tips
- Carga la extensión: `chrome://extensions` → Developer mode → Load unpacked → `extension/`. Después de cada cambio, botón ↻ y recarga mdc.edu.
- Todo el CSS inyectado con prefijo `shark-` y preferiblemente dentro de un Shadow DOM para no romper estilos de MDC.
- La extensión **nunca** hace clic ni escribe por el estudiante: solo señala.

---

## Prompt para tu agente (Codex / Claude) — copia y pega

```text
You are working in the SharkByte-Hackathon repo. I am Adrian, owner of Role 1: the Chrome extension and the in-page guide.

First read, in this order: AGENTS.md, docs/roles/rol1-adrian-extension.md, docs/PRODUCT.md (sections 1 and 5),
docs/CONTRACTS.md (section A "Extension <-> Panel messages" and "POST /navigate"), docs/ARCHITECTURE.md
("In-page guide", "Extension layout", "Known risks").

Then build extension/ as a Chrome Manifest V3 extension, following the task table in my role doc in order.
Work only inside extension/ and shared/guides/. Do not touch frontend/, backend/ or data/.

Requirements:
- Content script on *://*.mdc.edu/* injects a floating shark button (bottom-right) and a ~400px right-side iframe
  panel whose src is PANEL_ORIGIN from extension/config.ts. Toggle visibility; never destroy the iframe.
- Use a Shadow DOM root for everything injected; prefix classes/ids with "shark-".
- Implement the postMessage bridge exactly as in CONTRACTS.md section A, checking event.origin on every message.
- Page snapshot: visible interactive elements only (a, button, input, select, [role=button]), max 150, text trimmed
  to 80 chars, tag each with data-shark-id="eN".
- Guide overlay: highlight ring that follows scroll/resize, a bubble with the step text, a "Stop guide" button,
  auto-scroll to the element. The extension NEVER clicks or types for the student.
- Guide state in chrome.storage.session so it survives page navigations; on every load, if a guide is active,
  snapshot the page and ask for the next NavStep.
- The service worker calls POST {API_URL}/navigate. If MOCK_NAVIGATE is true, return shared/fixtures/navigate.example.json
  instead. If the call fails, fall back to a pre-recorded guide from shared/guides/ matching goal.step_id,
  else open goal.url.
- Plain TypeScript (or JS) is fine; no React. Keep a short extension/README.md section on how to load and configure it.

Start with tasks 1-4 (manifest, shark button, iframe panel, postMessage bridge), make it loadable unpacked,
and tell me how to test it on www.mdc.edu. Commit on branch feat/ext-shell with small commits. Ask me before
changing any contract in docs/CONTRACTS.md.
```
