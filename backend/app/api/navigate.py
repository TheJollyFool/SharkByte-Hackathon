from fastapi import APIRouter

from app.models.navigate import NavigateRequest, NavStep
from app.services import navigate_service

router = APIRouter()


@router.post("/navigate", response_model=NavStep, response_model_exclude_none=True)
async def navigate(req: NavigateRequest) -> NavStep:
    return await navigate_service.next_step(req)
