import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),

  register: (data) => ipcRenderer.invoke('auth:register', data),

  getProducts: (token) => ipcRenderer.invoke('products:getAll', token),

  getSuppliers: (token) => ipcRenderer.invoke('suppliers:getAll', token),

  addSupplier: (data, token) => ipcRenderer.invoke('suppliers:add', data, token),

  addProduct: (data, token) => ipcRenderer.invoke('products:add', data, token),

  addPurchase: (data, token) => ipcRenderer.invoke('add-purchase', data, token),

  getPurchases: (token) => ipcRenderer.invoke('get-purchases', token),

  addSale: (saleData, token) => ipcRenderer.invoke('add-sale', saleData, token),

  getSales: (token) => ipcRenderer.invoke('get-sales', token),

  getReports: (params, token) => ipcRenderer.invoke('get-reports', params, token),

  getDashboardStats: (token, filter) => ipcRenderer.invoke('get-dashboard-stats', token, filter)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
