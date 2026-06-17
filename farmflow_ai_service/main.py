from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from services.weather import get_live_weather

app = FastAPI(
    title='FarmFlow AI Service',
    description='Claude-powered farm advisor and weather-yield forecasting engine for FarmFlow.',
    version='1.0.0',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online", "message": "FarmFlow AI Engine Ready."}

class Coordinates(BaseModel):
    latitude: float
    longitude: float


@app.post("/api/v1/weather-check")
async def check_farm_weather(coords: Coordinates):
    """
    Endpoint for your JS dashboard. Send JSON body {"latitude":..., "longitude":...}
    """
    weather_report = await get_live_weather(latitude=coords.latitude, longitude=coords.longitude)
    return weather_report
