"""Loads data/*.json once. Diego owns data/ — we only read it."""

import json
import re
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


_SLIM = (
    "id", "name", "credential", "credits", "typical_months_full_time",
    "careers", "key_courses", "stackable_into", "source_url", "estimate",
)  # fmt: skip
_RANK = {"A.S.": 0, "College Credit Certificate": 1, "A.A.": 2, "B.S.": 3, "B.A.S.": 3}


def _hits(term: str, text: str) -> bool:
    return bool(term) and re.search(rf"(?<![a-z]){re.escape(term.lower())}", text) is not None


def matched_careers(text: str) -> set[str]:
    """Career ids whose keywords appear in the text; only the best-scoring ones are kept."""
    text = text.lower()
    scores: dict[str, int] = {}
    for c in data("careers") or []:
        terms = [*c.get("keywords", []), c.get("title", ""), c.get("id", "").replace("-", " ")]
        n = sum(1 for t in terms if _hits(t, text))
        if n:
            scores[c["id"]] = n
    if not scores:
        return set()
    top = max(scores.values())
    return {cid for cid, n in scores.items() if n >= max(1, top - 1) and n > 0}


def relevant_programs(text: str, limit: int = 8) -> list[dict]:
    """Only inject MDC programs relevant to the career being discussed (tokens = credits).
    Slim fields only; short credentials (A.S., certificates) first since routes start at MDC."""
    ids = matched_careers(text)
    programs = [
        p for p in data("mdc_programs") or [] if not str(p.get("id", "")).startswith("TODO")
    ]
    if not ids:
        return []  # no career recognised: inject nothing rather than random programs
    programs = [p for p in programs if ids & set(p.get("careers", []))]
    programs.sort(key=lambda p: (_RANK.get(p.get("credential", ""), 4), p.get("credits") or 0))
    return [{k: p[k] for k in _SLIM if k in p} for p in programs[:limit]]
