import json
from typing import Optional

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from .ai_advisor import (
    analyze_chicken_image,
    chat,
    get_auto_insights,
    prepare_chat,
    stream_chat,
)

router = APIRouter(prefix="/ai", tags=["AI Advisor"])

MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[dict] = []
    batch_id: Optional[int] = None


@router.post("/chat")
async def chat_endpoint(req: ChatRequest, authorization: Optional[str] = Header(None)):
    """Standard chat. Returns the full answer."""
    text = await chat(req.message, req.history, req.batch_id, authorization)
    return {"response": text, "role": "assistant"}


@router.post("/chat/stream")
async def stream_endpoint(req: ChatRequest, authorization: Optional[str] = Header(None)):
    """Streaming chat. Each event is JSON: {"text": "..."}, then "[DONE]" at the end."""
    # Load data first so login and connection problems return a proper HTTP error.
    contents, config = await prepare_chat(req.message, req.history, req.batch_id, authorization)

    async def generator():
        try:
            async for chunk in stream_chat(contents, config):
                yield f"data: {json.dumps({'text': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception:
            yield f"data: {json.dumps({'error': 'The AI service is unavailable. Try again shortly.'})}\n\n"

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/insights")
async def insights_endpoint(authorization: Optional[str] = Header(None)):
    """Auto-generated farm insights. No question needed."""
    return await get_auto_insights(authorization)


@router.post("/analyze-image")
async def analyze_image_endpoint(
    file: UploadFile = File(...),
    batch_id: Optional[int] = Form(None),
    age_days: Optional[int] = Form(None),
    authorization: Optional[str] = Header(None),
):
    """Look at a chicken photo. Guidance only, not a diagnosis."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(415, "Only JPG and PNG images are accepted")
    data = await file.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image is too large. Resize it and try again")
    return await analyze_chicken_image(data, file.content_type, age_days, batch_id)


@router.get("/health")
async def health():
    return {"status": "ok", "service": "AI Advisor"}