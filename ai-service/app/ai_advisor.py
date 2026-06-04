import anthropic
import json
from .config import ANTHROPIC_API_KEY
from .farm_client import get_farm_data, get_batch_detail

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


def build_system_prompt(farm_data: dict) -> str:
    """
    Builds a rich system prompt that gives Claude
    full context about the farmer's operation.
    """
    batches = farm_data.get('batches', [])
    summary = farm_data.get('summary', {})
    alerts  = farm_data.get('alerts', {})
    feed    = farm_data.get('feed', [])
    houses  = farm_data.get('houses', [])

    active_batches = [b for b in batches if b.get('status') == 'active']
    low_feed       = alerts.get('low_feed', [])
    low_meds       = alerts.get('low_medications', [])

    return f"""You are FarmFlow AI — an expert farm advisor embedded in FarmFlow, 
a poultry and livestock management platform built for Kenyan farmers.

You have real-time access to this farmer's data. Be specific, practical, and 
speak like a trusted advisor — not a generic chatbot. Use KES for currency.
Keep responses concise and actionable. If you see a problem, say it directly.

━━━ CURRENT FARM DATA ━━━

FINANCIAL SUMMARY:
- Total Revenue: KES {summary.get('total_revenue', 0):,}
- Total Costs:   KES {summary.get('total_costs', 0):,}
- Net Profit:    KES {summary.get('profit', 0):,}
- Status: {'Profitable ✓' if summary.get('is_profitable') else 'Running at loss ✗'}
- Active Batches: {summary.get('active_batches', 0)}
- Closed Batches: {summary.get('closed_batches', 0)}

ACTIVE BATCHES ({len(active_batches)} running):
{json.dumps(active_batches, indent=2) if active_batches else 'No active batches'}

STOCK ALERTS:
- Low feed items: {len(low_feed)} {('⚠ ' + ', '.join(f.get('feed_type','') for f in low_feed)) if low_feed else '✓ None'}
- Low medications: {len(low_meds)} {('⚠ ' + ', '.join(m.get('name','') for m in low_meds)) if low_meds else '✓ None'}

FEED STOCK:
{json.dumps(feed, indent=2) if feed else 'No feed recorded'}

HOUSING:
{json.dumps(houses, indent=2) if houses else 'No houses recorded'}

━━━ YOUR ROLE ━━━
- Answer questions about this specific farm's data
- Proactively flag issues you notice in the data
- Give actionable recommendations (when to buy feed, when to harvest, etc.)
- Explain financial concepts in simple terms when needed
- If asked about profit forecasts, use the current batch data to estimate
- If you don't have enough data to answer something, say so honestly
- Never make up numbers — only reference what's in the data above

Always respond in the same language the farmer uses. 
If they write in Swahili, respond in Swahili.
"""


async def chat(message: str, history: list, batch_id: int = None) -> str:
    """
    Single-turn chat — returns full response.
    Used for simple questions.
    """
    farm_data = await get_farm_data()

    # If a specific batch is referenced, add its detail
    if batch_id:
        batch_detail = await get_batch_detail(batch_id)
        farm_data['batch_detail'] = batch_detail

    system = build_system_prompt(farm_data)

    messages = history + [{'role': 'user', 'content': message}]

    response = client.messages.create(
        model='claude-opus-4-5',
        max_tokens=1024,
        system=system,
        messages=messages,
    )

    return response.content[0].text


async def stream_chat(message: str, history: list, batch_id: int = None):
    """
    Streaming chat — yields text chunks as they arrive.
    Used for the floating chat bubble UI.
    """
    farm_data = await get_farm_data()

    if batch_id:
        batch_detail = await get_batch_detail(batch_id)
        farm_data['batch_detail'] = batch_detail

    system = build_system_prompt(farm_data)
    messages = history + [{'role': 'user', 'content': message}]

    with client.messages.stream(
        model='claude-opus-4-5',
        max_tokens=1024,
        system=system,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield text


async def get_auto_insights() -> dict:
    """
    Proactive insights — Claude analyses the farm
    and returns structured findings without being asked.
    """
    farm_data = await get_farm_data()
    system = build_system_prompt(farm_data)

    prompt = """Analyse this farmer's data and return a JSON object with this exact structure:
{
  "alerts": [
    {"level": "warning|info|danger", "title": "short title", "message": "actionable message"}
  ],
  "recommendations": [
    {"priority": "high|medium|low", "title": "short title", "action": "what to do"}
  ],
  "forecast": {
    "next_30_days": "brief profit forecast based on active batches",
    "confidence": "high|medium|low"
  }
}

Return ONLY valid JSON. No markdown, no extra text."""

    response = client.messages.create(
        model='claude-opus-4-5',
        max_tokens=1024,
        system=system,
        messages=[{'role': 'user', 'content': prompt}],
    )

    try:
        return json.loads(response.content[0].text)
    except json.JSONDecodeError:
        return {
            'alerts': [],
            'recommendations': [],
            'forecast': {'next_30_days': 'Unable to generate forecast', 'confidence': 'low'},
        }