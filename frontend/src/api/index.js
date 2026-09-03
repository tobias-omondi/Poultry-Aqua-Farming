import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
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

/* =========================================================
   HOUSING
========================================================= */

export const getHouses = () =>
  API.get('/housing/')
export const createHouse = (data) => API.post('/housing/', data)
export const deleteHouse = (id) => API.delete(`/housing/${id}/`)
export const updateHouse = (id, data) => API.patch(`/housing/${id}/`, data)