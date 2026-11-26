// Reviewed mapping from our curated miners (stable URLs, detailed specs) to BackPoW hardware entries.
// Matched on manufacturer + hashrate and power within 2%, then checked by hand (25 Nov 2026).
// Fuzzy name matching is NOT used: it confuses variants such as S21 XP Hyd vs S21 XP+ Hyd.

export const CURATED_TO_BACKPOW: Record<string, string> = {
  "bitmain-antminer-s21-xp-plus-hyd-500th": "bitmain-antminer-s21-xp-hyd", // BackPoW name: "Antminer S21 XP+ Hyd"
  "bitmain-antminer-s21-xp-hyd-473th": "bitmain-antminer-s21-xp-hydro",
  "bitmain-antminer-s21-hyd-335th": "bitmain-antminer-s21-hydro",
  "bitmain-antminer-s21-xp-270th": "bitmain-antminer-s21-xp",
  "bitmain-antminer-s21-pro-234th": "bitmain-antminer-s21-pro",
  "bitmain-antminer-s21-plus-216th": "bitmain-antminer-s21-1", // BackPoW name: "Antminer S21+"
  "bitmain-antminer-s21-200th": "bitmain-antminer-s21",
  "bitmain-antminer-t21-190th": "bitmain-antminer-t21",
  "bitmain-antminer-s19-xp-140th": "bitmain-antminer-s19-xp",
  "bitmain-antminer-s19k-pro-120th": "bitmain-antminer-s19k-pro",
  "bitmain-antminer-s19j-pro-104th": "bitmain-antminer-s19j-pro-104th",
  "microbt-whatsminer-m63s-390th": "microbt-whatsminer-m63s-hydro",
  "microbt-whatsminer-m66s-298th": "microbt-whatsminer-m66s", // immersion model; not the "M66S Hydro" entry
  "microbt-whatsminer-m60-172th": "microbt-whatsminer-m60",
  "microbt-whatsminer-m50s-126th": "microbt-whatsminer-m50s",
  "canaan-avalon-a1566-185th": "canaan-avalon-1566",
  "canaan-avalon-a1466-150th": "canaan-avalon-1466",
  "canaan-avalon-nano-3-4th": "canaan-avalon-nano-3",
  "bitaxe-bitaxe-gamma-1-2th": "bitaxe-gamma-601",
  "bitmain-antminer-l9-16gh": "bitmain-antminer-l9-16gh",
  "bitmain-antminer-l7-9-5gh": "bitmain-antminer-l7-9500mh",
  "elphapex-dg-home-1-2-1gh": "elphapex-dg-home-1",
  "bitmain-antminer-ks5-pro-21th": "bitmain-antminer-ks5-pro",
  "bitmain-antminer-ks3-9-4th": "bitmain-antminer-ks3",
  "iceriver-ks5l-12th": "iceriver-ks5l",
  "iceriver-ks3m-6th": "iceriver-ks3m",
  "iceriver-ks0-ultra-400gh": "iceriver-ks0-ultra",
  "goldshell-e-ka1m-5-5th": "goldshell-e-ka1m",
  "bitmain-antminer-z15-pro-840ksol": "bitmain-antminer-z15-pro",
  "bitmain-antminer-z15-420ksol": "bitmain-antminer-z15",
  "bitmain-antminer-e9-pro-3-68gh": "bitmain-antminer-e9-pro",
  "bitmain-antminer-d9-1770gh": "bitmain-antminer-d9",
  "bitmain-antminer-k7-63-5th": "bitmain-antminer-k7",
};

/**
 * Curated entries whose hand-entered specs were not confirmed by BackPoW within 2%. They are
 * retired so the sourced BackPoW entries are shown instead.
 */
export const RETIRED_CURATED: Record<string, string> = {
  "microbt-whatsminer-m60s-186th": "BackPoW lists M60S at 169.78 TH/s / 3,150 W (see microbt-whatsminer-m60s)",
  "microbt-whatsminer-m30s-plus-plus-112th": "BackPoW lists 106T and 110T variants only",
  "elphapex-dg1-plus-14gh": "BackPoW lists DG1+ at 14.37 GH/s / 3,950 W (see elphapex-dg1-1)",
};
