// Verified hardware specs for catalog miners, keyed by catalog slug.
//
// Values come from manufacturer datasheets (via D-Central's CC BY 4.0 reference
// datasets and Bitmain support pages), release dates from WhatToMine's ASIC
// database, and market ranges from BackPoW's hardware index (CC BY 4.0).
// Only fields a source actually publishes are present; nothing is estimated.
// Where sources disagree, the manufacturer datasheet wins and the conflicting
// value is left out rather than guessed.

export type SpecPriceRange = {
  min: number;
  max: number;
  median: number;
  count: number;
  condition: "new" | "used";
};

export type MinerSpecs = {
  /** Announcement / release date (ISO, WhatToMine). */
  releaseDate?: string;
  dimensions?: { length: number; width: number; height: number };
  weightKg?: number;
  grossWeightKg?: number;
  noiseDb?: number;
  voltage?: string;
  frequencyHz?: string;
  currentA?: number;
  psu?: string;
  psuDetail?: string;
  circuit?: string;
  circuitDetail?: string;
  interface?: string;
  operatingTempC?: string;
  storageTempC?: string;
  humidity?: string;
  altitudeM?: string;
  ambientC?: string;
  inletWaterC?: string;
  waterFlow?: string;
  waterPressure?: string;
  waterConnector?: string;
  fanCount?: number;
  fanSize?: string;
  fanRpm?: number;
  airflowCfm?: number;
  coolingDetail?: string;
  priceRange?: SpecPriceRange;
  /** Manufacturer datasheet used when it overrides the aggregated dataset. */
  officialSource?: { label: string; url: string };
};

const dims = (length: number, width: number, height: number) => ({ length, width, height });
const price = (min: number, max: number, median: number, count: number, condition: "new" | "used" = "new"): SpecPriceRange => ({
  min,
  max,
  median,
  count,
  condition,
});

export const MINER_SPECS: Record<string, MinerSpecs> = {
  // -------------------------------------------------------------------------
  // Bitmain · SHA-256
  "bitmain-antminer-s21-xp-plus-hyd-500th": {
    releaseDate: "2025-07-01",
    voltage: "380–415 V AC",
    frequencyHz: "50–60 Hz",
    currentA: 12,
    circuit: "Three-phase",
    interface: "RJ45 10/100M",
    inletWaterC: "20–50 °C",
    waterFlow: "8–10 L/min",
    waterPressure: "≤ 3.5 bar",
    waterConnector: "OD10",
    storageTempC: "-20 to 70 °C",
    humidity: "10–90% RH",
    coolingDetail: "Factory hydro (water-cooled, no chassis fans)",
    priceRange: price(9062, 9063, 9063, 3),
    officialSource: {
      label: "Bitmain S21 XP+ Hyd product manual",
      url: "https://apextomining.com/apexto/uploads/2025/02/S21-XP-Hyd.-Product-Manual.pdf",
    },
  },
  "bitmain-antminer-s21-xp-hyd-473th": {
    releaseDate: "2024-09-13",
    dimensions: dims(339, 173, 207),
    weightKg: 13.8,
    grossWeightKg: 15.7,
    voltage: "380–415 V AC",
    frequencyHz: "50–60 Hz",
    currentA: 12,
    circuit: "Three-phase",
    interface: "RJ45 10/100M",
    inletWaterC: "20–50 °C",
    waterFlow: "8–10 L/min",
    waterPressure: "≤ 3.5 bar",
    waterConnector: "DN10",
    storageTempC: "-20 to 70 °C",
    humidity: "10–90% RH",
    coolingDetail: "Factory hydro (water-cooled, no chassis fans)",
    priceRange: price(6400, 7936, 6877, 7),
    officialSource: {
      label: "Bitmain S21 XP Hyd specification",
      url: "https://support.bitmain.com/hc/en-us/articles/34523540504857-S21-XP-Hyd-Specification",
    },
  },
  "bitmain-antminer-s21-hyd-335th": {
    releaseDate: "2024-04-30",
    dimensions: dims(412, 197, 209),
    weightKg: 15.8,
    coolingDetail: "Factory hydro (water-cooled, no chassis fans)",
    priceRange: price(3150, 3230, 3230, 3),
  },
  "bitmain-antminer-s21-xp-270th": {
    releaseDate: "2024-10-30",
    dimensions: dims(449, 219, 293),
    weightKg: 18.7,
    grossWeightKg: 21.5,
    noiseDb: 76,
    voltage: "220–277 V AC",
    frequencyHz: "50–60 Hz",
    currentA: 20,
    psu: "APW17",
    psuDetail: "12–15 V · 3,600 W",
    circuit: "240 V / 20 A",
    circuitDetail: "30 A on 208 V or overclocked",
    interface: "RJ45 10/100M",
    operatingTempC: "-20 to 45 °C",
    storageTempC: "-20 to 70 °C",
    humidity: "10–90% RH",
    altitudeM: "≤ 2,000 m",
    ambientC: "15–35 °C",
    fanCount: 4,
    fanSize: "120 mm class",
    fanRpm: 6400,
    airflowCfm: 480,
    coolingDetail: "Forced air (4 fans)",
    priceRange: price(3011, 4062, 3315, 11),
    officialSource: {
      label: "Bitmain S21 XP specification",
      url: "https://support.bitmain.com/hc/en-us/articles/35383015643673-S21-XP-Specifications",
    },
  },
  "bitmain-antminer-s21-pro-234th": {
    releaseDate: "2024-07-31",
    dimensions: dims(400, 195, 290),
    weightKg: 15,
    noiseDb: 76,
    voltage: "220–277 V AC",
    psu: "APW17",
    psuDetail: "12–15 V · 3,600 W",
    circuit: "240 V / 20 A",
    circuitDetail: "30 A on 208 V or overclocked",
    operatingTempC: "5 to 45 °C",
    ambientC: "15–35 °C",
    fanCount: 4,
    fanSize: "120 mm class",
    coolingDetail: "Forced air (4 fans)",
    priceRange: price(2040, 2664, 2260, 9),
  },
  "bitmain-antminer-s21-plus-216th": {
    releaseDate: "2025-02-01",
    fanCount: 4,
    coolingDetail: "Forced air (4 fans); factory hydro variant: S21+ Hyd (358 TH/s)",
    priceRange: price(1550, 1788, 1746, 6),
  },
  "bitmain-antminer-s21-200th": {
    releaseDate: "2024-01-31",
    dimensions: dims(400, 195, 290),
    weightKg: 14.6,
    operatingTempC: "5 to 40 °C",
    ambientC: "15–35 °C",
    fanCount: 4,
    coolingDetail: "Forced air (4 fans); factory hydro and immersion variants exist",
    priceRange: price(1098, 1230, 1210, 3),
  },
  "bitmain-antminer-t21-190th": {
    releaseDate: "2024-01-31",
    dimensions: dims(400, 195, 290),
    weightKg: 14.6,
    noiseDb: 76,
    operatingTempC: "0 to 45 °C",
    ambientC: "15–35 °C",
    fanCount: 4,
    coolingDetail: "Forced air (4 fans)",
  },
  "bitmain-antminer-s19-xp-140th": {
    releaseDate: "2022-07-01",
    dimensions: dims(400, 195, 290),
    weightKg: 14.4,
    operatingTempC: "0 to 40 °C",
    ambientC: "15–35 °C",
    fanCount: 4,
    coolingDetail: "Forced air (4 fans); factory hydro variant: S19 XP Hyd (257 TH/s)",
    priceRange: price(723, 724, 723.5, 2),
  },
  "bitmain-antminer-s19k-pro-120th": {
    releaseDate: "2023-04-01",
    dimensions: dims(370, 195, 290),
    weightKg: 12.5,
    voltage: "200–240 V AC",
    psu: "APW12",
    psuDetail: "12–15 V · 3,600 W",
    circuit: "240 V / 20 A",
    circuitDetail: "15 A minimum",
    fanCount: 4,
    coolingDetail: "Forced air (4 fans)",
    priceRange: price(644, 756, 682, 10),
  },
  "bitmain-antminer-s19j-pro-104th": {
    releaseDate: "2021-06-30",
    dimensions: dims(400, 195, 290),
    weightKg: 13.2,
    voltage: "200–240 V AC",
    psu: "APW12",
    psuDetail: "12–15 V · 3,600 W",
    circuit: "240 V / 20 A",
    operatingTempC: "5 to 35 °C",
    ambientC: "15–35 °C",
    fanCount: 4,
    coolingDetail: "Forced air (4 fans)",
    priceRange: price(713, 713, 713, 1),
  },

  // -------------------------------------------------------------------------
  // MicroBT · SHA-256
  "microbt-whatsminer-m63s-390th": {
    releaseDate: "2023-10-31",
    coolingDetail: "Factory hydro (water-cooled, no chassis fans)",
  },
  "microbt-whatsminer-m66s-298th": {
    releaseDate: "2023-11-01",
    coolingDetail: "Factory immersion variant (M66/M66S series); air-cooled M66 also exists",
    priceRange: price(2386, 2386, 2386, 1),
  },
  "microbt-whatsminer-m60s-186th": {
    releaseDate: "2023-10-31",
    dimensions: dims(430, 155, 240),
    weightKg: 14,
    operatingTempC: "-5 to 35 °C",
    ambientC: "below 30 °C",
    fanCount: 2,
    coolingDetail: "Forced air (2 fans)",
  },
  "microbt-whatsminer-m60-172th": {
    releaseDate: "2023-10-31",
    fanCount: 2,
    coolingDetail: "Forced air (2 fans)",
  },
  "microbt-whatsminer-m50s-126th": {
    releaseDate: "2022-07-01",
    dimensions: dims(390, 155, 240),
    weightKg: 12.8,
    operatingTempC: "-5 to 35 °C",
    ambientC: "below 30 °C",
    fanCount: 2,
    coolingDetail: "Forced air (2 fans)",
  },
  "microbt-whatsminer-m30s-plus-plus-112th": {
    releaseDate: "2020-04-01",
    dimensions: dims(390, 155, 240),
    weightKg: 12,
    operatingTempC: "-5 to 35 °C",
    ambientC: "below 30 °C",
    fanCount: 2,
    coolingDetail: "Forced air (2 fans); factory hydro variant: M30S++ Hydro",
  },

  // -------------------------------------------------------------------------
  // Canaan · SHA-256
  "canaan-avalon-a1566-185th": {
    releaseDate: "2024-10-30",
    operatingTempC: "-5 to 35 °C",
  },
  "canaan-avalon-a1466-150th": {
    releaseDate: "2023-09-01",
    dimensions: dims(360, 170, 282),
    weightKg: 12.8,
    operatingTempC: "-5 to 35 °C",
  },
  "canaan-avalon-nano-3-4th": {
    releaseDate: "2024-03-01",
  },

  // -------------------------------------------------------------------------
  // Bitaxe · SHA-256 home miner
  "bitaxe-bitaxe-gamma-1-2th": {
    releaseDate: "2024-08-01",
    dimensions: dims(95, 55, 35),
    weightKg: 0.3,
    fanCount: 1,
    fanSize: "40 mm",
    coolingDetail: "Single 40 mm fan on heatsink",
  },

  // -------------------------------------------------------------------------
  // Scrypt
  "bitmain-antminer-l9-16gh": {
    releaseDate: "2024-05-31",
    noiseDb: 75,
    fanCount: 4,
    coolingDetail: "Forced air (4 fans)",
    priceRange: price(3045, 3323, 3127.5, 8),
  },
  "bitmain-antminer-l7-9-5gh": {
    releaseDate: "2021-11-30",
    voltage: "200–240 V AC",
    psu: "APW12",
    psuDetail: "14–17 V · 3,600 W (L7 variant)",
    circuit: "240 V / 20 A",
    operatingTempC: "0 to 40 °C",
    ambientC: "15–35 °C",
    fanCount: 4,
    coolingDetail: "Forced air (4 fans)",
  },
  "elphapex-dg1-plus-14gh": {
    releaseDate: "2024-04-20",
    priceRange: price(1805, 1876, 1863, 4),
  },
  "elphapex-dg-home-1-2-1gh": {
    releaseDate: "2024-12-31",
  },

  // -------------------------------------------------------------------------
  // kHeavyHash
  "bitmain-antminer-ks5-pro-21th": {
    releaseDate: "2024-03-01",
    noiseDb: 76,
  },
  "bitmain-antminer-ks3-9-4th": {
    releaseDate: "2023-08-30",
  },
  "iceriver-ks5l-12th": {
    releaseDate: "2024-04-30",
  },
  "iceriver-ks3m-6th": {
    releaseDate: "2023-09-30",
  },
  "iceriver-ks0-ultra-400gh": {
    releaseDate: "2024-06-01",
  },
  "goldshell-e-ka1m-5-5th": {
    releaseDate: "2024-09-01",
    dimensions: dims(443, 360, 135),
    weightKg: 16,
    noiseDb: 60,
  },

  // -------------------------------------------------------------------------
  // Equihash, Etchash, X11, Eaglesong
  "bitmain-antminer-z15-pro-840ksol": {
    releaseDate: "2023-06-05",
    priceRange: price(7100, 11424, 10474, 11),
  },
  "bitmain-antminer-z15-420ksol": {
    releaseDate: "2020-06-20",
    priceRange: price(4960, 4960, 4960, 1),
  },
  "bitmain-antminer-e9-pro-3-68gh": {
    releaseDate: "2023-02-28",
    priceRange: price(815, 815, 815, 1, "used"),
  },
  "bitmain-antminer-d9-1770gh": {
    releaseDate: "2023-02-28",
    priceRange: price(1498, 1760, 1590.5, 6),
  },
  "bitmain-antminer-k7-63-5th": {
    releaseDate: "2023-01-20",
  },

  // -------------------------------------------------------------------------
  // RandomX (imported from BackPoW into Convex; not in the built-in catalog)
  "bitmain-antminer-x9": {
    releaseDate: "2026-07-01",
    dimensions: dims(361, 219, 293),
    weightKg: 17.5,
    grossWeightKg: 20.2,
    noiseDb: 76,
    voltage: "220–277 V AC",
    frequencyHz: "50–60 Hz",
    currentA: 20,
    circuit: "Single-phase",
    interface: "RJ45 10/100M",
    operatingTempC: "-20 to 45 °C",
    storageTempC: "-40 to 70 °C",
    humidity: "10–90% RH",
    altitudeM: "≤ 2,000 m",
    fanCount: 4,
    airflowCfm: 480,
    coolingDetail: "Forced air (4 fans)",
    officialSource: {
      label: "Bitmain X9 product manual",
      url: "https://apextomining.com/apexto/uploads/2025/12/X9-Product-Manual-V1.1.0.pdf",
    },
  },
};

export function getMinerSpecs(slug: string): MinerSpecs | undefined {
  return MINER_SPECS[slug];
}

export const SPEC_SOURCES = {
  dcentral: {
    label: "D-Central hardware references (CC BY 4.0)",
    url: "https://d-central.tech/asic-dimensions-reference/",
  },
  whattomine: {
    label: "WhatToMine ASIC database",
    url: "https://whattomine.com/asic",
  },
  backpow: {
    label: "BackPoW — The Proof of Work Oracle (CC BY 4.0)",
    url: "https://backpow.com/hardwareIndex.json",
  },
} as const;
