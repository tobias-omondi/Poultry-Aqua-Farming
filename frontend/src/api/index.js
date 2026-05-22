import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

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