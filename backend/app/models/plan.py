"""Shape the panel expects for GET /programs/{id}/plan (frontend/lib/types.ts ProgramPlan)."""

from typing import Literal

from pydantic import BaseModel, Field


class PlanCourse(BaseModel):
    code: str
    name: str
    credits: float | None = None
    kind: Literal["program", "gen_ed"] = "program"
    prerequisites: list[str] = Field(default_factory=list)


class PickGroup(BaseModel):
    id: str | None = None
    title: str | None = None
    pick: int = 1
    options: list[PlanCourse] = Field(default_factory=list)


class PlanSemester(BaseModel):
    name: str | None = None
    credits: float | None = None
    courses: list[PlanCourse] = Field(default_factory=list)
    pick_groups: list[PickGroup] = Field(default_factory=list)


class ProgramPlan(BaseModel):
    program_id: str
    program_name: str
    credential: str | None = None
    official_url: str
    total_credits: float | None = None
    estimate: bool | None = None
    semesters: list[PlanSemester]
