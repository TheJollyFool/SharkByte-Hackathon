from app.config import get_settings
from app.models.errors import ApiError
from app.models.messages import ChatReplyRequest, Message
from app.services import cache
from app.swarm.builders import chat_task
from app.swarm.client import extract_text, get_swarms, to_usage
from app.swarm.prompts import system_prompt

ENDPOINT = "/chat/reply"


def _cache_key(req: ChatReplyRequest) -> dict:
    return {
        "advisor_id": req.advisor_id,
        "group": sorted(req.group),
        "language": req.language,
        "history": cache.normalize_history([m.model_dump() for m in req.history]),
    }


async def reply(req: ChatReplyRequest) -> Message:
    key = _cache_key(req)
    if (hit := cache.get(ENDPOINT, key)) is not None:
        msg = Message.model_validate(hit)
        msg.source = "cache"
        return msg

    s = get_settings()
    if s.demo_mode:
        raise ApiError("upstream_failed", "DEMO_MODE on and no cached answer for this turn")

    async def call(model: str) -> dict:
        return await get_swarms().agent_completion(
            agent_name=req.advisor_id,
            system_prompt=system_prompt(req.advisor_id),
            task=chat_task(req.advisor_id, req.group, req.language, req.history),
            model_name=model,
            max_tokens=s.max_tokens_chat,
        )

    try:
        resp = await call(s.model_for(req.advisor_id))
    except ApiError:
        # The advisor's own model failed (provider quota / outage): retry once on the backup model
        resp = await call(s.model_fallback)

    msg = Message(
        role="advisor",
        advisor_id=req.advisor_id,
        text=extract_text(resp),
        usage=to_usage(resp),
        source="live",
    )
    cache.put(ENDPOINT, key, msg.model_dump())
    return msg
