"""POST /navigate: next step of the in-page guide. Cheap model, called on every page load."""

import json
import re

from pydantic import ValidationError

from app.config import get_settings
from app.data_loader import fixture
from app.models.errors import ApiError
from app.models.messages import Usage
from app.models.navigate import NavigateRequest, NavStep
from app.services import cache
from app.swarm.client import extract_text, get_swarms, to_usage
from app.swarm.prompts import system_prompt

ENDPOINT = "/navigate"
MAX_ELEMENTS = 150


def _key(req: NavigateRequest) -> dict:
    return {
        "goal": req.goal.model_dump(),
        "language": req.language,
        "url": req.page.url,
        "elements": [(e.id, e.text, e.href) for e in req.page.elements],
        "previous": [(s.action, s.element_id) for s in req.previous_steps],
    }


def _open_url(req: NavigateRequest, source: str = "fallback") -> NavStep:
    """Safe fallback: send the student straight to the goal page (or the example fixture)."""
    if req.goal.url:
        msg = "Abrir la página del programa" if req.language == "es" else "Open the program page"
        return NavStep(action="open_url", url=req.goal.url, bubble=msg, source=source)
    fx = fixture("navigate.example.json")
    return NavStep.model_validate({**fx, "source": "fallback"}) if fx else NavStep(action="done")


def _parse(text: str) -> dict:
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
    return json.loads(text[text.find("{") : text.rfind("}") + 1])


def _valid(step: NavStep, req: NavigateRequest) -> bool:
    ids = {e.id for e in req.page.elements}
    if step.action in ("click", "type", "scroll"):
        if step.element_id not in ids:
            return False
        if step.action == "type" and not step.text_to_type:
            return False
    if step.action == "open_url" and not (step.url or req.goal.url):
        return False
    return True


def _task(req: NavigateRequest, retry: bool) -> str:
    elements = [e.model_dump(exclude_none=True) for e in req.page.elements[:MAX_ELEMENTS]]
    prev = [
        s.model_dump(exclude_none=True, exclude={"usage", "source"}) for s in req.previous_steps
    ]
    extra = (
        "\nYour last answer used an element_id that is not in the list. Use ONLY listed ids."
        if retry
        else ""
    )
    return (
        f"LANGUAGE: {req.language}\n"
        f"GOAL: {json.dumps(req.goal.model_dump(exclude_none=True), ensure_ascii=False)}\n"
        f"PAGE: {json.dumps({'url': req.page.url, 'title': req.page.title}, ensure_ascii=False)}\n"
        f"ELEMENTS: {json.dumps(elements, ensure_ascii=False)}\n"
        f"PREVIOUS_STEPS: {json.dumps(prev, ensure_ascii=False)}\n"
        f"Reply with the next step as JSON only.{extra}"
    )


async def next_step(req: NavigateRequest) -> NavStep:
    if req.page.elements and len(req.page.elements) > MAX_ELEMENTS:
        req.page.elements = req.page.elements[:MAX_ELEMENTS]
    key = _key(req)
    if (hit := cache.get(ENDPOINT, key)) is not None:
        step = NavStep.model_validate(hit)
        step.source = "cache"
        return step

    s = get_settings()
    if s.demo_mode:
        return _open_url(req)

    total = Usage()
    for attempt in (0, 1):  # retry once if the model invents an element id
        try:
            resp = await get_swarms().agent_completion(
                agent_name="navigator",
                system_prompt=system_prompt("navigator"),
                task=_task(req, retry=attempt == 1),
                model_name=s.model_navigator,
                max_tokens=s.max_tokens_navigator,
                temperature=0.2,
            )
        except ApiError:
            return _open_url(req)
        u = to_usage(resp)
        total.input_tokens += u.input_tokens
        total.output_tokens += u.output_tokens
        total.total_tokens += u.total_tokens
        total.cost_usd += u.cost_usd
        try:
            step = NavStep.model_validate(_parse(extract_text(resp)))
        except (ValueError, ValidationError):
            continue
        if _valid(step, req):
            if step.action == "open_url" and not step.url:
                step.url = req.goal.url
            step.usage, step.source = total, "live"
            cache.put(ENDPOINT, key, step.model_dump())
            return step
    return _open_url(req)
