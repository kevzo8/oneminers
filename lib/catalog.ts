// Miner catalog, vendors and offers for the directory.
// Specs follow manufacturer announcements (verify before purchase). Vendor names other than
// OneMiners and every price/offer here are illustrative sample data for the demo.

import type { Algorithm, HashUnit } from "./economics";

export type Cooling = "Air" | "Hydro" | "Immersion";
export type Category = "Industrial" | "Home";

export type MinerModel = {
  slug: string;
  manufacturer: string;
  model: string;
  algorithm: Algorithm;
  hashrate: number;
  unit: HashUnit;
  powerW: number;
  cooling: Cooling;
  category: Category;
  release: number;
  /** Illustrative reference price in USD, used to generate sample offers. */
  refPrice: number;
  aka?: string;
};

function m(
  manufacturer: string,
  model: string,
  algorithm: Algorithm,
  hashrate: number,
  unit: HashUnit,
  powerW: number,
  cooling: Cooling,
  release: number,
  refPrice: number,
  category: Category = "Industrial"
): MinerModel {
  const slug = `${manufacturer}-${model}-${hashrate}${unit.replace("/s", "")}`
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return { slug, manufacturer, model, algorithm, hashrate, unit, powerW, cooling, category, release, refPrice };
}

export const MINERS: MinerModel[] = [
  // SHA-256 · Bitmain
  m("Bitmain", "Antminer S21 XP+ Hyd", "SHA-256", 500, "TH/s", 5500, "Hydro", 2025, 8800),
  m("Bitmain", "Antminer S21 XP Hyd", "SHA-256", 473, "TH/s", 5676, "Hydro", 2024, 6199),
  m("Bitmain", "Antminer S21 Hyd", "SHA-256", 335, "TH/s", 5360, "Hydro", 2024, 4350),
  m("Bitmain", "Antminer S21 XP", "SHA-256", 270, "TH/s", 3645, "Air", 2024, 5400),
  m("Bitmain", "Antminer S21 Pro", "SHA-256", 234, "TH/s", 3510, "Air", 2024, 3700),
  m("Bitmain", "Antminer S21+", "SHA-256", 216, "TH/s", 3564, "Air", 2025, 3200),
  m("Bitmain", "Antminer S21", "SHA-256", 200, "TH/s", 3500, "Air", 2024, 2800),
  m("Bitmain", "Antminer T21", "SHA-256", 190, "TH/s", 3610, "Air", 2023, 2100),
  m("Bitmain", "Antminer S19 XP", "SHA-256", 140, "TH/s", 3010, "Air", 2022, 1500),
  m("Bitmain", "Antminer S19k Pro", "SHA-256", 120, "TH/s", 2760, "Air", 2023, 1100),
  m("Bitmain", "Antminer S19j Pro", "SHA-256", 104, "TH/s", 3068, "Air", 2021, 500),
  // SHA-256 · MicroBT
  m("MicroBT", "WhatsMiner M63S", "SHA-256", 390, "TH/s", 7215, "Hydro", 2023, 5800),
  m("MicroBT", "WhatsMiner M66S", "SHA-256", 298, "TH/s", 5513, "Immersion", 2023, 4800),
  m("MicroBT", "WhatsMiner M60S", "SHA-256", 186, "TH/s", 3441, "Air", 2023, 3000),
  m("MicroBT", "WhatsMiner M60", "SHA-256", 172, "TH/s", 3422, "Air", 2023, 2600),
  m("MicroBT", "WhatsMiner M50S", "SHA-256", 126, "TH/s", 3276, "Air", 2022, 900),
  m("MicroBT", "WhatsMiner M30S++", "SHA-256", 112, "TH/s", 3472, "Air", 2020, 500),
  // SHA-256 · Canaan and home miners
  m("Canaan", "Avalon A1566", "SHA-256", 185, "TH/s", 3420, "Air", 2024, 2900),
  m("Canaan", "Avalon A1466", "SHA-256", 150, "TH/s", 3230, "Air", 2023, 1900),
  m("Canaan", "Avalon Nano 3", "SHA-256", 4, "TH/s", 140, "Air", 2024, 300, "Home"),
  m("Bitaxe", "Bitaxe Gamma", "SHA-256", 1.2, "TH/s", 17, "Air", 2024, 150, "Home"),
  // Scrypt (LTC + DOGE)
  m("Bitmain", "Antminer L9", "Scrypt", 16, "GH/s", 3360, "Air", 2024, 7500),
  m("Bitmain", "Antminer L7", "Scrypt", 9.5, "GH/s", 3425, "Air", 2021, 2400),
  m("ElphaPex", "DG1+", "Scrypt", 14, "GH/s", 3920, "Air", 2024, 6200),
  m("ElphaPex", "DG Home 1", "Scrypt", 2.1, "GH/s", 620, "Air", 2025, 1500, "Home"),
  // kHeavyHash (Kaspa)
  m("Bitmain", "Antminer KS5 Pro", "kHeavyHash", 21, "TH/s", 3150, "Air", 2024, 3500),
  m("Bitmain", "Antminer KS3", "kHeavyHash", 9.4, "TH/s", 3500, "Air", 2023, 1200),
  m("IceRiver", "KS5L", "kHeavyHash", 12, "TH/s", 3400, "Air", 2024, 1600),
  m("IceRiver", "KS3M", "kHeavyHash", 6, "TH/s", 3400, "Air", 2023, 900),
  m("IceRiver", "KS0 Ultra", "kHeavyHash", 400, "GH/s", 100, "Air", 2024, 250, "Home"),
  m("Goldshell", "E-KA1M", "kHeavyHash", 5.5, "TH/s", 1800, "Air", 2024, 1100),
  // Equihash (Zcash)
  m("Bitmain", "Antminer Z15 Pro", "Equihash", 840, "kSol/s", 2780, "Air", 2024, 5199),
  m("Bitmain", "Antminer Z15", "Equihash", 420, "kSol/s", 1510, "Air", 2023, 1500),
  // Other algorithms
  m("Bitmain", "Antminer E9 Pro", "Etchash", 3.68, "GH/s", 2200, "Air", 2022, 1300),
  m("Bitmain", "Antminer D9", "X11", 1770, "GH/s", 2839, "Air", 2023, 2500),
  m("Bitmain", "Antminer K7", "Eaglesong", 63.5, "TH/s", 3080, "Air", 2022, 700),
];

// ---------------------------------------------------------------------------
// Vendors

export type VendorTier = "Gold" | "Silver" | "Bronze" | "Free";

export type Vendor = {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  tier: VendorTier;
  verified: boolean;
  partner: boolean;
  replyMinutes: number;
  rating: number;
  reviews: number;
  since: number;
  payments: string[];
  warrantyMonths: number;
  hosting: boolean;
  website: string;
  about: string;
  sample: boolean;
};

export const VENDORS: Vendor[] = [
  {
    slug: "oneminers",
    name: "OneMiners",
    country: "United States",
    countryCode: "US",
    tier: "Gold",
    verified: true,
    partner: true,
    replyMinutes: 40,
    rating: 4.8,
    reviews: 270,
    since: 2017,
    payments: ["Bank transfer", "BTC", "USDT", "Pay later"],
    warrantyMonths: 84,
    hosting: true,
    website: "https://oneminers.com",
    about:
      "ASIC sales with fully managed hosting from 3.6¢/kWh across 17+ locations. Hosted miners carry a 7-year warranty and are managed in the OneMiners app.",
    sample: false,
  },
  {
    slug: "harborline-asic-supply",
    name: "Harborline ASIC Supply",
    country: "Hong Kong",
    countryCode: "HK",
    tier: "Silver",
    verified: true,
    partner: true,
    replyMinutes: 25,
    rating: 4.6,
    reviews: 84,
    since: 2019,
    payments: ["Bank transfer", "USDT"],
    warrantyMonths: 6,
    hosting: false,
    website: "#",
    about: "Wholesale distributor shipping new and refurbished ASICs from Hong Kong and Shenzhen warehouses.",
    sample: true,
  },
  {
    slug: "nordvolt-mining-hardware",
    name: "Nordvolt Mining Hardware",
    country: "Germany",
    countryCode: "DE",
    tier: "Silver",
    verified: true,
    partner: true,
    replyMinutes: 55,
    rating: 4.7,
    reviews: 61,
    since: 2020,
    payments: ["SEPA", "BTC"],
    warrantyMonths: 12,
    hosting: false,
    website: "#",
    about: "EU-stocked miners with VAT invoices, DDP delivery inside the EU, and an in-house repair bench.",
    sample: true,
  },
  {
    slug: "cascade-hash-depot",
    name: "Cascade Hash Depot",
    country: "United States",
    countryCode: "US",
    tier: "Bronze",
    verified: true,
    partner: true,
    replyMinutes: 90,
    rating: 4.4,
    reviews: 37,
    since: 2021,
    payments: ["Wire", "Card", "BTC"],
    warrantyMonths: 6,
    hosting: true,
    website: "#",
    about: "US warehouse stock with fast ground shipping and optional colocation in Washington State.",
    sample: true,
  },
  {
    slug: "brightcore-trading",
    name: "Brightcore Trading",
    country: "China",
    countryCode: "CN",
    tier: "Free",
    verified: false,
    partner: false,
    replyMinutes: 180,
    rating: 4.1,
    reviews: 12,
    since: 2022,
    payments: ["USDT", "Bank transfer"],
    warrantyMonths: 3,
    hosting: false,
    website: "#",
    about: "Factory-direct batches with bulk discounts on orders of 10 units or more.",
    sample: true,
  },
  {
    slug: "meridian-miner-exchange",
    name: "Meridian Miner Exchange",
    country: "United Arab Emirates",
    countryCode: "AE",
    tier: "Bronze",
    verified: true,
    partner: true,
    replyMinutes: 70,
    rating: 4.5,
    reviews: 29,
    since: 2021,
    payments: ["Bank transfer", "USDT", "BTC"],
    warrantyMonths: 6,
    hosting: true,
    website: "#",
    about: "Dubai-based reseller with bonded warehouse stock and hosting partners across the Gulf.",
    sample: true,
  },
  {
    slug: "atlas-hashworks",
    name: "Atlas Hashworks",
    country: "United Kingdom",
    countryCode: "GB",
    tier: "Free",
    verified: true,
    partner: false,
    replyMinutes: 120,
    rating: 4.3,
    reviews: 18,
    since: 2023,
    payments: ["Bank transfer", "Card"],
    warrantyMonths: 12,
    hosting: false,
    website: "#",
    about: "Specialist in home and small-farm miners, including quiet and low-power models.",
    sample: true,
  },
];

export const TIER_RANK: Record<VendorTier, number> = { Gold: 0, Silver: 1, Bronze: 2, Free: 3 };

// ---------------------------------------------------------------------------
// Offers (deterministic sample data)

export type Offer = {
  id: string;
  minerSlug: string;
  vendorSlug: string;
  price: number;
  shipping: number;
  condition: "New" | "Refurbished";
  availability: "In stock" | "Pre-order" | "Out of stock";
  shipsFrom: string;
  psuIncluded: boolean;
  warrantyMonths: number;
  /** Epoch ms of the vendor's last update. */
  updatedAt: number;
};

const SEED_TIME = Date.UTC(2026, 10, 25, 0, 0, 0);

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function buildOffers(): Offer[] {
  const offers: Offer[] = [];
  for (const miner of MINERS) {
    for (const vendor of VENDORS) {
      const roll = hash(`${miner.slug}:${vendor.slug}`);
      // Each vendor carries roughly 60% of the catalog; OneMiners carries industrial machines.
      const carries = vendor.slug === "oneminers" ? miner.category === "Industrial" && roll < 0.85 : roll < 0.6;
      if (!carries) continue;

      const old = miner.release <= 2022;
      const factor = 0.9 + hash(`${vendor.slug}:${miner.slug}:price`) * 0.25;
      const price = Math.max(80, Math.round((miner.refPrice * factor) / 10) * 10);
      const stockRoll = hash(`${miner.slug}:${vendor.slug}:stock`);

      offers.push({
        id: `${miner.slug}--${vendor.slug}`,
        minerSlug: miner.slug,
        vendorSlug: vendor.slug,
        price,
        shipping: vendor.countryCode === "CN" || vendor.countryCode === "HK" ? Math.round(price * 0.03) : 0,
        condition: old && stockRoll < 0.6 ? "Refurbished" : "New",
        availability: stockRoll < 0.72 ? "In stock" : stockRoll < 0.92 ? "Pre-order" : "Out of stock",
        shipsFrom: vendor.countryCode,
        psuIncluded: miner.cooling === "Air" || stockRoll > 0.5,
        warrantyMonths: vendor.warrantyMonths,
        updatedAt: SEED_TIME - Math.floor(hash(`${miner.slug}:${vendor.slug}:age`) * 9) * 86_400_000,
      });
    }
  }
  return offers;
}

/** Starter offers (sample data), loaded into Convex by `admin:seed`. */
export const OFFERS: Offer[] = buildOffers();
