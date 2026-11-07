# backend/

FastAPI service that runs the Swarms graph workflow. Not scaffolded yet — see
[AGENTS.md](../AGENTS.md) (conventions), [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) (module layout)
and [docs/AGENT_PIPELINE.md](../docs/AGENT_PIPELINE.md) (request body, prompts, fallbacks).

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
