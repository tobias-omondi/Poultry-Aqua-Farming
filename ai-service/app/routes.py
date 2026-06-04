from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from .ai_advisor import chat, stream_chat, get_auto_insights

router = APIRouter(prefix='/ai', tags=['AI Advisor'])


class ChatRequest(BaseModel):
    message: str
    history: list = []
    batch_id: Optional[int] = None
    stream: bool = False


@router.post('/chat')
async def chat_endpoint(req: ChatRequest):
    """Standard chat — returns full response."""
    try:
        response = await chat(req.message, req.history, req.batch_id)
        return {'response': response, 'role': 'assistant'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/chat/stream')
async def stream_endpoint(req: ChatRequest):
    """Streaming chat — streams response token by token."""
    async def generator():
        try:
            async for chunk in stream_chat(req.message, req.history, req.batch_id):
                yield f'data: {chunk}\n\n'
            yield 'data: [DONE]\n\n'
        except Exception as e:
            yield f'data: [ERROR] {str(e)}\n\n'

    return StreamingResponse(
        generator(),
        media_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
        }
    )


@router.get('/insights')
async def insights_endpoint():
    """Auto-generated farm insights — no question needed."""
    try:
        insights = await get_auto_insights()
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/health')
async def health():
    return {'status': 'ok', 'service': 'FarmFlow AI'}