from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import APP_NAME, CORS_ORIGINS
from .routes import router

app = FastAPI(
    title=f"{APP_NAME} AI Service",
    description="Gemini-powered farm advisor",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def root():
    return {"service": f"{APP_NAME} AI", "status": "running"}