import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_CURRENCY_MAP, LANGUAGE_LOCALE_MAP } from '@shared/currency'
import { toDisplayAmount } from '@shared/amount'
import type { AppLanguage } from '@shared/types/settings'

interface CurrencyFormatter {
  /** Formats a stored integer amount (x100) as a localized currency string, e.g. ¥8.80 / $8.80 / ¥880 */
  format: (storedAmount: number) => string
  /** Decimal places InputNumber-style fields should use for the active currency (JPY has none) */
  precision: number
  currency: string
  locale: string
}

export function useCurrencyFormatter(): CurrencyFormatter {
  const { i18n } = useTranslation()
  const lang = (i18n.language as AppLanguage) in LANGUAGE_CURRENCY_MAP ? (i18n.language as AppLanguage) : 'zh'

  return useMemo(() => {
    const locale = LANGUAGE_LOCALE_MAP[lang]
    const currency = LANGUAGE_CURRENCY_MAP[lang]
    const precision = currency === 'JPY' ? 0 : 2
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    })
    return {
      format: (storedAmount: number) => formatter.format(toDisplayAmount(storedAmount)),
      precision,
      currency,
      locale
    }
  }, [lang])
}
