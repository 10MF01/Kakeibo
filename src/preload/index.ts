import { contextBridge } from 'electron'
import { categoriesApi } from './api/categories'
import { billsApi } from './api/bills'
import { transactionsApi } from './api/transactions'
import { settingsApi } from './api/settings'

const api = {
  categories: categoriesApi,
  bills: billsApi,
  transactions: transactionsApi,
  settings: settingsApi
}

export type Api = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}
