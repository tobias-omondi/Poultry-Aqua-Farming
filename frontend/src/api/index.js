import axios from 'axios'

const API = axios.create({
  baseURL: 'https://poultry-farming.onrender.com/api',
  withCredentials: true,
})

export const getStoredToken = () =>
  localStorage.getItem('ff_token') || sessionStorage.getItem('ff_token') || null

const decodeJwtPayload = (token) => {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const binary = atob(padded)
    const json = decodeURIComponent(
      Array.from(binary, (char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`).join('')
    )

    return JSON.parse(json)
  } catch (error) {
    return null
  }
}

export const isTokenExpired = (token) => {
  if (!token) return true

  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return false

  return Date.now() >= payload.exp * 1000
}

export const hasValidAuthToken = () => {
  const token = getStoredToken()
  if (!token) return false

  if (isTokenExpired(token)) {
    clearAuthSession()
    return false
  }

  return true
}

export const clearAuthSession = () => {
  localStorage.removeItem('ff_token')
  sessionStorage.removeItem('ff_token')
  delete API.defaults.headers.common['Authorization']
  window.dispatchEvent(new Event('auth:change'))
}

// Auth helpers
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete API.defaults.headers.common['Authorization']
  }
}

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthError = error?.response?.status === 401
    if (isAuthError) {
      clearAuthSession()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const login = (credentials) =>
  API.post('/auth/login/', credentials)

export const logout = () => {
  setAuthToken(null)
}

/* =========================================================
   CHICKENS
========================================================= */

export const getBatches = () =>
  API.get('/chickens/batches/')

export const getBatchSummary = (id) =>
  API.get(`/chickens/batches/${id}/summary/`)

export const createBatch = (data) =>
  API.post('/chickens/batches/', data)

export const updateBatch = (id, data) =>
  API.patch(`/chickens/batches/${id}/`, data)

export const deleteBatch = (id) =>
  API.delete(`/chickens/batches/${id}/`)

/* =========================================================
   DAILY LOGS
========================================================= */

export const getDailyLogs = (batchId) =>
  API.get(`/chickens/batches/${batchId}/logs/`)

export const createDailyLog = (data) =>
  API.post(
    `/chickens/batches/${data.batch}/logs/`,
    data
  )

export const updateDailyLog = (
  batchId,
  logId,
  data
) =>
  API.patch(
    `/chickens/batches/${batchId}/logs/${logId}/`,
    data
  )

export const deleteDailyLog = (
  batchId,
  logId
) =>
  API.delete(
    `/chickens/batches/${batchId}/logs/${logId}/`
  )

/* =========================================================
   FINANCIALS
========================================================= */

export const getFarmSummary = () =>
  API.get('/financials/summary/')

/* ---------------- COSTS ---------------- */

export const getCosts = () =>
  API.get('/financials/costs/')

export const createCost = (data) =>
  API.post('/financials/costs/', data)

export const updateCost = (id, data) =>
  API.patch(`/financials/costs/${id}/`, data)

export const deleteCost = (id) =>
  API.delete(`/financials/costs/${id}/`)

/* ---------------- SALES ---------------- */

export const getSales = () =>
  API.get('/financials/sales/')

export const createSale = (data) =>
  API.post('/financials/sales/', data)

export const updateSale = (id, data) =>
  API.patch(`/financials/sales/${id}/`, data)

export const deleteSale = (id) =>
  API.delete(`/financials/sales/${id}/`)

/* =========================================================
   INVENTORY
========================================================= */

export const getLowStockAlerts = () =>
  API.get('/inventory/alerts/')

/* ---------------- FEED STOCK ---------------- */

export const getFeedStock = () =>
  API.get('/inventory/feed/')

export const createFeedStock = (data) =>
  API.post('/inventory/feed/', data)

export const updateFeedStock = (
  id,
  data
) =>
  API.patch(`/inventory/feed/${id}/`, data)

export const deleteFeedStock = (id) =>
  API.delete(`/inventory/feed/${id}/`)

/* ---------------- MEDICATIONS ---------------- */

export const getMedications = () =>
  API.get('/inventory/medications/')

export const createMedication = (data) =>
  API.post('/inventory/medications/', data)

export const updateMedication = (
  id,
  data
) =>
  API.patch(
    `/inventory/medications/${id}/`,
    data
  )

export const deleteMedication = (id) =>
  API.delete(
    `/inventory/medications/${id}/`
  )

/* ---------------- PURCHASE ORDERS ---------------- */

export const getPurchaseOrders = () =>
  API.get('/inventory/purchase-orders/')

export const createPurchaseOrder = (
  data
) =>
  API.post(
    '/inventory/purchase-orders/',
    data
  )

export const updatePurchaseOrder = (
  id,
  data
) =>
  API.patch(
    `/inventory/purchase-orders/${id}/`,
    data
  )

export const deletePurchaseOrder = (
  id
) =>
  API.delete(
    `/inventory/purchase-orders/${id}/`
  )

/* ---------------- SUPPLIERS ---------------- */

export const getSuppliers = () =>
  API.get('/inventory/suppliers/')

export const createSupplier = (data) =>
  API.post('/inventory/suppliers/', data)

export const updateSupplier = (
  id,
  data
) =>
  API.patch(
    `/inventory/suppliers/${id}/`,
    data
  )

export const deleteSupplier = (id) =>
  API.delete(
    `/inventory/suppliers/${id}/`
  )

/* ---------------- INVENTORY ---------------- */

export const getInventory = () =>
  API.get('/inventory/feed/')

export const createInventoryItem = (data) =>
  API.post('/inventory/feed/', data)

export const updateInventoryItem = (id, data) =>
  API.patch(`/inventory/feed/${id}/`, data)

export const deleteInventoryItem = (id) =>
  API.delete(`/inventory/feed/${id}/`)

export const getOrders = () =>
  API.get('/inventory/purchase-orders/')

export const createOrder = (data) =>
  API.post('/inventory/purchase-orders/', data)

export const updateOrder = (id, data) =>
  API.patch(`/inventory/purchase-orders/${id}/`, data)

export const deleteOrder = (id) =>
  API.delete(`/inventory/purchase-orders/${id}/`)

/* =========================================================
   HOUSING
========================================================= */

export const getHouses = () =>
  API.get('/housing/')
export const createHouse = (data) => API.post('/housing/', data)
export const deleteHouse = (id) => API.delete(`/housing/${id}/`)
export const updateHouse = (id, data) => API.patch(`/housing/${id}/`, data)

/* =========================================================
    NOTIFICATIONS
  ========================================================= */

  export const getNotifications = () => API.get('/notifications/')
  export const markNotificationRead = (id, data) => API.patch(`/notifications/${id}/`, data)
  export const markAllNotificationsRead = () => API.post('/notifications/mark-all-read/')
  export const deleteNotification = (id) => API.delete(`/notifications/${id}/`)
  


  /* =========================================================
   AI (ChakaFarm AI)
========================================================= */


const AI_URL = (import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8001').replace(/\/$/, '')

// Turns any failed response into a readable message
const errorMessage = async (res) => {
  try {
    const data = await res.json()
    return data.detail || data.error || data.message || `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

const authHeaders = () => {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Expired or rejected login: clear it and go to the login page.
const checkSession = (res) => {
  if (res.status !== 401) return
  clearAuthSession()
  window.location.href = '/login'
  throw new Error('Session expired. Please log in again.')
}

// Returns the insights object (alerts, recommendations, forecast)
export const getInsights = async () => {
  const res = await fetch(`${AI_URL}/ai/insights`, {
    headers: authHeaders(),
    signal: AbortSignal.timeout(120000), // the free Render server can be slow to wake
  })
  checkSession(res)
  if (!res.ok) throw new Error(await errorMessage(res))
  return res.json()
}

// Streams the reply. Calls onChunk(text) for each piece as it arrives.
export const streamChat = async ({ message, history, batchId }, onChunk) => {
  const res = await fetch(`${AI_URL}/ai/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ message, history, batch_id: batchId ? Number(batchId) : null }),
  })
  checkSession(res)
  if (!res.ok) throw new Error(await errorMessage(res))
  if (!res.body) throw new Error('Streaming is not supported in this browser.')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n') // the server sends: data: {"text": "..."}
    buffer = events.pop() // keep any half-received event for the next round
    for (const ev of events) {
      const line = ev.replace(/^data: /, '').trim()
      if (!line || line === '[DONE]') continue
      const data = JSON.parse(line)
      if (data.error) throw new Error(data.error)
      onChunk(data.text)
    }
  }
}

// Uploads a photo and returns the report object
export const analyzeImage = async (file, batchId, age) => {
  const form = new FormData()
  form.append('file', file) // the server expects the field to be called "file"
  if (batchId) form.append('batch_id', batchId)
  if (age) form.append('age_days', age)

  const res = await fetch(`${AI_URL}/ai/analyze-image`, {
    method: 'POST',
    headers: authHeaders(), // don't set Content-Type, the browser adds it
    body: form,
  })
  checkSession(res)
  if (!res.ok) throw new Error(await errorMessage(res))
  return res.json()
}