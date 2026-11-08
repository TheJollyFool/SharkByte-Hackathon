"""Mirror of shared/roadmap.schema.json. Change only together with the panel owner."""

from typing import Literal

from pydantic import BaseModel, Field

from app.models.messages import Language, Message, Source


class Career(BaseModel):
    title: str
    overview: str
    responsibilities: list[str] = Field(default_factory=list)
    qualifications: list[str] = Field(default_factory=list)
    median_salary_usd: float | None = None
    outlook: str | None = None
    related_careers: list[str] = Field(default_factory=list)


class Step(BaseModel):
    id: str
    order: int
    kind: Literal[
        "mdc_program", "certification", "exam", "internship", "transfer", "degree", "other"
    ]
    institution: str
    credential: str
    duration_months: float
    cost_usd: float
    program_id: str | None = None
    program_name: str | None = None
    estimate: bool | None = None
    transfer_agreement: str | None = None
    key_courses: list[str] = Field(default_factory=list)
    source_url: str | None = None


class WorkforceEntry(BaseModel):
    after_step: int
    job_title: str
    salary_range_usd: str | None = None


class Credential(BaseModel):
    name: str
    type: Literal["certification", "license", "degree", "other"] | None = None
    required: bool | None = None


class Route(BaseModel):
    id: str
    name: str
    type: Literal["short", "medium", "long"]
    summary: str | None = None
    total_months: float
    total_cost_usd: float
    steps: list[Step] = Field(min_length=1)
    workforce_entry_points: list[WorkforceEntry] = Field(default_factory=list)
    credentials: list[Credential] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    exams: list[str] = Field(default_factory=list)
    net_cost_after_aid_usd: float | None = None


class AlternativeProgram(BaseModel):
    name: str
    program_id: str | None = None
    why: str | None = None


class Resource(BaseModel):
    title: str
    url: str | None = None
    kind: Literal["exam_prep", "resume", "interview", "financial_aid", "other"] | None = None


class RoadmapUsage(BaseModel):
    total_tokens: int = 0
    total_cost_usd: float = 0.0


class Roadmap(BaseModel):
    id: str | None = None
    source: Source | None = None
    mode: Literal["group_chat", "mixture"] | None = None
    language: Language | None = None
    career: Career
    routes: list[Route] = Field(min_length=1, max_length=4)
    alternative_mdc_programs: list[AlternativeProgram] = Field(default_factory=list)
    resources: list[Resource] = Field(default_factory=list)
    usage: RoadmapUsage | None = None
    warnings: list[str] = Field(default_factory=list)


class RoadmapRequest(BaseModel):
    mode: Literal["group_chat", "mixture"] = "group_chat"
    language: Language = "en"
    history: list[Message] = Field(default_factory=list)
