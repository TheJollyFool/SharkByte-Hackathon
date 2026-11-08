# Requirements & Scope

> **Human-owned file.** The team writes and approves this, not an AI. Agents must treat it as
> read-only and must not build anything listed under "Out of scope". If a task seems to need
> something not listed here, stop and ask a human.

## Functional requirements (MVP — must ship)

### Extension
| ID | Requirement | Covers |
|---|---|---|
| FR-1 | Chrome extension (MV3) shows a floating shark button bottom-right on `*.mdc.edu` pages | Easy to use |
| FR-2 | Clicking the shark opens a panel with our web app (iframe); it can be closed and reopened without losing the conversation | Easy to use |

### Modes
| ID | Requirement | Covers |
|---|---|---|
| FR-3 | Mode picker: **Group Chat** or **Mixture of Agents** | Swarms |
| FR-4 | Group Chat: "New group" screen where the student picks which advisors to add (6 available, default all) | Personalized |
| FR-5 | Group Chat turns: after each student message, each selected advisor answers **once**, in a fixed order, seeing the previous answers; then all wait for the student | Swarms |
| FR-6 | Mixture: all advisors run, an aggregator merges them into one answer; the student can reply to refine it. **Built after the group chat works end to end** | Swarms |
| FR-7 | Every advisor message shows **tokens and cost (USD)** in small text; each conversation shows a running total | Swarms |

### Roadmap
| ID | Requirement | Covers |
|---|---|---|
| FR-9 | "I'm ready to go deeper" button generates a roadmap from the conversation | Actionable |
| FR-10 | Roadmap = 2–4 routes; **the first step of every route is a real MDC program** from `data/` | MDC §2, §5 |
| FR-11 | Each step shows credential, institution, duration, cost (estimates labeled) and has a `source_url` when known | MDC §2, §3 |
| FR-12 | Each route shows total time and total cost; workforce entry points marked between steps | MDC §3, §5 |
| FR-13 | Transfer steps name the agreement used; certifications/exams/internships appear as steps or tags | MDC §2, §4 |
| FR-14 | Roadmap shown as a **flowchart**; every box is clickable | Actionable |
| FR-15 | Flowchart can be **downloaded as PDF** (`window.print()` with a print stylesheet is enough) | Actionable |
| FR-16 | Warnings shown when they apply (limited-access majors, estimated data) | Honest |

### In-page guide
| ID | Requirement | Covers |
|---|---|---|
| FR-17 | Clicking a box closes the panel and starts a step-by-step guide on mdc.edu: highlight + bubble on the element to click / field to type | Actionable, wow |
| FR-18 | Guide works from a **pre-recorded guide** for the demo path (`shared/guides/`), persists across page loads, "Stop guide" always available | Demo safety |
| FR-19 | Fallback for boxes without a guide: "Open page directly" (box `source_url`) | Actionable |

### Demo safety
| ID | Requirement | Covers |
|---|---|---|
| FR-20 | `DEMO_MODE`: cached chat turns, mixture answer, roadmap and guide for the demo script work without Swarms | Demo safety |

## Non-functional requirements
- NFR-1 No API keys in the repo, the frontend bundle or the extension. Only the backend calls Swarms.
- NFR-2 The extension only adds an overlay on mdc.edu; it never copies, restyles or submits anything on MDC's site.
- NFR-3 Each advisor turn shows a typing indicator; a full group round finishes in < 60 s live, < 2 s from cache.
- NFR-4 No prior knowledge of college programs needed.
- NFR-5 Adding a career/program = data changes in `data/*.json`, no code.

## Should have (if time, in this order — only after the MVP demo runs)
- Live **Navigator** agent (`POST /navigate`) that reads the page so the guide works on any box
- English / Spanish toggle; advisors answer in the student's language
- Estimated cost after financial aid on the flowchart (`net_cost_after_aid_usd`)
- Per-agent usage in Mixture
- Different model per advisor (shown on the advisor card)
- Streaming text in chat
- More pre-recorded guides

## Out of scope (do NOT build)
- Login, accounts, user profiles, history across devices
- Real-time course schedules / seat availability
- Submitting financial aid applications or payments
- Auto-clicking or auto-filling MDC's site for the student (the guide only points)
- Browsers other than Chrome; publishing to the Chrome Web Store
- Admin panel / CMS for data

## Definition of done (MVP)
On mdc.edu with the extension loaded: shark → Group Chat with ≥3 advisors (tokens + cost under each
message) → "ready" → flowchart with a real MDC first step → PDF download works → clicking the demo box
guides the student on mdc.edu to that page (pre-recorded guide). Mixture reaches the flowchart too.
Whole demo runs with `DEMO_MODE=true` and with it off. Everything pushed to `master` by **Sun 1:30 AM**.

## Approval
- Status: **APPROVED v2** — 2026-11-07, idea agreed by the whole team (Adrian, Robert, Piero, Diego).
  Replaces v1 (web app with career picker). Scope cut on 2026-11-07 8 PM for the **1:30 AM code freeze**:
  live Navigator, Spanish and cost-after-aid moved to "Should have".
- Challenges: **MDC North Campus Challenge** and **Swarms API Challenge**. Nothing else drives scope.
