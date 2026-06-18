from dotenv import load_dotenv
load_dotenv() #load envitroment variables from .env file
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from services.weather import get_live_weather
from services.advisor import generate_farm_advice
from services import predictor

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


class PredictRequest(BaseModel):
    action: str  # 'harvest' | 'eggs' | 'biomass' | 'feed_alert' | 'model_predict'
    payload: dict


@app.post("/api/v1/weather-check")
async def check_farm_weather(coords: Coordinates):
    """
    Endpoint for your JS dashboard. Send JSON body {"latitude":..., "longitude":...}
    """
    weather_report = await get_live_weather(latitude=coords.latitude, longitude=coords.longitude)
    return weather_report

@app.post("/api/v1/weather-check-with-advice")
async def check_farm_weather_with_advice(coords: Coordinates):
    weather_report = await get_live_weather(latitude = coords.latitude, longitude = coords.longitude)
    advice = await generate_farm_advice(weather_report)
    return {
        "weather_report": weather_report,
        "farm_advice": advice,
    }


@app.post("/api/v1/predict")
async def predict_endpoint(req: PredictRequest):
    """Unified predictor endpoint. Use `action` to select helper and `payload` for inputs.

    Actions:
    - 'harvest': payload -> batch dict for `predict_harvest_date`
    - 'eggs': payload -> house dict and optional `temp_forecast_c` list
    - 'biomass': payload -> herd dict and optional `days`
    - 'feed_alert': payload -> history list/dict convertible to DataFrame
    """
    try:
        act = req.action.lower()
        p = req.payload or {}
        if act == "harvest":
            return predictor.predict_harvest_date(p)
        if act == "eggs":
            temps = p.get("temp_forecast_c")
            days = p.get("days", 30)
            return predictor.predict_egg_trajectory(p, temp_forecast_c=temps, days=days)
        if act == "biomass":
            days = p.get("days", 30)
            return predictor.predict_batch_biomass(p, days=days)
        if act == "feed_alert":
            # accept list of records or a simple DataFrame-like dict
            hist = p.get("history")
            import pandas as pd
            df = pd.DataFrame(hist) if isinstance(hist, (list, dict)) else pd.DataFrame(hist)
            return predictor.detect_feed_efficiency_drop(df)

        return {"error": f"unknown action '{req.action}'"}
    except Exception as e:
        return {"error": "predictor error", "detail": str(e)}
