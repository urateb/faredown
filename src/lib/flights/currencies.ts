export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CAD', 'AUD', 'CHF'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  EUR: 'Euro',
  USD: 'US dollar',
  GBP: 'Pound sterling',
  CAD: 'Canadian dollar',
  AUD: 'Australian dollar',
  CHF: 'Swiss franc',
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCIES as readonly string[]).includes(value);
}
