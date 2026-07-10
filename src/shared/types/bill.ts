export type BillStatus = 'active' | 'closed'

export interface Bill {
  id: number
  name: string
  startDate: string
  endDate: string
  status: BillStatus
  createdAt: string
  updatedAt: string
}

export interface BillCreateInput {
  name?: string
  startDate: string
  endDate: string
}

export interface BillUpdateInput {
  name?: string
  startDate?: string
  endDate?: string
  status?: BillStatus
}
