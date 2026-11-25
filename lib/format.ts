import type { CoinNetwork } from "./economics";

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

export function formatNethash(hs: number, algorithm: CoinNetwork["algorithm"]) {
  const suffix = algorithm === "Equihash" ? "Sol/s" : "H/s";
  const units = ["", "k", "M", "G", "T", "P", "E", "Z"];
  let value = hs;
  let index = 0;
  while (value >= 1000 && index < units.length - 1) {
    value /= 1000;
    index += 1;
  }
  return `${value.toLocaleString("en-US", { maximumFractionDigits: value >= 100 ? 0 : 2 })} ${units[index]}${suffix}`;
}

export function formatPrice(usd: number) {
  if (usd >= 100) return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (usd >= 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toPrecision(3)}`;
}
