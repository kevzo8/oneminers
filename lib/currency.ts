export const CURRENCIES = ["USD", "EUR", "GBP", "PHP", "CNY", "HKD", "AED", "CAD", "AUD", "JPY"] as const;
export type Currency = (typeof CURRENCIES)[number];
