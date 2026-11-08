# Rol 4 — Diego: Datos MDC + cerebro de los agentes + pitch

## Tu misión
Que lo que dicen los agentes sea **verdad y útil**: datos reales de MDC con `source_url`, la personalidad
y reglas de cada asesor (sus system prompts), la ruta exacta del demo, y vender el producto (guion, slides,
video, Devpost). Tu experiencia en Financial Aid es la ventaja que nadie más tiene.

## Tus archivos
- Tuyos: `data/*.json`, `docs/agents/*.md` (los creas), `docs/DEMO.md`, slides, video, Devpost
- No tocas: `frontend/`, `extension/`, `backend/` (Piero copia tus prompts al código).

## Lee primero
1. `AGENTS.md` (reglas 2 y 3: todo empieza en MDC, datos honestos)
2. `docs/PRODUCT.md` (la tabla de asesores y la checklist del MDC)
3. `docs/AGENT_PIPELINE.md` (cómo se usan los prompts y los datos)
4. `data/README.md` y los JSON de `data/`
5. `docs/DEMO.md`

## Tareas en orden (con hora meta) — code freeze 1:30 AM

| # | Tarea | Meta |
|---|---|---|
| 1 | **Elegir la ruta del demo** y mandarla a Adrian: carrera (recomendado: Cybersecurity), programa MDC exacto, URL de su página en mdc.edu, qué caja se clickea, y los clics desde la home de mdc.edu | **8:30 PM** |
| 2 | Crear `docs/agents/` con un archivo por asesor (`career.md`, `pathway.md`, `cost.md`, `finaid.md`, `prodev.md`, `alternatives.md`) con el formato de abajo; avisar a Piero | **9:30 PM** |
| 3 | `data/mdc_programs.json`: programas reales de MDC para la carrera del demo (certificado, A.S., A.A., B.A.S. si hay), créditos, duración, `source_url` | 10:00 PM |
| 4 | `data/costs.json` (costo por crédito MDC — verificar en mdc.edu/tuition: hay versiones con $118.22 y $129.89 — out-of-state, FIU/FAU/UCF) y `data/transfer_agreements.json` (FIU Connect4Success: A.A. en 3 años, aplicar tras 12–30 créditos, **no garantiza** Architecture ni Nursing; FAU; UCF). Avisar a Piero | **10:30 PM** |
| 5 | `data/financial_aid.json`: Pell (monto máx actual), Bright Futures (por crédito en MDC), FSAG, work-study, becas MDC | 11:00 PM |
| 6 | Revisar el prompt del **Roadmap Writer** y del **Aggregator** (`docs/agents/roadmap-writer.md`, `aggregator.md`) | 11:30 PM |
| 7 | Probar el chat real (desde 11:15): ¿los asesores repiten? ¿inventan? Ajustar prompts con Piero | 12:15 AM |
| 8 | `docs/DEMO.md` final con el guion exacto que se escribe en el chat | **12:30 AM** |
| 9 | Correr el demo completo con el equipo; **pushear a `master`** | 1:30 AM |
| mañana | Nombre del producto, slides (problema → demo → swarm → impacto), video de 1–2 min, Devpost (10–11 AM) | 10:00 AM |
| extra | Solo si sobra tiempo: datos de otras carreras, prompt del Navigator | — |

## Dependencias
- **Entregas a Adrian (8:30 PM):** ruta del demo.
- **Entregas a Piero:** prompts (9:30 PM), datos del demo (10:30 PM).
- **Entregas a todos (12:30 AM):** guion del demo.
- **Recibes de Piero/Robert (~11:15 PM):** chat real para probar tus prompts.

## Terminado cuando
Cada entrada de `data/` tiene `source_url` (y `estimate: true` donde es aproximado); los 9 archivos de
`docs/agents/` existen; los asesores no inventan programas; el demo tiene guion, slides, video y está en Devpost
antes de las 11:00 AM.

## Si vas atrasado (recorta en este orden)
1. Carreras extra (ya es extra; quédate con una bien hecha)
2. `financial_aid.json` completo (el asesor puede hablar en general, marcado como estimado)
3. Nunca recortes: ruta del demo, prompts de los asesores, datos de la carrera del demo, guion

## Tips
- No necesitas programar: tu agente convierte tus notas a JSON. Tú verificas que el dato y el link sean reales.
- Cuando un número viene de una página, copia la URL exacta a `source_url`.
- Para el pitch: tu historia de Financial Aid ("audito expedientes de ayuda financiera en FIU") da credibilidad.

---

## Prompt para tu agente (Codex / Claude) — copia y pega

```text
You are working in the SharkByte-Hackathon repo. I am Diego, owner of Role 4: MDC data, the advisor agents'
prompts, and the pitch. I am not writing app code; you help me research, write and structure content.

First read, in this order: AGENTS.md, docs/CONTEXT.md, docs/roles/rol4-diego-data-pitch.md, docs/PRODUCT.md, docs/AGENT_PIPELINE.md,
data/README.md and every file in data/, docs/DEMO.md.

Then help me with the task table in my role doc, in order. Work only inside data/, docs/agents/ and docs/DEMO.md.

Rules:
- Every data entry must have a real source_url from mdc.edu or an official page (studentaid.gov, floridastudentfinancialaidsg.org,
  fiu.edu, etc.). If you cannot verify a number from a page, set "estimate": true and tell me which ones need checking.
  Never invent MDC programs, program codes or agreements.
- Keep the existing JSON structure of each data/ file; I want valid JSON.
- Create docs/agents/<id>.md for: career, pathway, cost, finaid, prodev, alternatives (ids from data/advisors.json),
  plus aggregator, roadmap-writer, navigator. Use the exact format in my role doc, including a "## System prompt"
  section with the prompt inside a ```text block (Piero's backend reads that section).
- Advisor prompts must: stay in their lane (say what they cover and what the others cover), reply in the student's
  language, max ~120 words per message, never repeat what another advisor already said, only recommend MDC
  programs from the injected MDC DATA, label estimates, and say "I don't have that data" instead of guessing.
- The finaid advisor covers Pell, Bright Futures, FSAG, FAFSA, work-study and estimated cost after aid (always
  labeled estimate) — I work at FIU Financial Aid, so ask me when unsure.

Code freeze is 1:30 AM. Start with task 2: draft docs/agents/ for the 6 advisors so I can review them in 20 minutes. Use branch
feat/data-agents with small commits.
```
