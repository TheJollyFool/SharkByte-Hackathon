"""POST /mixture: MixtureOfAgents swarm. The LAST agent is the aggregator (verified live)."""

from app.config import get_settings
from app.data_loader import advisor_by_id, fixture
from app.models.errors import ApiError
from app.models.messages import Message, MixtureRequest, MixtureResponse
from app.services import cache
from app.swarm.builders import mixture_task
from app.swarm.client import extract_text, get_swarms, to_usage
from app.swarm.prompts import system_prompt

ENDPOINT = "/mixture"


def _key(req: MixtureRequest) -> dict:
    return {
        "advisors": sorted(req.advisors),
        "language": req.language,
        "history": cache.normalize_history([m.model_dump() for m in req.history]),
    }


def _fallback(req: MixtureRequest) -> MixtureResponse | None:
    fx = fixture("mixture.example.json")
    if not fx:
        return None
    out = MixtureResponse.model_validate(fx)
    out.message.source = "fallback"
    out.message.contributors = list(req.advisors)
    return out


async def run(req: MixtureRequest) -> MixtureResponse:
    if not req.advisors or any(advisor_by_id(a) is None for a in req.advisors):
        raise ApiError("invalid_request", "advisors: unknown or empty advisor list")

    key = _key(req)
    if (hit := cache.get(ENDPOINT, key)) is not None:
        out = MixtureResponse.model_validate(hit)
        out.message.source = "cache"
        return out

    s = get_settings()
    if s.demo_mode:
        if fb := _fallback(req):
            return fb
        raise ApiError("upstream_failed", "DEMO_MODE on and no cached mixture answer")

    agents = [
        {
            "agent_name": a,
            "model_name": s.model_for(a),
            "system_prompt": system_prompt(a),
            "max_tokens": s.max_tokens_chat,
        }
        for a in req.advisors
    ]
    agents.append(
        {
            "agent_name": "Aggregator",
            "model_name": s.model_aggregator,
            "system_prompt": system_prompt("aggregator"),
            "max_tokens": s.max_tokens_aggregator,
        }
    )
    body = {
        "name": "shark-advisors-mixture",
        "swarm_type": "MixtureOfAgents",
        "task": mixture_task(req.advisors, req.language, req.history),
        "agents": agents,
        "max_loops": 1,
    }
    try:
        resp = await get_swarms().swarm_completion(body)
    except ApiError:
        if fb := _fallback(req):
            return fb
        raise

    text = extract_text(resp)
    if not text:
        if fb := _fallback(req):
            return fb
        raise ApiError("upstream_failed", "Swarms returned an empty mixture answer")

    out = MixtureResponse(
        message=Message(
            role="aggregator",
            contributors=list(req.advisors),
            text=text,
            usage=to_usage(resp),
            source="live",
        ),
        per_agent_usage={},  # Swarms only returns the swarm total
    )
    cache.put(ENDPOINT, key, out.model_dump())
    return out
