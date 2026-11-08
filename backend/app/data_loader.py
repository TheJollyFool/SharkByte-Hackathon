"""Loads data/*.json once. Diego owns data/ — we only read it."""

import json
from functools import lru_cache
from typing import Any

from app.config import DATA_DIR, FIXTURES_DIR


def _load(path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return []


@lru_cache
def data(name: str) -> Any:
    """name = 'advisors' | 'careers' | 'mdc_programs' | 'costs' | 'financial_aid' | ..."""
    return _load(DATA_DIR / f"{name}.json")


@lru_cache
def fixture(name: str) -> Any:
    return _load(FIXTURES_DIR / name)


def advisors() -> list[dict]:
    return sorted(data("advisors"), key=lambda a: a.get("order", 99))


def advisor_by_id(advisor_id: str) -> dict | None:
    return next((a for a in advisors() if a["id"] == advisor_id), None)


def relevant_programs(text: str, limit: int = 8) -> list[dict]:
    """Only inject MDC programs relevant to the career being discussed (tokens = credits)."""
    text = text.lower()
    careers = data("careers") or []
    hit_ids = {
        c["id"]
        for c in careers
        if c.get("id", "").replace("-", " ") in text
        or any(k.lower() in text for k in c.get("keywords", []))
        or c.get("title", "").lower() in text
    }
    programs = [
        p for p in data("mdc_programs") or [] if not str(p.get("id", "")).startswith("TODO")
    ]
    if hit_ids:
        programs = [p for p in programs if hit_ids & set(p.get("careers", []))]
    return programs[:limit]
