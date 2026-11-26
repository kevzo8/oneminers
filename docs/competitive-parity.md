# Competitive parity: ASIC miner directories

Benchmark of the public pages of MiningNow, ASICMinerValue, WhatToMine and Hashrate.no against NowMining. Reviewed 26 November 2026. This is a presentation and feature comparison, not a scrape or a copy of their code, data or assets.

## Feature matrix

| Feature | MiningNow | ASICMinerValue | WhatToMine | Hashrate.no | NowMining |
| --- | --- | --- | --- | --- | --- |
| ASIC miner table | Yes | Yes | Partial (ASIC tab) | Yes | Yes |
| Live profit / day | Yes | Yes | Yes | Yes | Yes |
| Sortable columns | Partial | Yes | Yes | Partial | Yes |
| Coin filter with logos | Yes | Yes | Partial | Yes | Yes |
| Algorithm / maker / cooling / type filters | Partial | Yes | Yes | Yes | Yes |
| Manufacturer logos | Yes | Yes | Partial | Partial | Yes (33 curated brands, monogram fallback) |
| Product photos | Yes | Yes | No | Partial | No |
| Coin logos | Yes | Yes | Yes | Yes | Yes |
| Best seller price | Yes | Yes | Partial (exchange) | No | Yes |
| Price per hash unit | Partial | Yes | Partial | No | Yes |
| ROI / payback | Yes | Yes | Yes | Partial | Yes |
| Watchlist | Yes | Yes (My Rig) | Partial | No | Yes |
| Compare | Yes | No | No | No | Yes |
| Miner detail specs | Yes | Yes | Partial | Yes | Yes |
| Vendor / offer directory | Yes | Yes | Partial | Yes | Yes |
| Coin pages | Yes | Yes | Yes | Yes | Yes |
| Rankings | Yes | Yes | Partial | Yes | Yes |
| Hosting | Partial | No | No | Yes | Yes |
| Calculators | Yes | Yes | Yes | Yes | Yes |
| Network history | Partial | Partial | Yes | Partial | Yes |
| News | Yes | No | No | Yes | No (out of scope) |
| Pools | Partial | Partial | No | Yes | No (out of scope) |
| Mining software / firmware | Partial | Partial | No | Yes | No (out of scope) |
| GPU / CPU / FPGA | No | No | Yes | Yes | No (ASIC-only) |
| Public API | No | No | Yes | No | No |
| Accounts / auth | No | Yes | Yes | Partial | Seller portal only |

"Partial" means the feature exists but is limited, not necessarily missing. The matrix is a directional benchmark, not an audit of every page.

## What changed for parity

- **List first.** The homepage now opens with a slim intro, then the miner directory, then the market snapshot. The old hero stats and "Most profitable today" card moved below the table.
- **Compact hero.** Headline, one-line description and a jump link only. No data fetch, no stat tiles, no leader card.
- **Coin logos.** Real project icons for 41 of 53 coin tags, used in the table, coin filter, ticker, coin pages, miner pages, compare and rankings. Unknown tags get a deterministic monogram so nothing breaks.
- **Manufacturer logos.** Curated brand favicons for 33 manufacturers, covering the large majority of miners, with brand-coloured monograms as fallback for the rest. Guessed-domain logos that pointed at unrelated sites were removed.
- **Coin stack.** Multi-coin miners show overlapping coin icons in the top-coin column instead of a single text chip.
- **Price per hash unit.** Best-price cells now show both the total and a `$ / TH` or `$ / kSol` subline.
- **Icon-led ticker.** The market ticker now shows a coin icon per row.

## Icon and image sources

| Asset | Source | Licence / note |
| --- | --- | --- |
| 19 coin SVGs | `cryptocurrency-icons@0.18.1` | CC0-1.0 |
| 22 coin PNG/JPEG logos | CoinGecko project image URLs | Project logos used for identification. Confirm each project's brand guidelines before commercial use. |
| Manufacturer icons | 33 curated brand favicons via Google's favicon service or each site's own icon | Trademarks remain with each owner; used for identification only. Missing brands use `lib/makerMarks.ts` monograms. |
| Product photos | None | Requires licensed manufacturer or seller photography. |

Coin icon coverage: 41 of 53 unique tags. Fallback monograms: AUR, BTCII, KRG, MEWC, MOON, MWC, NEXA, SCP, Soqucoin, TARI, TrumPOW, UNO.

## Remaining gaps

1. **Product photos.** The biggest remaining visual gap versus MiningNow and ASICMinerValue. Brand icons are now present for 33 curated manufacturers; product photography still needs licensed assets.
2. **News, pools and mining software.** Common on Hashrate.no and MiningNow. These need maintained data and sources. A future version could use official pool/software links with no invented fees or specs.
3. **GPU / CPU / FPGA coverage.** WhatToMine and Hashrate.no cover these; NowMining is intentionally ASIC-only.
4. **Public API and accounts.** WhatToMine offers both; NowMining has a seller portal but no public miner API or buyer accounts.
5. **Long-tail logos.** 27 of 60 manufacturers still use generated monograms because no trustworthy favicon was available; many are defunct or have no favicon.

## Guardrails

- No reverse engineering or scraping of competitor sites. Public pages were used only as a presentation benchmark.
- No invented specs, prices, fees or product images. Unknown values stay blank.
- Sample vendors and offers remain development-only and are hidden from production snapshots.
- Brand favicons come from a curated list of manufacturer domains, not competitor sites; trademarks belong to their owners.

### Manufacturer icon domains

Bitmain `bitmain.com` · Goldshell `goldshell.com` · MicroBT `whatsminer.com` · Canaan `canaan.io` · Innosilicon `innosilicon.com` · IceRiver `iceriver.io` · iPollo `ipollo.com` · iBeLink `ibelink.io` (EU distributor; the official `en.ibelink.com.hk` had no favicon) · Jasminer `jasminer.com` · ElphaPex `elphapex.com` · Bitdeer `bitdeer.com` · Ebang `ebang.com` · Bitaxe `bitaxe.org` · Braiins `braiins.com` · Auradine `auradine.com` · FutureBit `futurebit.io` · Heatbit `heatbit.com` · Lucky `luckyminerclub.com` · Magicminer `magicminer.cc` · VolcMiner `volcminer.com` · NerdMiner `nerdminer.io` · GekkoScience `gekkoscience.com` · DragonBall `dragonballminer.com` · ForestMiner `forestminer.io` · DOGEXUS `dogexus.com` · ZeusMiner `zeusminer.com` · Fluminer `fluminer.com` · Jingle `jinglemining.com` · Cheetah `cheetahminer.com` · BlackMiner `blackminer.com` · BittWare `bittware.com` · GAW `gawminers.com` · 21energy `21energy.com`
- Manufacturer monograms are labelled as generated artwork, not official brand assets.
