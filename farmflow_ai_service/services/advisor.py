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
    prompt = (
        "You are a farm advisor. Based on this 7-day weather forecast summary, "
        "give 2-3 short, practical farming recommendations covering irrigation "
        "timing and any frost, heat, or flood risk.\n\n"
        f"Average predicted high temperature: {weather_report['avg_predicted_temp_c']}°C\n"
        f"Total predicted rainfall: {weather_report['total_predicted_rain_mm']}mm\n\n"
        "Keep it under 80 words, plain language, no markdown."
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