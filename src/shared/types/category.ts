export type CategoryType = 'income' | 'expense'

export interface Category {
  id: number
  type: CategoryType
  name: string
  nameKey: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryCreateInput {
  type: CategoryType
  name: string
  icon?: string | null
  color?: string | null
  sortOrder?: number
}

export interface CategoryUpdateInput {
  name?: string
  icon?: string | null
  color?: string | null
  sortOrder?: number
}

export interface CategoryListFilter {
  type?: CategoryType
}
