import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

export const getBatches = () => API.get('/chickens/batches/')
export const getBatchSummary = (id) => API.get(`/chickens/batches/${id}/summary/`)
export const getFarmSummary = () => API.get('/financials/summary/')
export const getLowStockAlerts = () => API.get('/inventory/alerts/')
export const getHouses = () => API.get('/housing/')
export const getCosts = () => API.get('/financials/costs/')
export const getSales = () => API.get('/financials/sales/')
export const getFeedStock = () => API.get('/inventory/feed/')
export const getMedications = () => API.get('/inventory/medications/')
export const getPurchaseOrders = () => API.get('/inventory/purchase-orders/')
export const getSuppliers = () => API.get('/inventory/suppliers/')
