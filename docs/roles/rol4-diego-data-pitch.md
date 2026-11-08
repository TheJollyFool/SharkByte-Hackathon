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

## Tareas en orden (con hora meta)

| # | Tarea | Meta |
|---|---|---|
| 1 | **Elegir la ruta del demo** y mandarla a Adrian: carrera (recomendado: Cybersecurity), programa MDC exacto, URL de su página en mdc.edu, qué caja se clickea, y cómo se llega desde la home de mdc.edu (los clics) | **9:00 PM** |
| 2 | Crear `docs/agents/` con un archivo por asesor (`career.md`, `pathway.md`, `cost.md`, `finaid.md`, `prodev.md`, `alternatives.md`) usando el formato de abajo. Pásale el aviso a Piero | **10:00 PM** |
| 3 | `data/mdc_programs.json`: programas reales de MDC para la carrera del demo (certificado, A.S., A.A., B.A.S. si hay), con créditos, duración, `source_url` | 11:00 PM |
| 4 | `data/costs.json`: costo por crédito MDC (verifica en mdc.edu/tuition: hay versiones con $118.22 y $129.89), out-of-state, FIU/FAU/UCF | 11:30 PM |
| 5 | `data/transfer_agreements.json`: FIU Connect4Success (A.A. en 3 años, aplicar tras 12–30 créditos, **no garantiza** Architecture ni Nursing), FAU, UCF | 11:30 PM |
| 6 | `data/financial_aid.json`: Pell (monto máx actual), Bright Futures (por crédito en MDC), FSAG, work-study, becas MDC, URL de financial aid de MDC | 12:30 AM |
| 7 | Prompts del **Aggregator**, **Roadmap Writer** y **Navigator** (revisar los de AGENT_PIPELINE.md y mejorarlos) en `docs/agents/` | 1:00 AM |
| 8 | Datos de 2–4 carreras más (Mechanical Engineer, Architect, Chef, IT Consultant), aunque sea menos completo | 2:30 AM |
| 9 | Probar el chat real con Piero: ¿los asesores repiten? ¿inventan? Ajustar prompts | 3:30 AM |
| 10 | `docs/DEMO.md` final (3 min) con el guion exacto que se va a escribir en el chat | **4:00 AM** |
| 11 | Slides: problema → demo → cómo funciona el swarm → impacto/escala. Nombre del producto | 6:00 AM |
| 12 | Video de demo (grabar la pantalla del flujo completo) | 9:00 AM |
| 13 | Devpost: descripción, tecnologías, challenges (MDC + Swarms), video, link al repo | **10:00–11:00 AM** |

## Formato de cada `docs/agents/<id>.md`

~~~markdown
# Career Explorer (career)

## Personalidad
Amigable, directo, como un amigo que ya trabaja en la industria.

## Cubre
- Qué hace la carrera, responsabilidades, requisitos, salario en Miami, demanda, carreras relacionadas

## NO cubre (lo dicen otros)
- Programas de MDC (pathway), costos (cost), ayuda financiera (finaid)...

## Datos que recibe
- (ninguno de data/) | mdc_programs | costs | transfer_agreements | financial_aid

## Reglas de honestidad
- Si no tiene el dato, lo dice. Números que no vienen de los datos = "estimado".

## System prompt
```text
You are Career Explorer, one advisor in a group chat that helps a student ...
Answer in the student's language. Max 120 words. ...
```

## Ejemplo de respuesta
"Un especialista en ciberseguridad protege ... En Miami gana cerca de $X (estimado)..."
~~~

Piero lee la sección **"System prompt"** de cada archivo. El prompt va en inglés (los modelos lo siguen mejor), pero
le dice al agente que responda en el idioma del estudiante.

## Dependencias
- **Entregas a Adrian (9:00 PM):** ruta del demo.
- **Entregas a Piero (10:00 PM):** prompts v1. **(11:30 PM):** datos del demo.
- **Entregas a todos (4:00 AM):** guion final.
- **Recibes de Piero (~11 PM):** chat real funcionando para probar tus prompts.

## Terminado cuando
Cada entrada de `data/` tiene `source_url` (y `estimate: true` donde es aproximado); los 9 archivos de
`docs/agents/` existen; los asesores no inventan programas; el demo tiene guion, slides, video y está en Devpost
antes de las 11:00 AM.

## Si vas atrasado (recorta en este orden)
1. Carreras extra (quédate con una bien hecha)
2. Video largo → video de 1 min
3. Nunca recortes: ruta del demo, prompts de los asesores, datos de la carrera del demo, Devpost a tiempo

## Tips
- No necesitas programar: tu agente convierte tus notas a JSON. Tú verificas que el dato y el link sean reales.
- Cuando un número viene de una página, copia la URL exacta a `source_url`.
- Para el pitch: tu historia de Financial Aid ("audito expedientes de ayuda financiera en FIU") da credibilidad.

---

## Prompt para tu agente (Codex / Claude) — copia y pega

```text
You are working in the SharkByte-Hackathon repo. I am Diego, owner of Role 4: MDC data, the advisor agents'
prompts, and the pitch. I am not writing app code; you help me research, write and structure content.

First read, in this order: AGENTS.md, docs/roles/rol4-diego-data-pitch.md, docs/PRODUCT.md, docs/AGENT_PIPELINE.md,
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

Start with task 2: draft docs/agents/ for the 6 advisors so I can review them in 30 minutes. Use branch
feat/data-agents with small commits.
```
