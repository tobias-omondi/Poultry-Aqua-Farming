import os
import asyncio
from typing import Optional
from google import genai

# Read API key with getenv so import doesn't raise if unset.
_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client: Optional[genai.Client]
if _GEMINI_API_KEY:
    client = genai.Client(api_key=_GEMINI_API_KEY)
else:
    client = None


async def generate_farm_advice(weather_report: dict) -> str:
    """Generate short, animal-focused farm advice from a weather summary.

    The `weather_report` may include an `animal` key with values like
    'kienyeji_chicken', 'goats', or 'both'. If absent, advice will cover
    both kienyeji chickens and goats in brief.
    """
    animal = (weather_report.get("animal") or "both").lower()
    temp = weather_report.get("avg_predicted_temp_c", "unknown")
    rain = weather_report.get("total_predicted_rain_mm", "unknown")

    base = (
        "You are a practical smallholder farm advisor for kienyeji chickens and goats. "
        "Based on this 7-day weather forecast, give 2-3 short, actionable recommendations focused on animal welfare: "
        "shelter/ventilation, feeding/water adjustments, movement and disease risk (heat, cold, flooding).\n\n"
    )

    if animal in ("kienyeji", "kienyeji_chicken", "chicken", "chickens"):
        focus = (
            "Focus on kienyeji chickens: brooder/coop ventilation, heat stress mitigation, "
            "protecting eggs and chicks, and short feeding adjustments.\n\n"
        )
    elif animal in ("goat", "goats"):
        focus = (
            "Focus on goats: shelter from heavy rain, prevent mud/footrot, conserve body heat, "
            "and monitor feed conversion.\n\n"
        )
    else:
        focus = "Cover both kienyeji chickens and goats with concise, separate tips.\n\n"

    prompt = (
        base
        + focus
        + f"Average predicted high temperature: {temp}°C\n"
        + f"Total predicted rainfall: {rain}mm\n\n"
        + "Keep it under 80 words, plain language, no markdown."
    )

    if client is None:
        return "AI advisor unavailable: GEMINI_API_KEY not set. Showing raw forecast only."

    max_attempts = 3
    backoff = 1.0
    for attempt in range(1, max_attempts + 1):
        try:
            response = await client.aio.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.text
        except Exception as e:
            err_text = str(e)
            transient = any(code in err_text for code in ("503", "UNAVAILABLE", "429", "TOO_MANY_REQUESTS"))
            if attempt >= max_attempts or not transient:
                try:
                    import traceback, sys

                    traceback.print_exc()
                except Exception:
                    pass
                return "AI advisor unavailable right now. Showing raw forecast only."

            await asyncio.sleep(backoff)
            backoff *= 2