from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.models.messages import Language, Source, Usage

Action = Literal["click", "type", "scroll", "done", "open_url"]


class Goal(BaseModel):
    label: str
    kind: str | None = None
    url: str | None = None
    step_id: str | None = None


class PageElement(BaseModel):
    id: str
    tag: str | None = None
    text: str | None = None
    href: str | None = None
    type: str | None = None
    placeholder: str | None = None


class Page(BaseModel):
    url: str
    title: str | None = None
    elements: list[PageElement] = Field(default_factory=list)


class NavStep(BaseModel):
    action: Action
    element_id: str | None = None
    text_to_type: str | None = None
    url: str | None = None
    bubble: str = ""
    usage: Usage | None = None
    source: Source | None = None

    @field_validator("element_id", "text_to_type", "url", mode="before")
    @classmethod
    def _empty_to_none(cls, v: object) -> object:
        return None if isinstance(v, str) and not v.strip() else v


class NavigateRequest(BaseModel):
    goal: Goal
    language: Language = "en"
    page: Page
    previous_steps: list[NavStep] = Field(default_factory=list)
