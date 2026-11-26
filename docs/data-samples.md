# Data evidence appendix

**Prepared:** 26 November 2026
**Companion to:** `docs/stakeholder-report.md`

Every JSON excerpt below is copied verbatim from the named payload. Where an array is shortened, the omission is marked. Raw third-party payloads are kept in `C:\Users\KEVINV~1\AppData\Local\Temp\opencode\mining-data\` and are **not committed**; this appendix is the committed evidence of what those payloads contained.

---

## 1. The four homepage numbers — how they are produced

Source code: `components/Hero.tsx:14-30`.

| Homepage stat | Verified value | Exact derivation | Underlying data |
| --- | --- | --- | --- |
| **Miners tracked** | **624** | `dir.miners.length` — the number of active miner records returned by `directory:snapshot` (`convex/directory.ts:50-53`, cap 2,000) | 33 curated/manual miners + 591 miners imported from BackPoW. Verified by direct Convex query on 26 Nov 2026 |
| **Profitable at $0.07/kWh** | **135** at the time of this audit (136 when first checked) | For each miner: take its highest-earning coin (`revenuesFor()[0]`), drop rows flagged `caution`, compute `dailyProfit(usdPerDay, powerW, {electricity: 0.07, poolFee: 1})`, count `profit > 0` (`Hero.tsx:14-23`, `economics.ts:221-225`) | Convex `coins` network state + CoinGecko overlay (`lib/market.ts`). The count moves hourly as prices and network difficulty change — 136 → 135 is a live-data change, not a correction |
| **With seller prices** | **33** on this development deployment | Count miners where `bestPrice(dir, slug) !== null` — i.e. at least one in-stock or pre-order offer from a visible vendor (`Hero.tsx:24`, `lib/directory.ts:127-133`) | 148 offers cover 33 distinct miners in development. **In production the six sample vendors are hidden, so the same calculation yields 27** (OneMiners only). This stat must be read as "miners with a listed offer", not "miners with a market price range" |
| **Hosting from** | **3.6¢/kWh** | `LOWEST_HOSTING_RATE` = minimum of the 7 rates in `lib/hosting.ts:11-31`; Nigeria is 0.036 USD/kWh | OneMiners hosting map published on oneminers.com, captured 25 Nov 2026. Other sites: 4.4¢ Norway, 4.5¢ Georgia/Houston/West Texas, 4.6¢ Dubai, 5.8¢ Ethiopia |

The "most profitable today" card beside the stats is the top row of the same ranked list; at this audit it was the imported **Bitmain Antminer X9** (displayed 997 kH/s, 2,500 W), showing **$25.74/day** at $0.07/kWh and 1% pool fee. Ten minutes earlier the same card showed $25.82 — another example of the live inputs changing.

---

## 2. Raw samples actually received

### 2.1 BackPoW hardware index — miner + price

Source: `https://backpow.com/hardwareIndex.json` (retrieved 25 Nov 2026). Exact record for `Bitmain Antminer S21 XP` (coins array shortened to its first element):

```json
{
  "name": "Bitmain Antminer S21 XP",
  "slug": "bitmain-antminer-s21-xp",
  "type": "ASIC",
  "coins": [{ "coinId": "Bitcoin", "hashrate": 270756000000000, "watts": 3645 }],
  "price": {
    "condition": "new", "currency": "USD",
    "min": 3011, "max": 4062, "median": 3315, "avg": 3423.27,
    "count": 11, "estimated": false
  }
}
```

This is where the displayed **market range $3,011–$4,062** and **median $3,315** come from. `estimated: false` means it is shown; 426 other ranges in the database are `estimated: true` and are hidden.

### 2.2 BackPoW coin data — network state used for revenue

Source: `https://backpow.com/coins-data/Bitcoin.json` (live fetch 26 Nov 2026). Selected fields, verbatim:

```json
{
  "Algorithm": "SHA-256",
  "Block time": 553.661,
  "Bl. reward": 3.13,
  "Bl. reward 24h": 3.14,
  "Nethash": 1.0633824794872203e+21,
  "Ex. rate": "$60,825.24 (Binance)",
  "usdPrice": 60864,
  "usdPriceSource": "btc",
  "priceConfidence": "corroborated",
  "priceQuotes": [{ "source": "coingecko", "price": 60864, "volume": 38730505417 }],
  "volume24hUsd": 38730505417,
  "marketCapUsd": 1224280500431,
  "history30d": [{ "date": "2026-10-28", "usdPrice": 80952, "nethash": 1.0972081146653512e+21 }]
}
```

The importer stores `Nethash → nethashHs`, `Block time → blockTimeSec`, `Bl. reward → blockReward` and `usdPrice → priceUsd`. Revenue is `share × blocks/day × reward × price`, where `share = miner hashrate ÷ Nethash`.

### 2.3 D-Central miner API — cross-check and noise

Source: `https://d-central.tech/wp-json/dc/v1/miners` (retrieved 25 Nov 2026). Trimmed fields from the `Bitmain Antminer S21 XP version 10 reference` record:

```json
{
  "title": "Bitmain Antminer S21 XP version 10 reference",
  "url": "https://d-central.tech/miners/antminer-s21-xp/",
  "hashrate_value": 270, "hashrate_unit": "TH/s",
  "power_consumption": 3645, "efficiency": 13.5,
  "noise_level": 76,
  "miner_status": "OEM support reference",
  "msrp": 0, "btu_output": 0,
  "source_reviewed_at": "2026-08-27",
  "primary_sources": [{
    "title": "Bitmain S21 XP specification",
    "url": "https://support.bitmain.com/hc/en-us/articles/35383015643673-S21-XP-Specifications"
  }]
}
```

`msrp: 0` and `btu_output: 0` mean **unpublished**, not zero. They are never displayed. `noise_level: 76` is displayed as the 76 dB tile.

### 2.4 D-Central dimensions reference — a discarded value

Source: `https://d-central.tech/asic-dimensions-reference/` (retrieved 25 Nov 2026). Verbatim row:

```json
{
  "id": "antminer-s21-xp",
  "model": "Antminer S21 XP",
  "cooling": "air",
  "length_mm": 400, "width_mm": 195, "height_mm": 290,
  "net_weight_kg": 15.4, "gross_weight_kg": "unverified",
  "source": "D-Central dc_miner spec registry; dimensions cross-checked vs Bitmain S21 XP spec sheet",
  "last_verified": "2026-06"
}
```

Bitmain's own datasheet says **449 × 219 × 293 mm and 18.7 kg**. Because the manufacturer wins conflicts, this D-Central row is **not displayed** for the S21 XP; only the manufacturer values are.

### 2.5 WhatToMine ASIC list — release date only

Source: `https://whattomine.com/api/v1/asics` (one-off offline fetch, 25 Nov 2026; 0 monthly requests used by the site at runtime). Verbatim row:

```json
{
  "id": 321,
  "name": "Antminer S21 XP",
  "manufacturer": "Bitmain",
  "model": "Antminer S21 XP",
  "variant": null,
  "release_date": "2024-10-30",
  "algorithms": [{ "name": "SHA-256", "hashrate": "270000000000000.0", "power": 3645 }]
}
```

Only `release_date` is used, rendered as **Released Oct 30, 2024**. This API is not called by the running site.

### 2.6 Convex stored miner — what the page actually reads

Query `directory:snapshot`, record for the curated S21 XP (coins array shortened):

```json
{
  "algorithm": "SHA-256", "backpowSlug": "bitmain-antminer-s21-xp",
  "category": "Industrial", "cooling": "Air",
  "hashrate": 270, "manufacturer": "Bitmain", "model": "Antminer S21 XP",
  "powerW": 3645,
  "priceRange": { "condition": "new", "count": 11, "estimated": false, "max": 4062, "median": 3315, "min": 3011 },
  "refPrice": 3315, "release": 2024,
  "slug": "bitmain-antminer-s21-xp-270th",
  "source": "manual", "unit": "TH/s",
  "updatedAt": 1795662901817,
  "coins": [{ "coinId": "Bitcoin", "hashrateHs": 270756000000000, "watts": 3645 }]
}
```

This record is the join point: BackPoW supplies `priceRange` and per-coin hashrate/watts, while the curated slug, release year and core specs stay stable.

### 2.7 Convex coin state — the live revenue input

Query `directory:marketCoins`, Bitcoin record (30-day history shortened to two rows):

```json
{
  "algorithm": "SHA-256", "blockReward": 3.14, "blockTimeSec": 559.052,
  "coinId": "Bitcoin", "name": "Bitcoin", "tag": "BTC",
  "nethashHs": 1.0557815702994045e+21, "priceUsd": 59125,
  "priceConfidence": "corroborated", "marketCapUsd": 1189387367352,
  "volume24hUsd": 28262087652, "updatedAt": 1795665946638,
  "history": [
    { "date": "2026-10-27", "nethashHs": 1.0878000944996765e+21, "priceUsd": 79687 },
    { "date": "2026-10-28", "nethashHs": 1.0972081146653512e+21, "priceUsd": 80952 }
  ]
}
```

The stored price (59,125) is the hourly import; the live BackPoW file in §2.2 had already moved to 60,864 when fetched later — a normal illustration of why profitability numbers change between checks.

---

## 3. Worked example: one miner, from raw data to displayed tiles

| Displayed value | Source record | Rule |
| --- | --- | --- |
| Hashrate 270 TH/s, Power 3,645 W, Efficiency 13.5 J/TH | D-Central API + Bitmain datasheet (§2.3) | Manufacturer-value agreement; computed efficiency = power ÷ hashrate |
| Released Oct 30, 2024 | WhatToMine (§2.5) | Only exact model match; date formatted from ISO |
| Market range $3,011–$4,062 · 11 listings · new; median $3,315 | BackPoW (§2.1) | Only `estimated: false` rows are shown |
| Noise 76 dB | D-Central API (§2.3) | Published value only |
| Dimensions 449 × 219 × 293 mm, 18.7 kg | Bitmain S21 XP specification | Manufacturer overrides D-Central's conflicting 400 × 195 × 290 mm / 15.4 kg (§2.4) |
| Energy/day 87.5 kWh, heat 12,437 BTU/h, energy/year 31,930 kWh | Computed from 3,645 W | `W/1000 × 24`; `W × 3.412142`; `× 365` |
| Profit at $0.07/kWh | Convex coin state (§2.7) + BackPoW per-coin hashrate | `share × blocks/day × reward × price`, minus 1% pool fee and electricity |

Nothing on that page is inferred from a different model, and no unpublished value appears as `0`.

---

## 4. Dynamic and dev/prod caveats

- The profitable count, leader and coin prices are **live**; 136 and 135 are both correct readings at different times on 26 Nov 2026.
- "With seller prices" is **33 in development** and **27 in production** because sample vendors are filtered out. It counts miners with an offer, not miners with a BackPoW market range (523 miners have one; 97 are verified).
- The stored coin state and the live BackPoW file differ by the hourly import lag; the site uses the stored state and overlays CoinGecko for 12 coin IDs.
- All raw payloads are dated 25–26 November 2026. Re-running an import will legitimately change these numbers.
