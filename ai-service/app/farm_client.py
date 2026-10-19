import asyncio
from typing import Optional

import httpx
from fastapi import HTTPException

from .config import DEV_DJANGO_TOKEN, DJANGO_API_URL

# name -> (Django path, value to use if that section cannot be loaded)
SECTIONS = {
    "batches": ("/chickens/batches/", []),
    "summary": ("/financials/summary/", {}),
    "alerts": ("/inventory/alerts/", {}),
    "costs": ("/financials/costs/", []),
    "houses": ("/housing/", []),
    "feed": ("/inventory/feed/", []),
}


def auth_headers(authorization: Optional[str]) -> dict:
    """Use the farmer's own token so Django decides what they can see."""
    if authorization:
        return {"Authorization": authorization}
    if DEV_DJANGO_TOKEN:
        return {"Authorization": f"Bearer {DEV_DJANGO_TOKEN}"}
    raise HTTPException(401, "Missing Authorization header")


def _unwrap(data):
    """Django REST Framework wraps paginated lists as {"count": ..., "results": [...]}."""
    if isinstance(data, dict) and isinstance(data.get("results"), list):
        return data["results"]
    return data


async def _get(http: httpx.AsyncClient, path: str, headers: dict):
    resp = await http.get(f"{DJANGO_API_URL}{path}", headers=headers)
    if resp.status_code in (401, 403):
        raise HTTPException(resp.status_code, "Django rejected the login token")
    if resp.status_code != 200:
        return None
    return _unwrap(resp.json())


async def get_farm_data(authorization: Optional[str] = None) -> dict:
    """Fetch everything the advisor reasons over. Sections that fail are listed in 'missing'."""
    headers = auth_headers(authorization)
    async with httpx.AsyncClient(timeout=10.0) as http:
        try:
            results = await asyncio.gather(
                *(_get(http, path, headers) for path, _ in SECTIONS.values())
            )
        except httpx.RequestError as exc:
            raise HTTPException(503, "Could not reach the farm data service") from exc

    data, missing = {}, []
    for (name, (_, default)), result in zip(SECTIONS.items(), results):
        if result is None:
            data[name] = default
            missing.append(name)
        else:
            data[name] = result
    data["missing"] = missing
    return data


async def get_batch_detail(batch_id: int, authorization: Optional[str] = None) -> dict:
    """Deep data for one batch, including daily logs."""
    headers = auth_headers(authorization)
    base = f"/chickens/batches/{batch_id}"
    async with httpx.AsyncClient(timeout=60.0) as http:
        try:
            batch, logs = await asyncio.gather(
                _get(http, f"{base}/summary/", headers),
                _get(http, f"{base}/logs/", headers),
            )
        except httpx.RequestError as exc:
            raise HTTPException(503, "Could not reach the farm data service") from exc
    return {"batch": batch or {}, "logs": logs or []}