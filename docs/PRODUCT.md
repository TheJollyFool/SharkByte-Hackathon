# Product Spec — MDC Pathways

## Problem
Students who want to become an architect, engineer, chef or cybersecurity specialist don't know
which MDC program to start with, what comes after, how long it takes, or what it costs.
The information exists but is scattered across catalogs, transfer agreements and job sites.

## Solution (one sentence)
Pick a career → get 2–4 clear, comparable roadmaps that start at MDC, with time, cost,
credentials and the points where you can already earn money.

## Target user
High school senior or new MDC student, no prior knowledge of college programs. Usually on a phone.

## MDC Challenge requirements → how we cover each one

| # | MDC asks for | Our feature | Done? |
|---|---|---|---|
| 1 | **Career exploration**: search/select a career; explain it (responsibilities, qualifications); related/alternative careers | Career picker with search + career overview card + "related careers" chips (Career Researcher agent) | [ ] |
| 2 | **Educational pathway starting at MDC**: MDC degrees and courses; associate + bachelor's; transfer opportunities; articulation/transfer agreements; master's/doctoral when applicable | Each route = ordered steps; step 1 always an MDC program from `data/`; transfer steps cite the agreement (2+2, FIU/FAU/UCF etc.) | [ ] |
| 3 | **Timeline and cost**: time per stage; tuition and expenses; total cost and time | Per-step `duration_months` + `cost_usd`; totals per route; timeline visualization | [ ] |
| 4 | **Professional development**: certifications/licenses; internships/apprenticeships; licensing exams; resources for exam prep, résumé, interviews | `credentials[]`, `experience[]`, `exams[]`, `resources[]` per route | [ ] |
| 5 | **Alternative pathways**: multiple routes to the same goal; enter workforce at different stages; earn-while-you-learn; alternative MDC programs | Short vs long routes, `workforce_entry_points[]` on the timeline, "alternative MDC programs" list | [ ] |

### "What MDC is looking for" checklist (judging)
- [ ] **Easy to use** — no prior knowledge of college programs needed
- [ ] **Personalized** — adjusts to selected career, educational goals and preferences (budget, time, part-time)
- [ ] **Actionable** — student sees concrete next steps: programs, courses, credentials, transfer options
- [ ] **Multiple pathways** — compare short credentials vs long degree programs
- [ ] **Starts at MDC** — every pathway begins with an MDC opportunity
- [ ] **Designed to grow** — data-driven: adding a career = adding data, not code

## Swarms Challenge angle
- Real multi-agent **graph workflow** (not one prompt): parallel fan-out of 3 specialists → planner → writer.
- Show the graph live in the UI ("agents working" panel with each node lighting up) — judges love seeing the swarm.
- Show `usage.total_cost` per roadmap: cheap enough to scale to every MDC student.

## Showcase careers (pre-generate + cache these for the demo)
1. Cybersecurity specialist
2. Mechanical engineer
3. Architect
4. Chef
5. IT consultant

## MVP scope (must ship)
- Career picker (the 5 showcase careers + free-text search)
- Preferences: budget range, how fast, full/part-time, already has credits?
- Results page: 2–4 routes side by side, timeline per route, totals, credentials, workforce entry points
- Shareable link + QR code
- Demo mode with cached roadmaps

## Stretch
- Live "agents working" graph animation with streaming
- Gemini model on at least one agent (Gemini prize)
- Custom domain via GoDaddy (GoDaddy prize)
- Export roadmap as PDF
- Spanish toggle (Miami audience)

## Out of scope
Accounts/login, saving profiles, real-time course availability, financial aid applications.
