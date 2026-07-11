import { IPC } from '@shared/ipcChannels'
import type {
  Category,
  CategoryCreateInput,
  CategoryListFilter,
  CategoryReorderItem,
  CategoryUpdateInput
} from '@shared/types/category'
import { invoke } from './invoke'

export const categoriesApi = {
  list: (filter?: CategoryListFilter) => invoke<Category[]>(IPC.categories.list, filter),
  create: (input: CategoryCreateInput) => invoke<Category>(IPC.categories.create, input),
  update: (id: number, input: CategoryUpdateInput) =>
    invoke<Category>(IPC.categories.update, id, input),
  delete: (id: number) => invoke<void>(IPC.categories.delete, id),
  reorder: (updates: CategoryReorderItem[]) => invoke<void>(IPC.categories.reorder, updates)
}
