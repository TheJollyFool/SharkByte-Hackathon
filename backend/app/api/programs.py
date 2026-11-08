from fastapi import APIRouter

from app.models.plan import ProgramPlan
from app.services import plan_service

router = APIRouter()


@router.get(
    "/programs/{program_id}/plan", response_model=ProgramPlan, response_model_exclude_none=True
)
async def program_plan(program_id: str) -> ProgramPlan:
    return plan_service.get_plan(program_id)
