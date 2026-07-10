import type { AppLanguage } from './types/settings'

/** Mirrors the "categories.seed.*" keys in the renderer i18n locale files, so the
 *  main process (which has no react-i18next) can localize seed category names too —
 *  used only by the Excel export, since the PDF export reuses the renderer's own
 *  components and already retranslates live via i18next. */
export const CATEGORY_SEED_LABELS: Record<string, Record<AppLanguage, string>> = {
  food: { zh: '饮食', ja: '食費', en: 'Food' },
  transport: { zh: '交通', ja: '交通費', en: 'Transport' },
  housing: { zh: '住房', ja: '住居費', en: 'Housing' },
  utilities: { zh: '水电燃气', ja: '水道光熱費', en: 'Utilities' },
  entertainment: { zh: '娱乐', ja: '娯楽費', en: 'Entertainment' },
  shopping: { zh: '购物', ja: '買い物', en: 'Shopping' },
  medical: { zh: '医疗', ja: '医療費', en: 'Medical' },
  education: { zh: '教育', ja: '教育費', en: 'Education' },
  communication: { zh: '通讯', ja: '通信費', en: 'Communication' },
  otherExpense: { zh: '其他支出', ja: 'その他支出', en: 'Other Expense' },
  salary: { zh: '工资', ja: '給与', en: 'Salary' },
  bonus: { zh: '奖金', ja: 'ボーナス', en: 'Bonus' },
  sideIncome: { zh: '兼职', ja: '副業収入', en: 'Side Income' },
  investment: { zh: '投资收益', ja: '投資収益', en: 'Investment' },
  otherIncome: { zh: '其他收入', ja: 'その他収入', en: 'Other Income' }
}

export function resolveCategorySeedLabel(
  nameKey: string | null,
  fallback: string,
  language: AppLanguage
): string {
  if (!nameKey) return fallback
  const key = nameKey.replace(/^category\./, '')
  return CATEGORY_SEED_LABELS[key]?.[language] ?? fallback
}
