# AdByteSor — SharkByte Hackathon

A shark 🦈 on mdc.edu that helps students find their path. Chat with a **group of AI advisors** (or get one
**merged expert answer**), get a **flowchart roadmap that starts at Miami Dade College**, download it as PDF,
and get **guided step by step on the real mdc.edu page** to every program, course and certificate in it.

Built for the **MDC North Campus Challenge** and the **Swarms API Challenge**.

| Folder | What |
|---|---|
| `extension/` | Chrome extension: shark button, panel, in-page guide |
| `frontend/` | Next.js panel app: mode picker, group chat, mixture, flowchart, PDF |
| `backend/` | FastAPI service that calls the Swarms API |
| `data/` | Advisors + curated MDC programs, costs, transfer agreements, financial aid |
| `shared/` | Roadmap schema, mock fixtures, pre-recorded guides |
| `docs/` | Product, requirements, contracts, architecture, agents, team plan, demo |

Start here: [AGENTS.md](AGENTS.md) · [docs/PRODUCT.md](docs/PRODUCT.md) · [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) · [docs/CONTRACTS.md](docs/CONTRACTS.md) · [docs/TEAM_PLAN.md](docs/TEAM_PLAN.md)

## Quick start

```bash
cp .env.example .env   # add your SWARMS_API_KEY (backend only)
```

See "How to run" in [AGENTS.md](AGENTS.md).
