from fastapi import APIRouter

from app.config import get_settings
from app.data_loader import advisors
from app.models.messages import Advisor

router = APIRouter()


@router.get("/advisors", response_model=list[Advisor])
async def list_advisors() -> list[Advisor]:
    s = get_settings()
    # model_name reflects what we actually call (from .env), not just the JSON default
    return [Advisor.model_validate({**a, "model_name": s.model_for(a["id"])}) for a in advisors()]
