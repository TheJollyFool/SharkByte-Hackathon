# backend/

FastAPI service: `/advisors`, `/chat/reply`, `/mixture`, `/roadmap`, `/navigate`. Not scaffolded yet — see
[AGENTS.md](../AGENTS.md) (conventions), [docs/CONTRACTS.md](../docs/CONTRACTS.md) (endpoints),
[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) (module layout) and
[docs/AGENT_PIPELINE.md](../docs/AGENT_PIPELINE.md) (Swarms calls, prompts, fallbacks).

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
