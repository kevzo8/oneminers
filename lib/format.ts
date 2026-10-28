export function formatMoney(value: number, options?: { compact?: boolean; decimals?: number }) {
  const decimals = options?.decimals ?? (Math.abs(value) >= 1000 ? 0 : 2);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: options?.compact ? "compact" : "standard",
    maximumFractionDigits: decimals,
    minimumFractionDigits: options?.compact ? 0 : decimals,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatCoinPrice(value: number) {
  if (value >= 1000) return formatMoney(value, { decimals: 2 });
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(8)}`;
}
