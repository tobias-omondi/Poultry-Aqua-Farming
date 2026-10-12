import os

from dotenv import load_dotenv

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "ChakFarm")

# Create a key in Google AI Studio. Confirm the current model name there too.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")

DJANGO_API_URL = os.getenv("DJANGO_API_URL", "http://127.0.0.1:8000/api").rstrip("/")

# Local testing only. If a request has no login token, this shared Django token is used,
# which means everyone who can reach this service sees that one account's data.
# Leave it unset in production.
DEV_DJANGO_TOKEN = os.getenv("DEV_DJANGO_TOKEN")

CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000",
    ).split(",")
    if o.strip()
]

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the environment variables.")