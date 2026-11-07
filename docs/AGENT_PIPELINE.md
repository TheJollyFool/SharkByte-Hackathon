# Agent Pipeline (Swarms Graph Workflow)

Endpoint: `POST https://api.swarms.world/v1/graph-workflow/completions`
Header: `x-api-key: $SWARMS_API_KEY`
Docs: https://docs.swarms.ai/api-reference/graph-workflow/execute-graph-workflow

## Graph

```
            ┌─ Career Researcher ──┐
 task ──────┼─ MDC Program Finder ─┼──► Pathway Planner ──► Roadmap Writer ──► outputs["Roadmap Writer"]
            └─ Cost & Time Analyst ┘
```

Agents at the same level run in parallel. The Planner waits for all three.

## Agents

| agent_name | Input it relies on | Output (plain JSON text) |
|---|---|---|
| `Career Researcher` | the task (career + preferences) | overview, responsibilities, qualifications, median salary (Miami/FL if possible), outlook, related careers, required licenses/exams, common certifications |
| `MDC Program Finder` | task + **injected list of real MDC programs** from `data/mdc_programs.json` | 2–5 MDC programs (by `id` from the list only) that lead toward the career, plus transfer options from `data/transfer_agreements.json` |
| `Cost & Time Analyst` | task + **injected cost table** from `data/costs.json` | per-credential duration and cost estimates (MDC in-state tuition per credit, university tuition, books/fees), part-time multipliers |
| `Pathway Planner` | outputs of the 3 above | 2–4 distinct routes (short → long), each an ordered list of steps, with workforce entry points and alternative MDC programs |
| `Roadmap Writer` | Planner output | **only** a JSON object matching `shared/roadmap.schema.json` — no prose, no markdown fences |

### Prompt rules (all agents)
- Be concise; output JSON only (no markdown) so the next agent and the backend can parse it.
- Never invent MDC programs, program IDs or transfer agreements — pick from the injected lists.
- Mark any number not taken from the injected data as `"estimate": true`.
- The Writer must start every route with an MDC step.

System prompts live in `backend/app/swarm/prompts.py` (one constant per agent). Keep them versioned there,
not inline in the request builder.

## Request body (shape)

```json
{
  "name": "mdc-pathways",
  "description": "Career roadmap generator starting at Miami Dade College",
  "task": "<career + preferences + injected data, see below>",
  "agents": [
    {"agent_name": "Career Researcher",   "model_name": "$MODEL_RESEARCHER",     "system_prompt": "...", "max_tokens": 4000},
    {"agent_name": "MDC Program Finder",  "model_name": "$MODEL_PROGRAM_FINDER", "system_prompt": "...", "max_tokens": 4000},
    {"agent_name": "Cost & Time Analyst", "model_name": "$MODEL_COST_ANALYST",   "system_prompt": "...", "max_tokens": 4000},
    {"agent_name": "Pathway Planner",     "model_name": "$MODEL_PLANNER",        "system_prompt": "...", "max_tokens": 4000},
    {"agent_name": "Roadmap Writer",      "model_name": "$MODEL_WRITER",         "system_prompt": "...", "max_tokens": 6000}
  ],
  "edges": [
    {"source": "Career Researcher",   "target": "Pathway Planner"},
    {"source": "MDC Program Finder",  "target": "Pathway Planner"},
    {"source": "Cost & Time Analyst", "target": "Pathway Planner"},
    {"source": "Pathway Planner",     "target": "Roadmap Writer"}
  ],
  "entry_points": ["Career Researcher", "MDC Program Finder", "Cost & Time Analyst"],
  "end_points": ["Roadmap Writer"],
  "max_loops": 1
}
```

Response: `{job_id, status, outputs, usage: {input_tokens, output_tokens, total_tokens, total_cost}, timestamp}`.
Read `outputs["Roadmap Writer"]` (check the real shape on the first call and note it here).

### Task string template
```
CAREER: {career}
PREFERENCES: budget={budget}, pace={pace}, schedule={full_time|part_time}, existing_credits={n}
MDC_PROGRAMS (choose only from these): {json of filtered programs}
TRANSFER_AGREEMENTS: {json}
COST_TABLE: {json}
```
Injecting data via the task means all agents see it; keep the filtered lists short (tokens = credits).

## Models
- List valid names: `GET /v1/models/available`. Prices: `GET /v1/models/pricing`.
- Dev: cheapest model everywhere. Demo: stronger model for Planner + Writer.
- Gemini prize: put a Gemini model on at least one agent (e.g. Career Researcher) and mention it in the pitch.

## Cost control
- Cache every response on disk (`CACHE_DIR`) keyed by career + preferences.
- Check spend: `GET /v1/usage/costs`, `GET /v1/account/credits`, `GET /v1/rate/limits`.
- Tests mock the HTTP call — never hit Swarms in CI.

## Fallbacks
1. Writer JSON invalid → one repair call with a single agent (`POST /v1/agent/completions`).
2. Still invalid / timeout → return fixture from `shared/fixtures/` for the closest showcase career, flagged `"source": "fallback"`.
