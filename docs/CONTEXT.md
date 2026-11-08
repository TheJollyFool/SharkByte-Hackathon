# Context — everything an agent should know before working here

Read this once, after [AGENTS.md](../AGENTS.md). It is the background behind the spec: the event, the two
challenges (as the organizers presented them), the Swarms API from the official slides, research already done,
the team, and the decisions that got us here. The spec itself is [PRODUCT.md](PRODUCT.md) +
[REQUIREMENTS.md](REQUIREMENTS.md); this file never overrides them.

## 1. The event — SharkByte 2026
- Miami Dade College's official hackathon, run by INIT MDC North. In person, **Nov 6–8, 2026**, MDC North
  Campus, School of Justice (Building 8), 11380 NW 27th Ave, Miami, FL 33167.
- Teams up to 4. **All code/design/assets must be created during the weekend**; open-source libraries and
  APIs are allowed. Projects are submitted on **Devpost**. MLH Code of Conduct applies.
- Discord is the source of truth for schedule changes.

| When | What |
|---|---|
| Fri Nov 6, 10:00 PM | Hacking began |
| **Sun Nov 8, 1:30 AM** | **Our code freeze** (team decision — everything pushed to `master`) |
| Sun Nov 8, 10:00 AM | Hacking officially ends |
| Sun Nov 8, 10:00–11:00 AM | Devpost submission window (**hard deadline**) |
| Sun Nov 8, 1:30–3:00 PM | Judging (booth demo; we bring a monitor) |
| Sun Nov 8, 5:00 PM | Closing ceremony |

## 2. The two challenges we build for

### MDC North Campus Challenge — "Smart Career and Education Pathway Navigator"
Organizer brief (summarized from the MDC slides):
> Create a working prototype (website, app or AI tool) where a student selects a career (e.g. architect,
> mechanical engineer, chef, cybersecurity specialist, IT consultant) and gets a clear, step-by-step roadmap.

What MDC is looking for — a solution that is:
- **Easy to use** — no prior knowledge of college programs or career requirements needed.
- **Personalized** — adjusts to the selected career, educational goals and preferences.
- **Actionable** — clear next steps: programs, courses, credentials, transfer opportunities.
- **Multiple pathways** — compare shorter-term credentials and longer-term degrees.
- **Starts at MDC** — every pathway begins with an appropriate MDC opportunity.
- **Designed to grow** — can eventually support all MDC programs and many careers.

"Alternative Career Pathways" slide: multiple routes to the same goal; enter the workforce at different
educational stages; earn credentials, gain employment and continue education; highlight alternative MDC
programs that lead to the same or related careers.

The 5 requirement sections (how we map them: [PRODUCT.md](PRODUCT.md)):
1. Career exploration 2. Educational pathway starting at MDC (incl. transfer/articulation agreements,
master's/doctoral) 3. Timeline and cost 4. Professional development (certifications, internships, licensing
exams, resources) 5. Alternative pathways.

Prizes: 1st OGIO backpack + charger + wireless headphones; 2nd wireless charger + headphones; 3rd EC-Council swag.

### Swarms API Challenge
"Describe your agents in JSON and send a task." Build real multi-agent apps on the Swarms API.
Prizes: 1st interview with the CEO + $1,000 credits; 2nd $750 credits; 3rd $250 credits.
Keys: cloud.swarms.world/api-keys. Docs: https://docs.swarms.ai

Overall prizes (1st iPad + ManaTech package, 2nd monitor, 3rd chair + speaker) come from doing these two well.

## 3. Swarms API — from the official slides
- One API for agents that work together. Describe agents in JSON, send a task; the API runs them on the
  chosen models (OpenAI, Anthropic, Google, more), coordinates them and returns output + tokens + exact cost.
  Nothing runs locally.
- **Concepts:** Agent = one model with a name, system prompt and settings. Task = the instruction.
  Swarm = several agents on one task. Swarm type = how they collaborate.
- **Swarm types** (14 total, `GET /v1/swarms/available`): `SequentialWorkflow` (each builds on the last),
  `ConcurrentWorkflow` (all at once), **`MixtureOfAgents` (an aggregator merges experts)**,
  `HierarchicalSwarm` (director delegates), **`GroupChat` (agents discuss in turns)**, `DebateWithJudge`.
- **Endpoints:** `POST /v1/agent/completions` (one agent), `/v1/swarm/completions` (swarm),
  `/v1/agent/batch/completions`, `/v1/chat/completions` (OpenAI-compatible), `/v1/reasoning-agent/completions`,
  `/v1/graph-workflow/completions`; `GET /v1/models/available`, `/v1/swarms/available`, `/v1/models/pricing`,
  `/v1/usage/costs`, `/v1/account/credits`, `/v1/rate/limits`. Streaming: `"stream": true` on a swarm.
- Example model name on the slides: `gpt-5.4-mini`. Response: `{job_id, success, name, output|outputs,
  usage: {input_tokens, output_tokens, total_tokens, total_cost}, timestamp}`.

```python
import os, requests
BASE = "https://api.swarms.world"; HEADERS = {"x-api-key": os.environ["SWARMS_API_KEY"]}
swarm = {"name": "Blog team", "swarm_type": "SequentialWorkflow", "task": "Write 150 words on why bees matter.",
         "agents": [{"agent_name": "Writer", "model_name": "gpt-5.4-mini", "system_prompt": "Write a vivid first draft."},
                    {"agent_name": "Editor", "model_name": "gpt-5.4-mini", "system_prompt": "Tighten the draft. Cut 20%."}]}
r = requests.post(f"{BASE}/v1/swarm/completions", headers=HEADERS, json=swarm)
print(r.json()["output"])
```
OpenAI SDK drop-in: `OpenAI(base_url="https://api.swarms.world/v1", api_key=SWARMS_API_KEY)`.
How **we** use it: [AGENT_PIPELINE.md](AGENT_PIPELINE.md).

## 4. Research already done (for data/ and the pitch — verify before using as fact)
- **MDC tuition (Florida resident, mdc.edu/tuition):** associate / College Credit Certificate ≈ $118.22 per
  credit on one version of the page, $129.89 on another — **verify the current rate**. Career Technical
  Certificate ≈ $91.08/credit. Out-of-state associate ≈ $402.51/credit. Baccalaureate has its own rate.
  MDC Online adds ≈ $15/credit distance fee.
- **A.A. vs A.S.:** the A.A. is the transfer degree (Florida guarantees transfer of the 60 A.A. credits to state
  universities); the A.S. is workforce-oriented and transfers only into specific bachelor's programs.
- **FIU Connect4Success:** guaranteed FIU admission if the A.A. is completed within 3 years (apply after
  12–30 MDC credits). **Not guaranteed for limited-access majors, e.g. Architecture and Nursing** → the app
  must warn about this. Other pathways: FAU LINK, UCF Transfer Connect.
- About 70% of MDC A.A. completers who transfer go to FIU. 2+2 = less debt than starting at a university.
- Still to research: Miami salaries per career (BLS), real MDC program names/credits/URLs.

## 5. The team
| Person | Role | Background that matters |
|---|---|---|
| Adrian | Role 1 — Chrome extension + in-page guide | Team captain |
| Robert | Role 2 — panel app (frontend) | Frontend |
| Piero | Role 3 — backend + Swarms | Wrote the first repo docs |
| Diego | Role 4 — MDC data, agent prompts, pitch | FIU Financial Aid work-study (audits aid files, loan campaigns) → financial aid expertise; bilingual; sales/public speaking |

Team works in English and Spanish. Coding agents: mostly Codex and Claude Code (also Gemini).
Briefs per person: [roles/](roles/).

## 6. Decisions and history (why things are the way they are)
1. First idea (hurricane-alert verifier for EC-Council) → rejected; team chose **MDC + Swarms**.
2. v1 of this repo (Nov 7 afternoon): a web app — pick a career → preferences → 5-agent Swarms graph
   workflow → route comparison + QR code. **Replaced.**
3. v2 (Nov 7, ~7 PM, whole team agreed): **Chrome extension on mdc.edu** with a shark button; student chooses
   **Group Chat** (advisors as "friends", one MDC section each, answering in turns, tokens + cost per message)
   or **Mixture of Agents**; then a **flowchart** roadmap (PDF download instead of QR); clicking a box starts an
   **in-page guide** on the real mdc.edu page. Added: Financial Aid advisor, honest warnings, cost display.
4. Group chat is built as **one `agent/completions` call per advisor, in order** (not the `GroupChat` swarm
   type) so each message has its own tokens + cost and the turn order is under our control.
5. The extension **iframes our Vercel app** (one web app, extension is a thin shell). Checked: www.mdc.edu
   sends no CSP / X-Frame-Options, so injecting the iframe works.
6. Nov 7, 8 PM: team will stop at **1:30 AM** → scope cut: in-page guide uses **pre-recorded guides** (live
   Navigator is optional), PDF via `window.print()`, Spanish and cost-after-aid moved to "if time".
7. Product name: TBD ("Shark Advisor" is a working name). Not "GridLock".
8. We build for the challenges, not side prizes (no Gemini/GoDaddy work).

## 7. Don'ts that come from this context
- Don't copy or impersonate MDC's website; the extension only overlays.
- Don't invent MDC programs, numbers or agreements — say "estimate" or "no data".
- Don't put the Swarms key anywhere but the backend `.env`.
- Don't add features beyond [REQUIREMENTS.md](REQUIREMENTS.md); with a 1:30 AM freeze, simpler wins.
