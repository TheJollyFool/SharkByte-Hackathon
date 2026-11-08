"""Run the demo script once, live, and save every answer to backend/demo_cache/ (committed to git).
Run from backend/:  python -m scripts.warm_demo
The student messages must match what the panel sends in the demo (history text is the cache key)."""

import asyncio
import os

from app.config import REPO_ROOT

os.environ["CACHE_DIR"] = str(REPO_ROOT / "backend" / "demo_cache")
os.environ["DEMO_MODE"] = "false"

from app.models.messages import (  # noqa: E402
    ChatReplyRequest,
    Message,
    MixtureRequest,
)
from app.models.roadmap import RoadmapRequest  # noqa: E402
from app.services import chat_service, mixture_service, roadmap_service  # noqa: E402
from app.swarm.client import get_swarms  # noqa: E402

GROUP = ["career", "pathway", "cost", "finaid"]
SCRIPTS = [
    ("es", "Quiero trabajar en ciberseguridad, tengo poco dinero y trabajo medio tiempo"),
    ("en", "I want to work in cybersecurity, I have little money and I work part time"),
]


async def run(lang: str, student_text: str) -> None:
    history = [Message(role="student", text=student_text)]
    total = 0.0
    for adv in GROUP:  # same turn loop as the panel: each reply joins the history
        m = await chat_service.reply(
            ChatReplyRequest(advisor_id=adv, group=GROUP, language=lang, history=history)
        )
        history.append(m)
        total += m.usage.cost_usd if m.usage else 0
        print(f"  [{lang}] chat {adv}: {m.source} ${m.usage.cost_usd if m.usage else 0:.4f}")
    rm = await roadmap_service.generate(
        RoadmapRequest(mode="group_chat", language=lang, history=history)
    )
    print(f"  [{lang}] roadmap {rm.id}: {rm.source} routes={len(rm.routes)}")
    mx = await mixture_service.run(
        MixtureRequest(advisors=GROUP, language=lang, history=history[:1])
    )
    print(f"  [{lang}] mixture: {mx.message.source} ${mx.message.usage.cost_usd:.4f}")


async def main() -> None:
    for lang, text in SCRIPTS:
        print(f"== {lang}: {text}")
        await run(lang, text)
    await get_swarms().aclose()


if __name__ == "__main__":
    asyncio.run(main())
