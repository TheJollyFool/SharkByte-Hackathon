from fastapi import APIRouter

from app.models.messages import ChatReplyRequest, Message
from app.services import chat_service

router = APIRouter()


@router.post("/chat/reply", response_model=Message, response_model_exclude_none=True)
async def chat_reply(req: ChatReplyRequest) -> Message:
    return await chat_service.reply(req)
