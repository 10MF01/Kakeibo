import { IPC } from '@shared/ipcChannels'
import type {
  CategoryCreateInput,
  CategoryListFilter,
  CategoryReorderItem,
  CategoryUpdateInput
} from '@shared/types/category'
import { handle } from './ipcHandle'
import * as categoryService from '../services/categoryService'

export function registerCategoryHandlers(): void {
  handle(IPC.categories.list, (filter?: CategoryListFilter) =>
    categoryService.listCategories(filter)
  )
  handle(IPC.categories.create, (input: CategoryCreateInput) =>
    categoryService.createCategory(input)
  )
  handle(IPC.categories.update, (id: number, input: CategoryUpdateInput) =>
    categoryService.updateCategory(id, input)
  )
  handle(IPC.categories.delete, (id: number) => categoryService.deleteCategory(id))
  handle(IPC.categories.reorder, (updates: CategoryReorderItem[]) =>
    categoryService.reorderCategories(updates)
  )
}
