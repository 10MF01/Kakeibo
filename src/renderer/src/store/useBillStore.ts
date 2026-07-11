import { create } from 'zustand'
import { message } from 'antd'
import i18n from '@renderer/i18n'
import type { Bill } from '@shared/types/bill'

interface BillState {
  bills: Bill[]
  activeBill: Bill | null
  loading: boolean
  loaded: boolean
  fetch: () => Promise<void>
  refresh: () => Promise<void>
  refreshActive: () => Promise<void>
  activateBill: (id: number) => Promise<void>
  deleteBill: (id: number) => Promise<void>
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: [],
  activeBill: null,
  loading: false,
  loaded: false,
  fetch: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const [bills, activeBill] = await Promise.all([
        window.api.bills.list(),
        window.api.bills.getActive()
      ])
      set({ bills, activeBill, loading: false, loaded: true })
    } catch (err) {
      set({ loading: false })
      message.error(err instanceof Error ? err.message : i18n.t('common.loadFailed'))
    }
  },
  refresh: async () => {
    set({ loading: true })
    const [bills, activeBill] = await Promise.all([
      window.api.bills.list(),
      window.api.bills.getActive()
    ])
    set({ bills, activeBill, loading: false, loaded: true })
  },
  refreshActive: async () => {
    const activeBill = await window.api.bills.getActive()
    set({ activeBill })
  },
  activateBill: async (id: number) => {
    await window.api.bills.activate(id)
    await get().refresh()
  },
  deleteBill: async (id: number) => {
    await window.api.bills.delete(id)
    await get().refresh()
  }
}))
