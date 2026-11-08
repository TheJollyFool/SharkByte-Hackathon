from datetime import UTC, datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field

Language = Literal["en", "es"]
Source = Literal["live", "cache", "fallback"]
AdvisorId = Literal["career", "pathway", "cost", "prodev", "alternatives", "finaid"]


class Advisor(BaseModel):
    id: AdvisorId
    name: str
    role: str
    mdc_section: str
    emoji: str
    color: str
    order: int
    model_name: str


class Usage(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    cost_usd: float = 0.0


class Message(BaseModel):
    id: str = Field(default_factory=lambda: f"msg-{uuid4().hex[:12]}")
    role: Literal["student", "advisor", "aggregator"]
    advisor_id: AdvisorId | None = None
    contributors: list[AdvisorId] | None = None
    text: str
    usage: Usage | None = None
    source: Source | None = None
    created_at: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())


class ChatReplyRequest(BaseModel):
    advisor_id: AdvisorId
    group: list[AdvisorId] = Field(default_factory=list)
    language: Language = "en"
    history: list[Message] = Field(default_factory=list)


class MixtureRequest(BaseModel):
    advisors: list[AdvisorId]
    language: Language = "en"
    history: list[Message] = Field(default_factory=list)


class MixtureResponse(BaseModel):
    message: Message
    per_agent_usage: dict[str, Usage] = Field(default_factory=dict)
