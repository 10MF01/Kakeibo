import dayjs from 'dayjs'
import type { Bill } from '@shared/types/bill'

export function dayCount(bill: Bill): number {
  return dayjs(bill.endDate).diff(dayjs(bill.startDate), 'day') + 1
}
