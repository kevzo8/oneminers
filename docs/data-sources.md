# Data sources and data-quality playbook

Last verified: **25 November 2026**. Owner: MinerPicks.

This is the operating document for every piece of third-party data the site shows. It records what
each source actually returns, what we are allowed to do with it, how we validate it, and what we
refuse to publish. Read it before adding a feed or a spec field.

> **Current pipeline (live in code):** BackPoW is the primary source.
> - `convex/backpow.ts` imports `hardwareIndex.json` daily (all ~624 ASIC models: hashrate and power per coin, market price ranges) and `coins-data/{id}.json` hourly (network hashrate, block time and reward, price, volume, 30-day history) into the `miners` and `coins` tables.
> - Our 33 curated models keep their hand-verified specs; BackPoW adds coins and price ranges. Models BackPoW drops are hidden, not deleted.
> - Coins with `no_market` price confidence, zero price or zero hashrate are excluded. Coins with under $100k of 24h volume, or where one miner would be over 5% of the network, are flagged and ranked last.
> - CoinGecko refreshes prices for the 12 major coins every 10 minutes. WhatToMine is no longer called by the code; the sections below are kept as research notes.
> - Attribution: "Network data and miner specs via BackPoW" in the site footer and on the miners and coins pages.

---

## 1. What "perfect data" means here

No third-party feed is perfect: manufacturers revise hash boards and firmware, variant names drift,
and sources disagree. What we can guarantee is **provenance, validation and reproducibility**:

1. Every displayed value has a source, a source URL, a retrieval timestamp and a confidence level.
2. Nothing is inferred from a similar model. Unknown stays unknown and is hidden, never shown as `0`.
3. Conflicting sources are surfaced, not silently averaged.
4. Every import is diff-reviewable and every refresh is dated.
5. A human spot-check gates any new source before it can affect rankings or prices.

If a value cannot meet these rules, it does not ship.

---

## 2. Source inventory (all tested live)

| Source | Access | Limits | Licence / terms | What we use it for | Status |
| --- | --- | --- | --- | --- | --- |
| **WhatToMine API v1** (`/api/v1/asics`, `/api/v1/coins`, `/api/v1/algorithms`) | `Authorization: Token <key>` or `?api_token=` | **1,000 requests/month** on the current token (headers verified; 0 used) | WhatToMine ToS; **no explicit redistribution licence**. ToS forbids apps that "replicate or attempt to replace the essential user experience" of WhatToMine | Canonical ASIC list (522 models), release dates, manufacturer/model/variant, coin network stats | Verified HTTP 200 |
| **WhatToMine keyless JSON** (`/asic.json`, `/coins.json`) | none | fair use | same ToS | fallback only when the paid API is unavailable | Already integrated |
| **D-Central Mining API** (`/wp-json/dc/v1/miners`) | none | ~60 req/min courtesy, `Cache-Control: max-age=60` | **CC BY 4.0**; credit D-Central, link back, indicate changes | ASIC specs: hashrate, power, J/TH, algorithm, sparse noise/weight/dimensions/temps/voltage | Verified HTTP 200, 487 records |
| **D-Central static exports** (`/data/asic-miner-database.json` and `.csv`) | none | none (static files) | **CC BY 4.0** | bulk core specs: model, maker, algo, hashrate, power, efficiency, status (494 records; **no noise/weight/dimensions**) | Verified HTTP 200 |
| **Backpow** (`/hardwareIndex.json`, `/coins-data/{Coin}.json`) | none | none (CDN) | **CC BY 4.0**; cite "BackPoW — The Proof of Work Oracle", link, retrieval timestamp | real price ranges (min/median/max/avg/count/`estimated`), per-coin hashrate + watts; network stats | Verified HTTP 200, 856 devices (624 ASIC) |
| **Hashrate Index / Luxor** (`/asic/models`, `/asic/price-per-model`, `/asic/release-history`, `/asic/price-history`) | `X-Hi-Api-Key` header | burst 20, then 1 request / 15 s | Luxor API terms (per key) | dimensions, weight, voltage, release date, ASIC price history | Docs verified; **key needed** |
| **Minerstat** (v2/v3) | API key | Free: 100 req/month, **20-result cap**; Developer: 5,000, **personal/non-commercial**; Enterprise: 100,000, commercial | no bulk redistribution; competing data service not allowed | cross-checks only, if we buy Enterprise | Key needed; **not suitable on free plan** |
| **CoinGecko** (`/coins/markets`) | Demo key | ~30 req/min, ~10k/month | CoinGecko attribution per plan | market cap, 24h change, sparklines | Already integrated |
| **CoinPaprika** (`/v1/tickers`) | none | fair use | free API terms | price/volume cross-checks | Verified keyless |
| **CoinMetrics community** | none | community limits | free community licence | BTC network hashrate history | Verified keyless |
| **Blockchair** | none / free tier | free-tier limits | Blockchair terms | BTC/LTC chain stats cross-checks | Verified keyless |
| **mempool.space** | none | rate-limited | free API | BTC network/height/fees | Already integrated |
| **Frankfurter** | none | none | ECB data | USD→EUR/GBP/PHP FX | **Not integrated.** `/api/fx` currently derives rates from CoinGecko's BTC price in each currency; Frankfurter is the planned replacement |
| **Shopify `products.json`** | none | vendor-dependent | vendor terms | live prices/stock for **oneminers.com only** (others 403/429/404) | **Unconfirmed:** returned a Cloudflare bot check (HTTP 403) when re-tested 25 Nov 2026; ask OneMiners for API access instead |

**No public API — do not scrape:** ASICMinerValue, ASICProfit, MiningPoolStats.

### Measured coverage during initial curation (36 slugs at the time; the built-in catalog now contains 33)

| Source | Matched | Notes |
| --- | --- | --- |
| WhatToMine API | **34 / 36** | misses Canaan Avalon A1566/A1466 (naming variants); 522 ASICs available in total |
| Backpow | **34 / 36** | includes real price ranges; variant bins (e.g. L7 9050Mh) must be disambiguated by hashrate |
| D-Central | **15 / 36** with usable numeric specs | only 162 of 487 records have complete specs; noise 72, dimensions 45, weight 43, voltage 1, temps 13; `release_date` and `msrp` are **0 in the API**; 325 records are identity-only, 6 conflicted |

Fuzzy matching produced false positives (e.g. S21 XP Hyd ↔ S21 XP+ Hyd). Matching must stay
conservative and be reviewed before publishing.

---

## 3. Field-by-field source of truth

| Field | Primary | Corroborate | Rule |
| --- | --- | --- | --- |
| Slug / manufacturer / model / variant | WhatToMine API | Manufacturer page | Exact manufacturer + model + variant first; hashrate proximity only to disambiguate variants |
| Algorithm | WhatToMine API | D-Central | Both must agree; if they disagree, quarantine |
| Hashrate | Manufacturer datasheet | WhatToMine, Backpow, D-Central | Accept ≤3% spread; 3–5% flag; >5% quarantine |
| Power | Manufacturer datasheet | WhatToMine, Backpow, D-Central | Same tolerance as hashrate |
| Efficiency (J/TH) | **Computed** `powerW / hashrate` | D-Central `eff` | Never trust a single third-party efficiency number |
| Release date | WhatToMine API | Manufacturer press release | D-Central API `release_date` is 0 — do not use it |
| Noise (dB) | D-Central (only when > 0) | Manufacturer | Never estimate from cooling type; omit when unpublished |
| Dimensions / weight / voltage / operating temp | Manufacturer datasheet | D-Central strings (parse units) | Parse `"515 x 100 x 222 mm"` → mm; `"15.5 kg"` → kg; no guessing |
| MSRP | Manufacturer | — | D-Central `msrp` is 0 — do not use it |
| Market price | Backpow median | D-Central CAD price index; oneminers Shopify | Always show condition (new/used), currency, sample count, `estimated` flag and date |
| Coin network stats | WhatToMine live feed | Backpow, CoinMetrics, Blockchair, mempool.space | Existing hourly Convex snapshot remains our own history |
| Market cap / sparkline | CoinGecko | CoinPaprika | Display attribution |
| FX | CoinGecko BTC cross-rates (current) | Frankfurter (planned) | Cached in `/api/fx` |

---

## 4. Ingestion pipeline (the guarantee)

Build this as `scripts/import-specs.mjs` plus a generated `lib/specs.generated.ts` (committed) and a
`data/import-report.md` (committed). Raw third-party payloads stay out of git.

1. **Fetch** — one request each:
   - WhatToMine `/api/v1/asics` + `/api/v1/coins` (server-side key only; 2 of 1,000 monthly calls).
   - D-Central static JSON (bulk core specs); API `/miners` only for the sparse extras.
   - Backpow `hardwareIndex.json`.
2. **Normalise** — H/s, W, J/TH, mm, kg, °C, V, USD. Store the original string next to the parsed value.
3. **Match** — exact manufacturer + model + variant; then token match + hashrate within ±5%;
   everything else goes to `ambiguous` / `unmatched` in the report. No automatic best-guess publishing.
4. **Validate** — hard assertions before output:
   - hashrate > 0, power > 0, efficiency 5–150 J/TH (unless the algorithm makes that meaningless);
   - noise 30–90 dB, weight 0.1–200 kg, dimensions 50–1,000 mm, voltage 100–480 V, release 2015–2027;
   - price `min ≤ median ≤ max`, `count ≥ 1`;
   - unique slug; no duplicate (maker, model, variant).
5. **Cross-check** — hashrate/power diff vs manufacturer: ≤3% auto-accept, 3–5% flag, >5% quarantine.
6. **Emit** — per-slug record with `sources[]`, `fetchedAt`, `confidence` (`A` manufacturer,
   `B` two independent sources, `C` single source, `D` unverified — never displayed).
7. **Review** — read the match report and the generated diff; approve manually.
8. **Publish** — merge specs at `loadDirectory` time; show "Specs: source · updated" on miner pages.
9. **Refresh** — monthly; WhatToMine budget is 2 requests/refresh; prefer D-Central static files for bulk.
10. **Test** — unit tests for unit parsing, validators and the matcher; spot-check the top 20 miners
    against manufacturer pages every release.

---

## 4b. Status: implemented on miner pages (25 November 2026)

A **reviewed, curated first pass** is live in `lib/miner-specs.ts` and rendered by
`components/directory/MinerSpecs.tsx` as a dense spec panel in the miner page hero (replacing the
old empty illustration box). It shows only values that are not already in the headline tiles
(hashrate / power / efficiency) or the chips, so nothing is duplicated. It also uses the live
BackPoW `priceRange` stored on imported Convex miners, provided `estimated: false`. This is not yet
the automated pipeline described in section 4; it is the human-reviewed result of running those
matching rules once against the cached payloads. Raw dumps remain in
`C:\Users\KEVINV~1\AppData\Local\Temp\opencode\mining-data\` and are not committed.

Live coverage against the 33 built-in catalog slugs (all 33 have a curated entry):

| Field group | Covered | Source |
| --- | --- | --- |
| Release date | **33 / 33** | WhatToMine `/api/v1/asics` (matched by maker + model + hashrate; Canaan "Avalon 1566/1466" and "DG home 1" spelling variants resolved manually) |
| Hardware / environment | **20 / 33** | D-Central dedicated datasets (`asic-dimensions`, `asic-thermal-limits`, `asic-power-requirements`, `fan-spec-reference`, `cooling-fitment`), only exact family/model matches |
| Power / connectivity | **7 / 33** | D-Central power dataset; official Bitmain datasheets for the hydro flagships |
| Curated market price range | **16 / 33** | Backpow `hardwareIndex.json`, **only rows with `estimated: false`** and a matching hashrate bin |

The wider imported catalog (591 BackPoW miners) is not hand-curated: 523 of 624 miners carry a BackPoW price range, of which 97 are `estimated: false` and therefore visible.

Manufacturer-datasheet overrides (confidence A) now in use:

- **S21 XP** — Bitmain support page: 449 × 219 × 293 mm, 18.7 kg net / 21.5 kg gross, 76 dB,
  220–277 V AC, 20 A, RJ45 10/100M, -20–45 °C, 10–90% RH, 6,400 RPM, 480 CFM.
- **S21 XP Hyd** — Bitmain support page: 339 × 173 × 207 mm, 13.8 kg / 15.7 kg, 380–415 V
  three-phase, 20–50 °C inlet water, 8–10 L/min, ≤3.5 bar.
- **S21 XP+ Hyd** — Bitmain product manual: 380–415 V three-phase, 20–50 °C inlet water,
  8–10 L/min, ≤3.5 bar. Dimensions/weight were **omitted** because the Jan 2025 manual
  (339 × 173 × 207 mm, 14.8 kg) conflicts with the Nov 2025 revision (430 × 176 × 208 mm, 16.2 kg).
- **X9** (imported into Convex from BackPoW, not in the built-in catalog) — Bitmain product manual:
  361 × 219 × 293 mm, 17.5 kg net / 20.2 kg gross, 76 dBA, 220–277 V AC, 50/60 Hz, 20 A,
  RJ45 10/100M, -20–45 °C, -40–70 °C storage, 10–90% RH, ≤2,000 m, 480 CFM, 4 fans.

Conflicts resolved by dropping the losing value:

- S21 XP D-Central dimensions (400 × 195 × 290 mm, 15.4 kg) contradict Bitmain's datasheet;
  the manufacturer value is displayed, the D-Central value is not.
- M60S D-Central timeline bin (186 TH / 3,441 W) agrees with our catalog, while the WhatToMine
  row is a different 170 TH bin; only the release date was taken from WhatToMine.
- Z15 Pro catalog power (2,780 W) agrees with Backpow and D-Central; the WhatToMine 2,560 W
  row was not used for display.

UI rules enforced: no `0` placeholders, no inferred values, `estimated: true` Backpow rows excluded,
sample-count and condition shown with every market range, CC BY 4.0 attribution and links on the page.

---

## 5. Conflict and confidence rules

- **Hard conflict** on hashrate/power (>5%): prefer the manufacturer; if none, show the range and flag
  it. Never average two sources silently.
- **Noise**: only display an explicitly published value. A hydro miner is not "50 dB" because another
  hydro model is.
- **Prices**: Backpow rows with `estimated: true` are labelled as estimates. D-Central CAD prices are
  converted with Frankfurter and labelled. Live seller offers come only from that seller's feed.
- **Unknowns**: `null`, hidden in UI, never `0`.
- **Confidence D** (single unverified social/forum claim) is excluded from rankings and spec tables.

---

## 6. Licensing and attribution (must ship)

| Source | Required attribution |
| --- | --- |
| D-Central | `Data: D-Central Technologies (d-central.tech), CC BY 4.0.` + link to the dataset page + indicate changes. Suggested full citation: `D-Central Technologies. "ASIC Miner Spec Database." d-central.tech, updated 22 November 2026. Licensed under CC BY 4.0. Accessed 25 November 2026. https://d-central.tech/asic-miner-database/` |
| Backpow | `Data: BackPoW — The Proof of Work Oracle (backpow.com), CC BY 4.0. Retrieved 25 November 2026.` |
| WhatToMine | `Network data: WhatToMine (whattomine.com).` + link. **Review ToS first** (see risk below). |
| CoinGecko | `Market data: CoinGecko.` + link, per plan |
| Hashrate Index | Per Luxor key terms (confirm before publishing) |
| Minerstat | Not usable for bulk/public display without Enterprise + written terms |

**WhatToMine risk (important):** their ToS forbids using the APIs for an application that "replicates
or attempts to replace the essential user experience" of WhatToMine. A public directory with live
profitability, coin stats and rankings is close to that line. Before scaling WhatToMine usage, get
written permission for the directory use case or keep it to attributed network stats only and do not
republish raw datasets. This is a business/legal decision, not an engineering one.

**Ship:** a `/data-sources` page (sources, licences, refresh times) and footer links to it.

---

## 7. Keys and accounts to request next

1. **Hashrate Index / Luxor** — email `hashrateindex@luxor.tech` or subscribe to Premium Silver for an
   API key. Best source for dimensions, weight, voltage, release dates and ASIC price history.
2. **Minerstat** — free key only for evaluation (100 req/month, 20 rows). Public/commercial use needs
   Enterprise; do not build on the free plan.
3. **CoinGecko Demo** — free key for market data.
4. **eBay Developer (Browse API)** — free developer account; used-market prices as an independent check.
5. **WhatToMine** — token already working (1,000 req/month). Ask for written permission on directory
   use, given the ToS clause above.
6. **Manufacturer spec pages / press kits** — Bitmain, MicroBT, Canaan, Bitdeer, Auradine, IceRiver,
   ElphaPex, Goldshell, Bitaxe. No key; this is the source of truth for `confidence A`.
7. **D-Central / Backpow** — no key; attribution only.

---

## 8. Secret handling

- `WHATTOMINE_API_KEY` lives in `.env.local` (ignored by `.env*.local`) and in the deployment's
  server-side environment. It is **never** prefixed `NEXT_PUBLIC_` and never sent to the browser.
- Do not paste keys into issues, commits, screenshots or generated files. Rotate immediately if a key
  leaks.
- Do not commit raw third-party dumps when the licence forbids redistribution; commit only normalised
  facts with provenance.

---

## 9. Acceptance checklist ("perfect data" gate)

- [ ] every displayed spec has `sources[]`, `fetchedAt`, `confidence`
- [ ] no unknown rendered as `0`
- [ ] match report reviewed; ambiguous matches quarantined
- [ ] cross-source diff report attached to the import
- [ ] `/data-sources` page live with licences and refresh dates
- [ ] D-Central and Backpow attribution in the footer and on data pages
- [ ] WhatToMine permission confirmed (or usage reduced to attributed network stats)
- [ ] parser/validator/matcher tests pass
- [ ] top 20 miners spot-checked against manufacturer datasheets
- [ ] rankings use only `confidence A/B` specs

---

## 10. Immediate next actions

1. Convert the curated `lib/miner-specs.ts` into the generated pipeline: `scripts/import-specs.mjs`
   + committed `lib/specs.generated.ts` + `data/import-report.md`, so the reviewed match can be
   refreshed deterministically instead of hand-curated.
2. Add the attribution footer + `/data-sources` page (the on-page attribution already ships; the
   dedicated page does not yet).
3. Obtain the Hashrate Index key to fill the remaining dimensions/weight/voltage/release-date
   gaps (13 of the 33 built-in miners have no hardware group; 591 imported miners have no
   curated hardware data at all).
4. Ask WhatToMine for written permission for directory use, given the ToS clause above.
5. Re-weight the ranking to 35/25/20/10/5/5 once noise/cooling coverage is verified; until then keep
   the published four-factor formula rather than inventing "build quality".
