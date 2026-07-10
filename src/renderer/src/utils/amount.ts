/** Transactions are stored as integers in the smallest display unit (x100) to avoid float drift. */
export function toStoredAmount(displayValue: number): number {
  return Math.round(displayValue * 100)
}

export function toDisplayAmount(stored: number): number {
  return stored / 100
}
