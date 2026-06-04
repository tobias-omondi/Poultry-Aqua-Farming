from dotenv import load_dotenv
import os

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
DJANGO_API_URL = os.getenv("DJANGO_API_URL", 'http://127.0.0.1:8000/api')
DJANGO_API_TOKEN = os.getenv("DJANGO_API_TOKEN")

if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY is not set in the environment variables.")

if not DJANGO_API_URL:
    raise ValueError("DJANGO_API_URL is not set in the environment variables.")

if not DJANGO_API_TOKEN:
    raise ValueError("DJANGO_API_TOKEN is not set in the environment variables.")