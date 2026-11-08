"""Disk cache keyed by sha256(endpoint + normalized request)."""

import hashlib
import json
from typing import Any

from app.config import REPO_ROOT, get_settings

# Committed to git: answers pre-generated for the demo script. Read-only fallback, so the demo
# survives Render wiping its disk. Fill it with: python -m scripts.warm_demo
DEMO_CACHE = REPO_ROOT / "backend" / "demo_cache"


def _key(endpoint: str, payload: dict) -> str:
    norm = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(f"{endpoint}|{norm}".encode()).hexdigest()


def _dir(endpoint: str, root=None):
    return (root or get_settings().cache_path) / endpoint.strip("/").replace("/", "_")


def get(endpoint: str, payload: dict) -> Any | None:
    name = f"{_key(endpoint, payload)}.json"
    for root in (get_settings().cache_path, DEMO_CACHE):
        p = _dir(endpoint, root) / name
        if p.exists():
            return json.loads(p.read_text(encoding="utf-8"))
    return None


def put(endpoint: str, payload: dict, value: Any) -> None:
    d = _dir(endpoint)
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
