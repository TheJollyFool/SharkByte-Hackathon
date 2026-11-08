"""Task 1+3: list models and make ONE real cheap call to /v1/agent/completions.
Run from backend/:  python -m scripts.first_call
Paste the trimmed output into docs/AGENT_PIPELINE.md 'Observed responses'."""

import asyncio
import json

from app.config import get_settings
from app.swarm.client import extract_text, get_swarms, to_usage


async def main() -> None:
    c = get_swarms()
    models = await c.models_available()
    print("== /v1/models/available (trimmed) ==")
    print(json.dumps(models, indent=2)[:1500])

    resp = await c.agent_completion(
        agent_name="career",
        system_prompt="You are a friendly career advisor. Answer in one sentence.",
        task="What does a cybersecurity specialist do?",
        model_name=get_settings().model_career,
        max_tokens=80,
    )
    print("\n== /v1/agent/completions raw (trimmed) ==")
    print(json.dumps(resp, indent=2)[:2500])
    print("\n== parsed ==")
    print("text :", extract_text(resp))
    print("usage:", to_usage(resp))
    await c.aclose()


if __name__ == "__main__":
    asyncio.run(main())
