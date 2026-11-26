# NowMining — data, pricing and quality report

**Prepared for:** stakeholders
**Date:** 26 November 2026
**Scope:** what the site actually has today, how every displayed number is obtained, and what must be fixed before production launch.

---

## 1. Executive summary

NowMining is an ASIC-miner directory: a searchable catalog, per-miner profitability, market price references, seller offers, and our own recorded network history. Every factual value shown on a miner page comes from a named third-party source or is computed from those values. Unknown values are hidden — they are never shown as `0` and never estimated from a similar model.

**Verified state of the live development database (queried 26 Nov 2026):**

| Item | Count |
| --- | ---: |
| Miner records | 624 |
| — curated ("manual") miners | 33 |
| — imported from BackPoW | 591 |
| Distinct algorithms | 22 |
| Miners with a release year | 33 |
| Miners with a price range | 523 |
| — verified ranges (`estimated: false`) | 97 |
| — estimated ranges (hidden in the UI) | 426 |
| Vendors | 7 (1 real, 6 sample) |
| Offers | 148 (27 real, 121 sample) |
| Duplicate slugs / invalid hashrate or power / malformed price ranges | 0 |

**Evidence:** verbatim samples from every source and the derivation of the four homepage numbers are in `docs/data-samples.md`. An honest live / curated / generated classification and the state of admin tooling are in `docs/data-classification.md`.

**Presentation:** the homepage is now list-first, matching the leading ASIC directories: a slim intro, the miner table, then the market snapshot. The table uses real coin logos, curated manufacturer brand icons for 33 brands (monogram fallback), overlapping coin icons for multi-coin miners, and a price-per-hash subline. The feature-by-feature comparison, icon sources and remaining visual gaps are in `docs/competitive-parity.md`.

**Recommendation:** do **not** switch production on yet. The data itself is clean and honestly filtered, but six launch blockers remain: attribution, production environment isolation, WhatToMine terms, thin offer coverage, signup/email tooling, and uncommitted changes. Details in section 9.

---

## 2. Important correction on "reverse engineering"

No part of this system was reverse-engineered from MiningNow or ASICMinerValue.

- **MiningNow:** one public miner page was viewed once as a *presentation benchmark* (which specification fields readers expect: hashrate, power, efficiency, weight, dimensions, noise, temperature, humidity, interface). No code, bulk data, or content was extracted from that site. The values we display were independently sourced and verified against the manufacturer's own datasheet — for example, the S21 XP figures 449 × 219 × 293 mm, 18.7 kg, 76 dB, 220–277 V AC, 6,400 RPM and 480 CFM come from Bitmain's official S21 XP specification page, not from MiningNow.
- **ASICMinerValue:** has no public API and is explicitly listed as **"do not scrape"** in our data policy (`docs/data-sources.md:52`). No data from it is used anywhere.
- **ASICProfit / MiningPoolStats:** same policy — not used.

So the accurate statement for stakeholders is: *spec presentation was benchmarked against a public MiningNow page; all data is sourced from the providers listed in section 3, with manufacturer datasheets as the source of truth.*

---

## 3. Data sources actually in use

| Source | What we take | Access / cost | Licence & obligation | Runtime use |
| --- | --- | --- | --- | --- |
| **BackPoW** (`backpow.com/hardwareIndex.json`, `coins-data/{coin}.json`) | ASIC specs, per-coin hashrate and watts, market price ranges; network hashrate, block time, reward, USD price, 30-day history | Public, no key | **CC BY 4.0** — credit "BackPoW — The Proof of Work Oracle", link, retrieval date | Yes: coins hourly, miners daily |
| **D-Central** (`/wp-json/dc/v1/miners`, static JSON, dedicated reference datasets) | Noise, dimensions, weight, voltage, circuit, thermal limits, fan and cooling data, release timeline | Public, no key; ~60 req/min courtesy | **CC BY 4.0** — credit, link, indicate changes | One-time curated import only; not called at runtime |
| **WhatToMine API v1** (`/api/v1/asics`) | Canonical ASIC list (522 records) and release dates | Token; 1,000 req/month, **0 used** | ToS: no explicit redistribution licence; clause against apps that "replicate or attempt to replace the essential user experience" | **No.** Used once, offline; no WhatToMine fetch exists in the runtime code |
| **Manufacturer datasheets** (Bitmain support pages and product manuals) | Authoritative physical, electrical and environmental specifications | Public | Manufacturer content; used as source of truth | Embedded as curated values in `lib/miner-specs.ts` |
| **CoinGecko** (`simple/price`) | Live USD price overlay for 12 coin IDs; FX rates derived from BTC price in each currency | Demo key | CoinGecko attribution required | Yes, cached 10 minutes; falls back to stored BackPoW price |
| **mempool.space** | Bitcoin network height, fees and hashprice in `/api/network` | Public | Free API terms | Yes, cached 5 minutes |

**Explicitly not used:** Hashrate Index / Luxor (key not obtained), Minerstat (free tier is non-commercial and capped), ASICMinerValue, ASICProfit, MiningPoolStats.

---

## 4. How data is gathered and flows

```
BackPoW hardwareIndex.json ──daily 03:15 UTC──> Convex miners table
BackPoW coins-data/*.json ──hourly :05 UTC────> Convex coins table
                                      │
                                      ├──hourly :20 UTC──> Convex marketSnapshots (our own history)
                                      │
Convex coins + CoinGecko overlay ─────┴──> getMarket() ──> profitability on every page
Convex miners + curated specs ───────────────> miner pages, filters, rankings
```

- `convex/crons.ts:7-14` defines the schedule above (plus a weekly partner-link recheck).
- `convex/backpow.ts:96-146` imports coin data with 3 retries, 3 concurrent workers, and rejects invalid numbers instead of publishing them; previous values are kept on failure.
- `convex/backpow.ts:249-303` imports only ASIC rows, derives algorithm from the majority of its coins, infers cooling from the name, and stores `min/max/median/count/condition/estimated` for price. Miners that disappear from the source are **deactivated, never deleted** (`convex/backpow.ts:216-232`).
- `convex/market.ts:8-27` snapshots the live coin table hourly. The 30-day backfill uses BackPoW's real recorded price/hashrate history but applies **current** block reward and block time to every day (`convex/market.ts:29-56`) — this is a documented approximation, not fabricated history.
- The fallback market snapshot (`lib/market-core.ts:31-46`) is a fixed capture dated 25 Nov 2026 and is labelled `source: "snapshot"`; it is only used when the live database is unreachable.

---

## 5. How prices are presented

There are three distinct price concepts; the UI keeps them separate.

1. **Market reference range (real market data).** From BackPoW, stored per miner as `min`, `median`, `max`, listing `count`, `condition` and an `estimated` flag. The miner page shows the range, median, listing count and condition. Rows marked `estimated: true` are **never displayed** — 426 of 523 are excluded for this reason. The curated snapshot additionally carries 17 hand-verified non-estimated ranges.
2. **Seller offers (actual listings).** Price + shipping, condition, availability, warranty and update time. In production, only public vendors are visible; sample vendors and their offers are filtered out (`convex/directory.ts:16`, `lib/directory.ts:18-32`). Today's development database contains **one real seller (OneMiners, 27 offers)** and six sample vendors (121 offers) that will not ship to production.
3. **Live coin prices.** BackPoW's stored USD price is primary; CoinGecko overlays 12 IDs every 10 minutes; if CoinGecko fails, the stored price is used. FX is derived from CoinGecko's BTC price in each supported currency (`app/api/fx/route.ts`).

**Profitability model** (`lib/economics.ts:128-135, 221-225`):

```
share     = miner hashrate ÷ network hashrate
blocks/day= 86,400 ÷ block time
coins/day = share × blocks/day × block reward
USD/day   = coins/day × coin price
profit    = revenue − (1% pool fee) − (power kW × 24 × $0.07/kWh)
```

Default assumption is **$0.07/kWh and 1% pool fee**; users can change both. The model flags low-volume coins (<$100k) and implausible network shares (>5%).

---

## 6. Specification coverage and accuracy rules

`lib/miner-specs.ts` contains **37 manually reviewed entries** (33 catalog miners, 3 retired catalog slugs, plus the imported X9). Counts: 37 release dates, 16 dimension sets, 7 noise values, 4 manufacturer-datasheet overrides, 17 curated market ranges. Each miner page renders up to 18 non-duplicating tiles in the hero, including derived energy/day, heat output (W × 3.412142 BTU/h), energy/year, and every published physical/electrical/environmental field available for that model.

Rules enforced in code and curation:

- No field is invented or borrowed from a similar model; unknown fields are omitted.
- Manufacturer datasheet wins when sources disagree; the losing value is dropped, not averaged.
- `estimated: true` price rows are hidden.
- Sample vendors/offers are excluded from production builds and from the Convex public snapshot.
- Every spec tile carries attribution links and a "report an error" link.

**Documented conflict resolutions:**

| Model | Conflict | Resolution |
| --- | --- | --- |
| S21 XP | D-Central dimensions 400 × 195 × 290 mm / 15.4 kg contradict Bitmain's 449 × 219 × 293 mm / 18.7 kg | Bitmain official values used; D-Central values dropped |
| S21 XP+ Hyd | Jan 2025 manual 339 × 173 × 207 mm / 14.8 kg vs Nov 2025 revision 430 × 176 × 208 mm / 16.2 kg | Dimensions/weight omitted; electrical and water specs used |
| Z15 Pro | WhatToMine 2,560 W vs catalog / BackPoW / D-Central 2,780 W | 2,780 W used (two independent sources agree) |
| M60S | WhatToMine 170 TH bin vs D-Central timeline 186 TH / 3,441 W | Only the release date was taken from WhatToMine |
| X9 (imported) | BackPoW headline 997 kH/s / 2,500 W vs Bitmain manual 1,000 kH/s / 2,472 W | Both retained: headline uses the imported value, physical specs use the manual. Difference is within the manufacturer's stated ±5% tolerance; this should be disclosed |

---

## 7. Known gaps (honest limitations)

- 591 of 624 miners have **no release year and no curated physical specifications**; their pages show derived energy/heat figures and, where verified, a market range only.
- Only **97** miners have a non-estimated market price range.
- Only **27 real seller offers** exist (OneMiners). Most miner pages therefore show "no seller lists this miner yet" — this is truthful but commercially thin.
- The site's metadata still says "full specs" for every miner; that overstates coverage for imported miners and should be softened.
- The UI algorithm filter lists 7 of the 22 algorithms present in the database.
- No automated importer unit tests exist yet; the curated file was reviewed by hand.
- There is no admin UI to view or export newsletter/contact signups and no bulk-email capability; leads are stored in Convex and can currently only be read via CLI or a webhook (`docs/data-classification.md §7`).
- No licensed product photos. The directory uses real coin logos and curated brand favicons for 33 manufacturers (monogram fallback for the rest); product imagery still needs permission or licensed assets.

---

## 8. Compliance status

| Obligation | Status |
| --- | --- |
| D-Central CC BY 4.0 credit, link, indication of changes | On every miner page in the spec panel; **missing from the site-wide data page** |
| BackPoW CC BY 4.0 credit, link, retrieval date | Per-page spec panel and home-page footer; retrieval date in `docs/data-sources.md`, not on the page |
| CoinGecko attribution | Home-page footer only |
| WhatToMine ToS | **Written permission not obtained**; runtime no longer calls the API, but 37 release dates were sourced from it |
| `/data-sources` page | **Not built.** `/data` exists but contains no source list |

The footer currently says specs and market ranges come via BackPoW; physical specs actually come from D-Central and manufacturer datasheets. This text must be corrected before launch.

---

## 9. Go-live recommendation

**Not ready today.** Complete these five items:

1. Fix attribution: correct the footer text, add a source list to `/data` (or build `/data-sources`), include the BackPoW retrieval date and D-Central CC BY citation.
2. Isolate environments: point production at its own Convex deployment, push schema/functions with `npx convex deploy`, set server-side keys, and ensure `SAMPLE_DATA` is **not** `allowed`.
3. Resolve WhatToMine terms: obtain written permission or remove/re-source the release dates.
4. Seed and verify production data: confirm real offers and that the six sample vendors never appear.
5. Decide how signups will be viewed and emailed (webhook, admin export or CRM), add consent/unsubscribe, and remove the unimplemented lead claims on `/sell`.
6. Commit and review the ~60 changed files, including the regenerated `convex/_generated/api.d.ts`; soften the "full specs" metadata claim.

After those are done, the data layer is suitable for production: it is sourced, filtered, reproducible and contains no known fabricated values.

---

## 10. Source URLs and retrieval

- BackPoW hardware index: `https://backpow.com/hardwareIndex.json`
- BackPoW coin data: `https://backpow.com/coins-data/{coinId}.json`
- D-Central miner API: `https://d-central.tech/wp-json/dc/v1/miners`
- D-Central static database: `https://d-central.tech/data/asic-miner-database.json`
- D-Central dimensions reference: `https://d-central.tech/asic-dimensions-reference/`
- WhatToMine ASIC API: `https://whattomine.com/api/v1/asics` (one-off, offline)
- Bitmain S21 XP: `https://support.bitmain.com/hc/en-us/articles/35383015643673-S21-XP-Specifications`
- Bitmain S21 XP Hyd: `https://support.bitmain.com/hc/en-us/articles/34523540504857-S21-XP-Hyd-Specification`
- Bitmain S21 XP+ Hyd manual: `https://apextomining.com/apexto/uploads/2025/02/S21-XP-Hyd.-Product-Manual.pdf`
- Bitmain X9 manual: `https://apextomining.com/apexto/uploads/2025/12/X9-Product-Manual-V1.1.0.pdf`
- CoinGecko: `https://api.coingecko.com/api/v3/simple/price`
- mempool.space: `https://mempool.space/api/...`

All third-party payloads used for curation were retrieved 25–26 November 2026 and are documented in `docs/data-sources.md`.
