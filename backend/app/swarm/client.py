"""Thin async client for the Swarms API. Only the backend holds the key."""

from typing import Any

import httpx

from app.config import get_settings
from app.models.errors import ApiError
from app.models.messages import Usage


class SwarmsClient:
    def __init__(self) -> None:
        s = get_settings()
        self._client = httpx.AsyncClient(
            base_url=s.swarms_base_url,
            headers={"x-api-key": s.swarms_api_key, "Content-Type": "application/json"},
            timeout=s.swarms_timeout_s,
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    async def _request(self, method: str, path: str, **kw: Any) -> dict:
        if not get_settings().swarms_api_key:
            raise ApiError("upstream_failed", "SWARMS_API_KEY is not set in .env")
        try:
            r = await self._client.request(method, path, **kw)
        except httpx.TimeoutException as e:
            raise ApiError("timeout", f"Swarms timed out on {path}") from e
        except httpx.HTTPError as e:
            raise ApiError("upstream_failed", f"Swarms request failed: {e}") from e
        if r.status_code >= 400:
            raise ApiError("upstream_failed", f"Swarms {r.status_code} on {path}: {r.text[:300]}")
        return r.json()

    async def models_available(self) -> dict:
        return await self._request("GET", "/v1/models/available")

    async def agent_completion(
        self,
        *,
        agent_name: str,
        system_prompt: str,
        task: str,
        model_name: str,
        max_tokens: int,
        temperature: float = 0.5,
    ) -> dict:
        body = {
            "agent_config": {
                "agent_name": agent_name,
                "system_prompt": system_prompt,
                "model_name": model_name,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "max_loops": 1,
            },
            "task": task,
        }
        return await self._request("POST", "/v1/agent/completions", json=body)

    async def swarm_completion(self, body: dict) -> dict:
        return await self._request("POST", "/v1/swarm/completions", json=body)


def extract_text(resp: dict) -> str:
    """Pull the final text out of a Swarms response. Shape verified on first real call —
    see docs/AGENT_PIPELINE.md 'Observed responses'. Handles str / list-of-messages / dict."""
    out = resp.get("outputs", resp.get("output"))
    return _flatten(out).strip()


def _flatten(out: Any) -> str:
    if out is None:
        return ""
    if isinstance(out, str):
        return out
    if isinstance(out, list):
        # list of {"role": ..., "content": ...}: take the last non-user message
        for item in reversed(out):
            if isinstance(item, dict) and item.get("role", "").lower() not in ("user", "human"):
                return _flatten(item.get("content", item))
        return _flatten(out[-1]) if out else ""
    if isinstance(out, dict):
        for k in ("content", "output", "text", "response"):
            if k in out:
                return _flatten(out[k])
    return str(out)


def to_usage(resp: dict) -> Usage:
    u = resp.get("usage") or {}
    inp = int(u.get("input_tokens") or u.get("prompt_tokens") or 0)
    outp = int(u.get("output_tokens") or u.get("completion_tokens") or 0)
    cost = u.get("total_cost", u.get("cost_usd", 0.0))
    if isinstance(cost, dict):  # some versions nest cost breakdowns
        cost = cost.get("total_cost", 0.0)
    return Usage(
        input_tokens=inp,
        output_tokens=outp,
        total_tokens=int(u.get("total_tokens") or inp + outp),
        cost_usd=float(cost or 0.0),
    )


_client: SwarmsClient | None = None


def get_swarms() -> SwarmsClient:
    global _client
    if _client is None:
        _client = SwarmsClient()
    return _client
