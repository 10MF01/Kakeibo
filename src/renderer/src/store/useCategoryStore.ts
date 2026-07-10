import { create } from 'zustand'
import type { Category } from '@shared/types/category'

interface CategoryState {
  categories: Category[]
  loading: boolean
  loaded: boolean
  fetch: () => Promise<void>
  refresh: () => Promise<void>
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
  }
}))
