from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.rag import rag_answer, rag_stream

router = APIRouter(prefix="/api")


class HistoryItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[HistoryItem] = []
    stream: bool = False


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/chat")
async def chat(req: ChatRequest):
    history = [{"role": h.role, "content": h.content} for h in req.history]

    if req.stream:
        return StreamingResponse(
            rag_stream(req.message, history),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    result = await rag_answer(req.message, history)
    return result
