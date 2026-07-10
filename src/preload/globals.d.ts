import type { Api } from './index'

export {}

declare global {
  interface Window {
    api: Api
  }
}
