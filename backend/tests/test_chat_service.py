from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.models.errors import ApiError
from app.models.messages import ChatReplyRequest, Message
from app.services import chat_service


@pytest.mark.parametrize("demo_mode", [True, False])
async def test_uncached_chat_turn_reports_unavailable(
    monkeypatch: pytest.MonkeyPatch, demo_mode: bool
) -> None:
    request = ChatReplyRequest(
        advisor_id="career",
        history=[Message(role="student", text="I want to study data science")],
    )
    settings = SimpleNamespace(
        demo_mode=demo_mode,
        model_for=lambda _: "test",
        model_fallback="backup",
        max_tokens_chat=100,
    )
    completion = AsyncMock(side_effect=ApiError("upstream_failed", "Swarms unavailable"))
    monkeypatch.setattr(chat_service.cache, "get", lambda *_: None)
    monkeypatch.setattr(chat_service, "get_settings", lambda: settings)
    monkeypatch.setattr(
        chat_service, "get_swarms", lambda: SimpleNamespace(agent_completion=completion)
    )
    monkeypatch.setattr(chat_service, "system_prompt", lambda _: "")
    monkeypatch.setattr(chat_service, "chat_task", lambda *_: "")

    with pytest.raises(ApiError) as error:
        await chat_service.reply(request)

    assert error.value.code == "upstream_failed"
    # live: the advisor's model, then the backup model, then the error
    assert completion.await_count == (0 if demo_mode else 2)
