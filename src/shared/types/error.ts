export type AppErrorCode =
  | 'CATEGORY_NOT_FOUND'
  | 'CATEGORY_DUPLICATE_NAME'
  | 'CATEGORY_HAS_SUBCATEGORIES'
  | 'CATEGORY_IN_USE'
  | 'SUBCATEGORY_PARENT_INVALID'
  | 'BILL_NOT_FOUND'
  | 'BILL_INVALID_DATE_RANGE'
  | 'TRANSACTION_NOT_FOUND'
  | 'TRANSACTION_DATE_OUT_OF_RANGE'
  | 'TRANSACTION_CATEGORY_TYPE_MISMATCH'
  | 'UNKNOWN'

export class AppError extends Error {
  code: AppErrorCode

  constructor(code: AppErrorCode, message: string) {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

export interface SerializedAppError {
  code: AppErrorCode
  message: string
}
