from fastapi import APIRouter

from app.models.messages import MixtureRequest, MixtureResponse
from app.services import mixture_service

router = APIRouter()


@router.post("/mixture", response_model=MixtureResponse, response_model_exclude_none=True)
async def mixture(req: MixtureRequest) -> MixtureResponse:
    return await mixture_service.run(req)
