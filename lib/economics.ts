// Shared, pure mining-economics helpers. Safe to import from server and client code.

export type Algorithm = "SHA-256" | "Scrypt" | "kHeavyHash" | "Equihash" | "Etchash" | "X11" | "Eaglesong";

export type HashUnit = "TH/s" | "GH/s" | "MH/s" | "kSol/s";

export const UNIT_MULTIPLIER: Record<HashUnit, number> = {
  "TH/s": 1e12,
  "GH/s": 1e9,
  "MH/s": 1e6,
  "kSol/s": 1e3,
};

export const EFFICIENCY_UNIT: Record<HashUnit, string> = {
  "TH/s": "J/TH",
  "GH/s": "J/GH",
  "MH/s": "J/MH",
  "kSol/s": "J/kSol",
};

/** Network state for one coin, normalised to H/s and USD. */
export type CoinNetwork = {
  tag: string;
  name: string;
  algorithm: Algorithm;
  blockTimeSec: number;
  blockReward: number;
  nethashHs: number;
  priceUsd: number;
};

export type MarketSnapshot = {
  coins: CoinNetwork[];
  btcUsd: number;
  updatedAt: number;
  source: "live" | "snapshot";
};

export type CoinRevenue = {
  tag: string;
  name: string;
  /** Coins mined per day. For merged entries this is the primary coin only. */
  coinsPerDay: number;
  usdPerDay: number;
  merged?: string[];
};

export type MiningSettings = {
  /** USD per kWh */
  electricity: number;
  /** Pool fee in percent */
  poolFee: number;
};

export const DEFAULT_SETTINGS: MiningSettings = { electricity: 0.07, poolFee: 1 };

export const ELECTRICITY_PRESETS = [
  { label: "Hosted · Nigeria", value: 0.036 },
  { label: "Hosted · Texas", value: 0.045 },
  { label: "Industrial", value: 0.07 },
  { label: "Home · Philippines", value: 0.22 },
];

export const COIN_COLORS: Record<string, string> = {
  BTC: "#f7931a",
  BCH: "#8dc351",
  FB: "#f5b335",
  XEC: "#0074c2",
  LTC: "#a6a9aa",
  DOGE: "#c2a633",
  "LTC+DOGE": "#c2a633",
  KAS: "#49eacb",
  ZEC: "#f4b728",
  ETC: "#3ab83a",
  DASH: "#008ce7",
  CKB: "#3cc68a",
};

export function hashrateToHs(value: number, unit: HashUnit) {
  return value * UNIT_MULTIPLIER[unit];
}

/** Expected coins and USD per day for a hashrate on one coin's network. */
export function revenueOnCoin(hashrateHs: number, coin: CoinNetwork): CoinRevenue {
  const share = coin.nethashHs > 0 ? hashrateHs / coin.nethashHs : 0;
  const blocksPerDay = 86_400 / coin.blockTimeSec;
  const coinsPerDay = share * blocksPerDay * coin.blockReward;
  return { tag: coin.tag, name: coin.name, coinsPerDay, usdPerDay: coinsPerDay * coin.priceUsd };
}

/** The coin buyers expect to see first for each algorithm. Alternatives are still listed below it. */
export const PRIMARY_COIN: Record<Algorithm, string> = {
  "SHA-256": "BTC",
  Scrypt: "LTC+DOGE",
  kHeavyHash: "KAS",
  Equihash: "ZEC",
  Etchash: "ETC",
  X11: "DASH",
  Eaglesong: "CKB",
};

/**
 * All coins a miner can mine: the algorithm's primary coin first, then the rest by income.
 * Scrypt gets a merged LTC+DOGE entry, as pools pay both.
 */
export function minerRevenues(hashrateHs: number, algorithm: Algorithm, market: MarketSnapshot): CoinRevenue[] {
  const coins = market.coins.filter((coin) => coin.algorithm === algorithm);
  const rows = coins.map((coin) => revenueOnCoin(hashrateHs, coin));

  if (algorithm === "Scrypt") {
    const ltc = rows.find((row) => row.tag === "LTC");
    const doge = rows.find((row) => row.tag === "DOGE");
    if (ltc && doge) {
      rows.push({
        tag: "LTC+DOGE",
        name: "Litecoin + Dogecoin (merged)",
        coinsPerDay: ltc.coinsPerDay,
        usdPerDay: ltc.usdPerDay + doge.usdPerDay,
        merged: ["LTC", "DOGE"],
      });
    }
  }

  const primary = PRIMARY_COIN[algorithm];
  return rows.sort((a, b) => Number(b.tag === primary) - Number(a.tag === primary) || b.usdPerDay - a.usdPerDay);
}

export type ProfitBreakdown = {
  income: number;
  poolFees: number;
  electricity: number;
  profit: number;
};

export function dailyProfit(revenueUsd: number, powerW: number, settings: MiningSettings): ProfitBreakdown {
  const poolFees = revenueUsd * (settings.poolFee / 100);
  const electricity = (powerW / 1000) * 24 * settings.electricity;
  return { income: revenueUsd, poolFees, electricity, profit: revenueUsd - poolFees - electricity };
}

/** Electricity price at which the miner stops making money. */
export function breakEvenElectricity(revenueUsd: number, powerW: number, poolFee: number) {
  const kwhPerDay = (powerW / 1000) * 24;
  if (kwhPerDay <= 0) return 0;
  return (revenueUsd * (1 - poolFee / 100)) / kwhPerDay;
}

export function roiDays(price: number, profitPerDay: number) {
  if (!(profitPerDay > 0) || !(price > 0)) return null;
  return Math.ceil(price / profitPerDay);
}

export function formatHashrate(value: number, unit: HashUnit) {
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toLocaleString("en-US", { maximumFractionDigits: digits })} ${unit}`;
}

export function formatEfficiency(powerW: number, value: number, unit: HashUnit) {
  const eff = powerW / value;
  const digits = eff >= 100 ? 0 : eff >= 10 ? 1 : 2;
  return `${eff.toLocaleString("en-US", { maximumFractionDigits: digits })} ${EFFICIENCY_UNIT[unit]}`;
}

export function formatCoins(value: number) {
  if (value === 0) return "0";
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
  return value.toPrecision(3);
}

export function formatUsd(value: number, decimals = 2) {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
