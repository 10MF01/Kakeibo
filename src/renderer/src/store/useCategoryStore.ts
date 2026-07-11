import { create } from 'zustand'
import type { Category } from '@shared/types/category'

interface CategoryState {
  categories: Category[]
  loading: boolean
  loaded: boolean
  fetch: () => Promise<void>
  refresh: () => Promise<void>
  reorder: (orderedIds: number[]) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  loaded: false,
  fetch: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    const categories = await window.api.categories.list()
    set({ categories, loading: false, loaded: true })
  },
  refresh: async () => {
    set({ loading: true })
    const categories = await window.api.categories.list()
    set({ categories, loading: false, loaded: true })
  },
  reorder: async (orderedIds: number[]) => {
    const updates = orderedIds.map((id, index) => ({ id, sortOrder: index + 1 }))
    const sortOrderById = new Map(updates.map((u) => [u.id, u.sortOrder]))
    set((state) => ({
      categories: state.categories
        .map((c) => (sortOrderById.has(c.id) ? { ...c, sortOrder: sortOrderById.get(c.id)! } : c))
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    }))
    await window.api.categories.reorder(updates)
  }
}))
