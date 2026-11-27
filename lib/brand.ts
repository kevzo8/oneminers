// The directory's brand. Change it here and it updates everywhere (header, footer, metadata, assistant).
// Temporary name until the final brand is decided.

export const BRAND = {
  name: "MinerPicks",
  /** Logo text, split so the second part gets the accent colour. */
  logo: ["MINER", "PICKS"] as const,
  tagline: "ASIC miner profitability, prices and hosting",
  description:
    "Live profitability for every major ASIC miner, prices from sellers, and hosting rates. Compare miners, find the best price and see what each one earns.",
};

// Partner sellers link to this site as part of the listing promo (Michal's backlink requirement).
export const PARTNER = { name: "OneMiners", url: "https://oneminers.com", host: "oneminers.com" };
