"""POST /roadmap: Roadmap Writer -> validate -> 1 repair -> closest fixture fallback."""

import hashlib
import json
import re

from pydantic import ValidationError

from app.config import FIXTURES_DIR, get_settings
from app.data_loader import data
from app.models.errors import ApiError
from app.models.messages import Usage
from app.models.roadmap import Roadmap, RoadmapRequest, RoadmapUsage
from app.services import cache
from app.swarm.builders import roadmap_task
from app.swarm.client import extract_text, get_swarms, to_usage
from app.swarm.prompts import system_prompt

ENDPOINT = "/roadmap"
BY_ID = "/roadmap/by_id"
NON_ROADMAP_FIXTURES = {"chat_reply", "mixture", "navigate"}


def _payload(req: RoadmapRequest) -> dict:
    return {
        "mode": req.mode,
        "language": req.language,
        "history": cache.normalize_history([m.model_dump() for m in req.history]),
    }


def _parse_json(text: str) -> dict:
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object in output")
    return json.loads(text[start : end + 1])


def _mdc_programs() -> dict[str, dict]:
    return {
        p["id"]: p
        for p in data("mdc_programs") or []
        if p.get("id") and not str(p["id"]).startswith("TODO")
    }


def _check_and_fix(rm: Roadmap) -> list[str]:
    """Golden rule 2: first step of every route = a real MDC program. Copies source_url."""
    programs = _mdc_programs()
    problems: list[str] = []
    for route in rm.routes:
        route.id = route.type
        for i, step in enumerate(route.steps):
            step.id, step.order = f"{route.id}-{i}", i
            if step.program_id in programs:
                step.source_url = programs[step.program_id].get("source_url", step.source_url)
        first = route.steps[0]
        if first.kind != "mdc_program":
            problems.append(f"route {route.id}: first step kind must be 'mdc_program'")
        if programs and first.program_id not in programs:
            problems.append(
                f"route {route.id}: first step program_id {first.program_id!r} is not in MDC DATA "
                f"(valid ids: {sorted(programs)})"
            )
    if not programs and not any("data" in w.lower() for w in rm.warnings):
        rm.warnings.append(
            "MDC program data is still being curated — program details are estimates."
        )
    return problems


def _validate(text: str) -> tuple[Roadmap | None, str]:
    try:
        rm = Roadmap.model_validate(_parse_json(text))
    except (ValueError, ValidationError) as e:
        return None, str(e)[:1500]
    problems = _check_and_fix(rm)
    return (None, "; ".join(problems)) if problems else (rm, "")


def _fallback(req: RoadmapRequest) -> Roadmap | None:
    """Closest fixture by career keywords found in the conversation."""
    text = " ".join(m.text for m in req.history).lower()
    best, best_score = None, -1
    for f in sorted(FIXTURES_DIR.glob("*.json")):
        stem = f.stem.split(".")[0]
        if stem in NON_ROADMAP_FIXTURES:
            continue
        try:
            rm = Roadmap.model_validate_json(f.read_text(encoding="utf-8"))
        except (ValidationError, ValueError):
            continue
        words = {stem.replace("-", " "), *rm.career.title.lower().split()}
        score = sum(1 for w in words if w and w in text)
        if score > best_score:
            best, best_score = rm, score
    if best:
        best.source, best.mode, best.language = "fallback", req.mode, req.language
    return best


def _store(rm: Roadmap, key: dict) -> Roadmap:
    cache.put(ENDPOINT, key, rm.model_dump())
    cache.put(BY_ID, {"id": rm.id}, rm.model_dump())
    return rm


async def generate(req: RoadmapRequest) -> Roadmap:
    key = _payload(req)
    if (hit := cache.get(ENDPOINT, key)) is not None:
        rm = Roadmap.model_validate(hit)
        rm.source = "cache"
        return rm

    s = get_settings()
    if s.demo_mode:
        if fb := _fallback(req):
            return fb
        raise ApiError("upstream_failed", "DEMO_MODE on and no cached roadmap")

    swarms = get_swarms()
    total = Usage()

    def add(u: Usage) -> None:
        total.input_tokens += u.input_tokens
        total.output_tokens += u.output_tokens
        total.total_tokens += u.total_tokens
        total.cost_usd += u.cost_usd

    try:
        resp = await swarms.agent_completion(
            agent_name="roadmap-writer",
            system_prompt=system_prompt("roadmap-writer"),
            task=roadmap_task(req.language, req.history),
            model_name=s.model_writer,
            max_tokens=s.max_tokens_writer,
            temperature=0.3,
        )
        add(to_usage(resp))
        raw = extract_text(resp)
        rm, err = _validate(raw)
        if rm is None:  # one repair call
            fix = await swarms.agent_completion(
                agent_name="json-repair",
                system_prompt=system_prompt("json-repair"),
                task=f"ERRORS:\n{err}\n\nJSON:\n{raw}",
                model_name=s.model_writer,
                max_tokens=s.max_tokens_writer,
                temperature=0.0,
            )
            add(to_usage(fix))
            rm, err = _validate(extract_text(fix))
    except ApiError:
        if fb := _fallback(req):
            return fb
        raise

    if rm is None:
        if fb := _fallback(req):
            return fb
        raise ApiError("upstream_failed", f"Roadmap Writer output invalid: {err[:200]}")

    rm.id = "rm-" + hashlib.sha256(json.dumps(key, sort_keys=True).encode()).hexdigest()[:12]
    rm.source, rm.mode, rm.language = "live", req.mode, req.language
    rm.usage = RoadmapUsage(
        total_tokens=total.total_tokens, total_cost_usd=round(total.cost_usd, 6)
    )
    return _store(rm, key)


def get_by_id(roadmap_id: str) -> Roadmap:
    if (hit := cache.get(BY_ID, {"id": roadmap_id})) is not None:
        return Roadmap.model_validate(hit)
    raise ApiError("not_found", f"roadmap {roadmap_id} not found")
