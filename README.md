# MDC Pathways — SharkByte Hackathon

Pick a career. Get several roadmaps that start at **Miami Dade College** — short and long routes,
with time, cost, certifications and the points where you can start working.

Powered by a **Swarms graph workflow** of five AI agents:
Career Researcher, MDC Program Finder and Cost & Time Analyst run in parallel, then the
Pathway Planner merges them and the Roadmap Writer produces the final roadmap.

| Folder | What |
|---|---|
| `frontend/` | Next.js + TypeScript + Tailwind web app |
| `backend/` | FastAPI service that runs the Swarms workflow |
| `data/` | Curated MDC programs, costs and transfer agreements |
| `shared/` | Roadmap JSON schema + example fixtures (the backend ↔ frontend contract) |
| `docs/` | Product spec, architecture, agent pipeline, team plan, demo script |

Start here: [AGENTS.md](AGENTS.md) · [docs/PRODUCT.md](docs/PRODUCT.md) · [docs/TEAM_PLAN.md](docs/TEAM_PLAN.md)

## Quick start

```bash
cp .env.example .env   # add your SWARMS_API_KEY
```

See "How to run" in [AGENTS.md](AGENTS.md).
