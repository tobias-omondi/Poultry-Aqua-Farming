import httpx
from .config import DJANGO_API_URL, DJANGO_API_TOKEN

HEADERS = {'Authorization': f'Bearer {DJANGO_API_TOKEN}'}


async def get_farm_data() -> dict:
    """
    Fetches all relevant farm data from Django APIs.
    This becomes the context Claude reasons over.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            batches_res = await client.get(f'{DJANGO_API_URL}/chickens/batches/', headers=HEADERS)
            summary_res = await client.get(f'{DJANGO_API_URL}/financials/summary/', headers=HEADERS)
            alerts_res  = await client.get(f'{DJANGO_API_URL}/inventory/alerts/', headers=HEADERS)
            costs_res   = await client.get(f'{DJANGO_API_URL}/financials/costs/', headers=HEADERS)
            houses_res  = await client.get(f'{DJANGO_API_URL}/housing/', headers=HEADERS)
            feed_res    = await client.get(f'{DJANGO_API_URL}/inventory/feed/', headers=HEADERS)

            return {
                'batches':  batches_res.json() if batches_res.status_code == 200 else [],
                'summary':  summary_res.json() if summary_res.status_code == 200 else {},
                'alerts':   alerts_res.json()  if alerts_res.status_code  == 200 else {},
                'costs':    costs_res.json()   if costs_res.status_code   == 200 else [],
                'houses':   houses_res.json()  if houses_res.status_code  == 200 else [],
                'feed':     feed_res.json()    if feed_res.status_code    == 200 else [],
            }
        except httpx.RequestError as e:
            return {'error': str(e)}


async def get_batch_detail(batch_id: int) -> dict:
    """Fetch deep data for a specific batch including daily logs."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            batch_res   = await client.get(f'{DJANGO_API_URL}/chickens/batches/{batch_id}/summary/', headers=HEADERS)
            logs_res    = await client.get(f'{DJANGO_API_URL}/chickens/batches/{batch_id}/logs/', headers=HEADERS)
            return {
                'batch': batch_res.json() if batch_res.status_code == 200 else {},
                'logs':  logs_res.json()  if logs_res.status_code  == 200 else [],
            }
        except httpx.RequestError as e:
            return {'error': str(e)}