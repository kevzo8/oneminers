// Shared, pure mining-economics helpers. Safe to import from server and client code.

/** Proof-of-work algorithm name as published by the data source (e.g. "SHA-256", "Scrypt", "Blake2B-Sia"). */
export type Algorithm = string;

/** Display unit for a hashrate, e.g. "TH/s", "GH/s", "kSol/s". */
export type HashUnit = string;

const PREFIX: Record<string, number> = { "": 1, k: 1e3, K: 1e3, M: 1e6, G: 1e9, T: 1e12, P: 1e15, E: 1e18, Z: 1e21 };

/** Algorithms whose miners are rated in solutions per second rather than hashes. */
const SOL_ALGORITHMS = new Set(["Equihash", "Equihash (210,9)", "Equihash (144,5)", "Equihash (125,4)", "Equihash (192,7)", "ZHash", "BeamHashIII"]);

export function unitMultiplier(unit: HashUnit) {
  const match = unit.match(/^([kKMGTPEZ]?)(?:H|Sol|G|h)\/s$/);
  return match ? PREFIX[match[1]] ?? 1 : 1;
}

export function hashrateToHs(value: number, unit: HashUnit) {
  return value * unitMultiplier(unit);
}

export function efficiencyUnit(unit: HashUnit) {
  return `J/${unit.replace("/s", "")}`;
}

/** Picks a readable unit for a raw hashrate (H/s or Sol/s), e.g. 4.73e14 -> 473 TH/s. */
export function bestUnit(hs: number, algorithm: Algorithm): { value: number; unit: HashUnit } {
  const base = SOL_ALGORITHMS.has(algorithm) || /equihash/i.test(algorithm) ? "Sol/s" : "H/s";
  const steps: [string, number][] = [
    ["E", 1e18],
    ["P", 1e15],
    ["T", 1e12],
    ["G", 1e9],
    ["M", 1e6],
    ["k", 1e3],
  ];
  for (const [prefix, factor] of steps) {
    if (hs >= factor) return { value: Math.round((hs / factor) * 1000) / 1000, unit: `${prefix}${base}` };
  }
  return { value: Math.round(hs * 1000) / 1000, unit: base };
}

/** Network state for one coin, normalised to H/s and USD. */
export type CoinNetwork = {
  /** Stable data-source id (BackPoW coin id, e.g. "Bitcoin", "DGB-SHA"). */
  id: string;
  /** Ticker shown to users, e.g. "BTC". */
  tag: string;
  name: string;
  algorithm: Algorithm;
  blockTimeSec: number;
  blockReward: number;
  nethashHs: number;
  priceUsd: number;
  /** 24h trading volume in USD, when known. Used to flag coins you can't realistically sell. */
  volume24hUsd?: number;
};

/** A coin is flagged when it trades under this much per day, or one miner would dominate its network. */
export const MIN_VOLUME_USD = 100_000;
export const MAX_NETWORK_SHARE = 0.05;

export type MarketSnapshot = {
  coins: CoinNetwork[];
  btcUsd: number;
  updatedAt: number;
  source: "live" | "snapshot";
};

export type CoinRevenue = {
  /** Coin id (or "LTC+DOGE" for the merged entry). */
  id: string;
  tag: string;
  name: string;
  /** Coins mined per day. For merged entries this is the primary coin only. */
  coinsPerDay: number;
  usdPerDay: number;
  merged?: string[];
  /** This miner's share of the coin's network hashrate. */
  share?: number;
  /** Set when the income isn't realistic to collect: thin trading, or the miner would dominate the network. */
  caution?: "illiquid" | "dominant";
};

/** A miner's hashrate and power on one coin, as published by the data source. */
export type MinerCoin = { coinId: string; hashrateHs: number; watts: number };

export type MiningSettings = {
  /** USD per kWh */
  electricity: number;
  /** Pool fee in percent */
  poolFee: number;
  /** Display currency (ISO code); amounts are computed in USD and converted for display. */
  currency?: string;
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
  SC: "#20ee82",
  ALPH: "#ff5d51",
  KDA: "#ed098f",
  ALEO: "#f5f5f5",
  DGB: "#006ad2",
};

/** Expected coins and USD per day for a hashrate on one coin's network. */
export function revenueOnCoin(hashrateHs: number, coin: CoinNetwork): CoinRevenue {
  const share = coin.nethashHs > 0 ? hashrateHs / coin.nethashHs : 0;
  const blocksPerDay = coin.blockTimeSec > 0 ? 86_400 / coin.blockTimeSec : 0;
  const coinsPerDay = share * blocksPerDay * coin.blockReward;
  const caution =
    share > MAX_NETWORK_SHARE ? "dominant" : coin.volume24hUsd !== undefined && coin.volume24hUsd < MIN_VOLUME_USD ? "illiquid" : undefined;
  return { id: coin.id, tag: coin.tag, name: coin.name, coinsPerDay, usdPerDay: coinsPerDay * coin.priceUsd, share, caution };
}

/**
 * The coin buyers expect to see first, by coin id, in priority order. Using a fixed primary coin keeps
 * headline profit stable and stops a thinly traded coin with a noisy price from topping the table.
 * Miners mining none of these fall back to their best-paying coin with a real price.
 */
export const PRIMARY_COIN_IDS = [
  "Bitcoin",
  "LTC+DOGE",
  "Kaspa",
  "Zcash",
  "EthereumClassic",
  "Dash",
  "Nervos",
  "Sia",
  "Alephium",
  "Kadena",
  "Aleo",
];

/**
 * Headline coin: the first sound primary coin, else the best-paying sound coin. Sound coins come next by
 * income, then flagged ("caution") coins. Only if every coin is flagged does a flagged coin lead.
 */
function sortWithPrimary(rows: CoinRevenue[]) {
  const priced = rows.filter((row) => row.usdPerDay > 0);
  const rank = (row: CoinRevenue) => {
    const index = PRIMARY_COIN_IDS.indexOf(row.id);
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  };
  const byIncome = (a: CoinRevenue, b: CoinRevenue) => b.usdPerDay - a.usdPerDay;
  const sound = priced.filter((row) => !row.caution).sort(byIncome);
  const flagged = priced.filter((row) => row.caution).sort(byIncome);
  const primary = [...sound].sort((a, b) => rank(a) - rank(b))[0];
  const headline = primary && rank(primary) !== Number.POSITIVE_INFINITY ? primary : sound[0];
  if (!headline) return flagged;
  return [headline, ...sound.filter((row) => row !== headline), ...flagged];
}

function addMergedScrypt(rows: CoinRevenue[]) {
  const ltc = rows.find((row) => row.id === "Litecoin" || row.tag === "LTC");
  const doge = rows.find((row) => row.id === "Dogecoin" || row.tag === "DOGE");
  if (ltc && doge) {
    rows.push({
      id: "LTC+DOGE",
      tag: "LTC+DOGE",
      name: "Litecoin + Dogecoin (merged)",
      coinsPerDay: ltc.coinsPerDay,
      usdPerDay: ltc.usdPerDay + doge.usdPerDay,
      merged: ["LTC", "DOGE"],
      caution: ltc.caution && doge.caution ? ltc.caution : undefined,
    });
  }
}

/**
 * All coins a miner can mine, primary coin first. Uses the miner's own per-coin hashrate when the
 * data source provides it; otherwise its rated hashrate on every coin of the same algorithm.
 */
export function minerRevenues(
  miner: { hashrate: number; unit: HashUnit; algorithm: Algorithm; coins?: MinerCoin[] },
  market: MarketSnapshot
): CoinRevenue[] {
  let rows: CoinRevenue[];
  if (miner.coins?.length) {
    const byId = new Map(market.coins.map((coin) => [coin.id, coin]));
    rows = miner.coins.flatMap((entry) => {
      const coin = byId.get(entry.coinId);
      return coin ? [revenueOnCoin(entry.hashrateHs, coin)] : [];
    });
  } else {
    const hs = hashrateToHs(miner.hashrate, miner.unit);
    rows = market.coins.filter((coin) => coin.algorithm === miner.algorithm).map((coin) => revenueOnCoin(hs, coin));
  }
  addMergedScrypt(rows);
  return sortWithPrimary(rows);
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
  const digits = eff >= 100 ? 0 : eff >= 10 ? 1 : eff >= 0.1 ? 2 : 4;
  return `${eff.toLocaleString("en-US", { maximumFractionDigits: digits })} ${efficiencyUnit(unit)}`;
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
