"""Disk cache keyed by sha256(endpoint + normalized request)."""

import hashlib
import json
from typing import Any

from app.config import get_settings


def _key(endpoint: str, payload: dict) -> str:
    norm = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(f"{endpoint}|{norm}".encode()).hexdigest()


def get(endpoint: str, payload: dict) -> Any | None:
    p = (
        get_settings().cache_path
        / endpoint.strip("/").replace("/", "_")
        / f"{_key(endpoint, payload)}.json"
    )
    if p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    return None


def put(endpoint: str, payload: dict, value: Any) -> None:
    d = get_settings().cache_path / endpoint.strip("/").replace("/", "_")
    d.mkdir(parents=True, exist_ok=True)
    (d / f"{_key(endpoint, payload)}.json").write_text(
        json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def normalize_history(history: list[dict]) -> list[dict]:
    """Ignore ids/timestamps/usage so the same conversation hits the same cache entry."""
    return [
        {
            "role": m.get("role"),
            "advisor_id": m.get("advisor_id"),
            "text": (m.get("text") or "").strip(),
        }
        for m in history
    ]
