from fastapi import APIRouter

from app.models.roadmap import Roadmap, RoadmapRequest
from app.services import roadmap_service

router = APIRouter()


@router.post("/roadmap", response_model=Roadmap, response_model_exclude_none=True)
async def create_roadmap(req: RoadmapRequest) -> Roadmap:
    return await roadmap_service.generate(req)


@router.get("/roadmap/{roadmap_id}", response_model=Roadmap, response_model_exclude_none=True)
async def get_roadmap(roadmap_id: str) -> Roadmap:
    return roadmap_service.get_by_id(roadmap_id)
