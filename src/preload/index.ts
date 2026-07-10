import { contextBridge } from 'electron'

const api = {}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error contextIsolation is enabled in production; this branch only runs if disabled
  window.api = api
}
