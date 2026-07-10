import { create } from 'zustand'
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
    const [bills, activeBill] = await Promise.all([
      window.api.bills.list(),
      window.api.bills.getActive()
    ])
    set({ bills, activeBill, loading: false, loaded: true })
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
