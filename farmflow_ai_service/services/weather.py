import httpx
import logging

logger = logging.getLogger(__name__)

async def get_live_weather(latitude: float, longitude: float):
    """
    Fetches free 7-day weather forecast from Open-Meteo 
    using the farm's exact map coordinates.
    """
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}&longitude={longitude}"
        "&daily=temperature_2m_max,rain_sum&timezone=auto"
    )

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

            temperatures = data["daily"]["temperature_2m_max"]
            rainfall = data["daily"]["rain_sum"]

            avg_temp = sum(temperatures) / len(temperatures)
            total_rain = sum(rainfall)

            return {
                "avg_predicted_temp_c": round(avg_temp, 1),
                "total_predicted_rain_mm": round(total_rain, 1),
                "status": "Success"
            }
        except Exception as e:
            logger.error(f"Weather fetch failed for ({latitude}, {longitude}): {e}")
            return {
                "avg_predicted_temp_c": 24.0,
                "total_predicted_rain_mm": 10.0,
                "status": "Error: Using fallback weather metrics"
            }