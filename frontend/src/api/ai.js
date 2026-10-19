// Put this file next to src/api/index.js  ->  src/api/ai.js
const AI_URL = (import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8001').replace(/\/$/, '')

import { getStoredToken, clearAuthSession } from './index'

const authHeaders = () => {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Expired or rejected login: clear it and send the farmer back to the login page.
function handleExpired(res) {
  if (res.status !== 401) return
  clearAuthSession()
  if (window.location.pathname !== '/login') window.location.href = '/login'
}

async function parse(res) {
  if (res.ok) return res.json()
  handleExpired(res)
  const body = await res.json().catch(() => ({}))
  throw new Error(body.detail || body.error || `Request failed (${res.status})`)
}

export const getInsights = () =>
  fetch(`${AI_URL}/ai/insights`, { headers: authHeaders() }).then(parse)

export const analyzeImage = (file, batchId, ageDays) => {
  const fd = new FormData()
  fd.append('file', file)
  if (batchId) fd.append('batch_id', batchId)
  if (ageDays) fd.append('age_days', ageDays)
  // No Content-Type here: the browser sets it for form uploads.
  return fetch(`${AI_URL}/ai/analyze-image`, { method: 'POST', headers: authHeaders(), body: fd }).then(parse)
}

// Reads the streamed answer piece by piece and calls onText(piece) for each one.
export async function streamChat({ message, history, batchId }, onText) {
  const res = await fetch(`${AI_URL}/ai/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ message, history, batch_id: batchId ? Number(batchId) : null }),
  })
  if (!res.ok) {
    handleExpired(res)
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${res.status})`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop() // keep any half-received event for the next round
    for (const ev of events) {
      const line = ev.replace(/^data: /, '').trim()
      if (!line || line === '[DONE]') continue
      const data = JSON.parse(line)
      if (data.error) throw new Error(data.error)
      onText(data.text)
    }
  }
}