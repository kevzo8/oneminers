# Data classification and admin access — honest inventory

**Prepared:** 26 November 2026
**Companion to:** `docs/stakeholder-report.md`, `docs/data-samples.md`

This document answers two questions plainly: **which numbers on the site are real-time, which are genuine but hand-captured, and which are generated placeholders** — and **what admin tooling exists for people who sign up**.

---

## 1. Classification summary

| Class | Meaning | Appears on |
| --- | --- | --- |
| **LIVE** | Fetched from an external API on a schedule or per request | Coin network state, coin prices, FX, live network stats |
| **REAL — STATIC/CURATED** | Genuine source data, captured once and embedded or manually seeded; not auto-refreshed | Miner specs, release dates, hosting rates, the 33 curated miners, OneMiners profile |
| **GENERATED / SAMPLE** | Synthetic placeholder, deterministic fake data, or a hardcoded fallback | Six sample vendors, generated offers/prices/ratings, network/market fallbacks |
| **COMPUTED** | Derived from the above by a stated formula; assumptions are hardcoded constants | Profitability, ROI, energy/heat, homepage headline stats |

---

## 2. LIVE data

| Data | Source and cadence | Code |
| --- | --- | --- |
| Coin network state (hashrate, block time/reward, volume, market cap, confidence, 30-day history) | BackPoW `coins-data/{coin}.json`, hourly at :05 UTC with 3 retries; failed coins keep previous values | `convex/crons.ts:7`, `convex/backpow.ts:90-149`, `convex/directory.ts:92-99` |
| Miner catalog rows and market price ranges | BackPoW `hardwareIndex.json`, daily at 03:15 UTC; curated rows keep their stable slug/specs and gain `coins` + `priceRange` | `convex/crons.ts:11`, `convex/backpow.ts:178-214,245-307` |
| Coin prices | BackPoW stored price, overlaid by CoinGecko `simple/price` for 12 IDs, cached 10 minutes; falls back to stored price | `lib/market.ts:10-24,35-53,72` |
| Market cap / 24h / 7d sparklines | CoinGecko `/coins/markets`, 10-minute cache | `lib/coinMarkets.ts:25-60` |
| Ticker prices | CoinGecko with 5-minute cache, BackPoW fallback | `components/Ticker.tsx:19-45` |
| FX rates | Derived from CoinGecko BTC price in 10 currencies, 10-minute cache; USD-only fallback | `app/api/fx/route.ts:4-27`, `lib/currency.ts:1` |
| Live network panel | mempool.space + CoinGecko + Alternative.me, 5-minute cache, polled every 60 s | `app/api/network/route.ts:3-5,35-55`, `components/LiveNetwork.tsx:73-90` |
| Our own network history | Hourly `marketSnapshots` copied from the live coin table at :20 UTC | `convex/crons.ts:8`, `convex/market.ts:7-27` |
| Seller-created vendors and offers | Seller portal writes, no scheduled refresh | `convex/seller.ts:79-142,154-199` |
| Leads / contact / newsletter submissions and chat messages | Real user submissions stored on write | `convex/leads.ts:24-58`, `convex/chat.ts:17-55` |

**Note on "live":** `getMarket()` reports `source: "live"` when the Convex query succeeds even if CoinGecko fails; in that case prices are the hourly BackPoW values, not CoinGecko's.

---

## 3. REAL — STATIC / CURATED data

These are genuine facts from real sources, but they are **not refreshed automatically**. They were captured and reviewed by a human.

| Data | Source | Code |
| --- | --- | --- |
| Physical, electrical and environmental specs (37 models: dimensions, weight, noise, voltage, fans, temperatures, humidity, airflow) | Manufacturer datasheets, D-Central CC BY 4.0 reference files, Bitmain support pages and product manuals | `lib/miner-specs.ts:1-8,61-415` |
| Full release dates (37 models) | WhatToMine ASIC API, one-off offline fetch; not called at runtime | `lib/miner-specs.ts:18-20`, `docs/data-samples.md §2.5` |
| Release years used in the data page and catalog | Manually maintained | `lib/catalog.ts:20-21,55-94` |
| Hosting sites and rates (7 sites, 3.6¢–5.8¢/kWh) | OneMiners oneminers.com hosting map captured 25 Nov 2026 | `lib/hosting.ts:1-35` |
| OneMiners vendor profile (the only real vendor in the built-in catalog) | oneminers.com facts; rating/reviews/reply are 0, not measured | `lib/catalog.ts:121-142` |
| The 33 curated miners' core specs (hashrate, power, cooling, category) | Manually maintained seed catalog | `lib/catalog.ts:53-94` |
| Ranking weights and primary-coin priority | Published product decisions, not measured data | `lib/ranking.ts:7-12`, `lib/economics.ts:142-154` |
| 30-day backfill in network history | BackPoW's real daily price/hashrate, but applies **current** block reward and block time to every day — a documented approximation | `convex/market.ts:29-64` |

The curated spec panel is real data, but it is a **snapshot**. It should be re-verified against manufacturer pages periodically; it is not a live feed.

---

## 4. GENERATED / SAMPLE data — must never appear in production

| Data | What it actually is | Code |
| --- | --- | --- |
| Six sample vendors (Harborline, Nordvolt, Cascade, Brightcore, Meridian, Atlas) | Invented names, `website: "#"`, fabricated ratings 4.1–4.7, review counts, reply times and warranties. **Not measurements.** | `lib/catalog.ts:143-257` |
| Built-in offers | Deterministic synthetic data: hash of `minerSlug:vendorSlug` decides which vendor "carries" a miner; price = `refPrice × 0.9–1.15`; fixed condition/stock/warranty and a `SEED_TIME` of 25 Nov 2026 | `lib/catalog.ts:279-323` |
| Seeded Convex samples | Inserted only by `admin:seedSamples`, gated on `SAMPLE_DATA === "allowed"` | `convex/admin.ts:158-195` |
| Seller default reply time | Hardcoded `replyMinutes: 60` for new seller vendors | `convex/seller.ts:105-116` |
| OneMiners defaults | Rating, reviews and reply time are 0 because they have not been measured | `lib/catalog.ts:128-141` |

**Production behaviour:**

- `builtInDirectory()` returns **zero offers** when `NODE_ENV === "development"` is false (`lib/directory.ts:17-27`).
- `isPublicVendor` hides sample vendors unless the Convex deployment has `SAMPLE_DATA=allowed`, and also hides QA/test vendors, rejected vendors and unapproved team vendors (`convex/directory.ts:5-21`).
- Therefore the six sample vendors and their 121 generated offers will be invisible in production **provided the production deployment does not set `SAMPLE_DATA=allowed`**.
- Before launch, run `admin:purgeSampleData` / the "Remove sample vendors" action on the production deployment; these delete sample vendors and team-added offers without touching seller-owned data (`convex/admin.ts:71-85,197-221`).
- "With seller prices" reads **33 in development** and **27 in production**, because the 33 include sample-vendor offers (`docs/data-samples.md §1`).

---

## 5. Hardcoded FALLBACK values (not fabricated history, but static)

| Fallback | Value | Code |
| --- | --- | --- |
| Network panel | Hashrate 630 EH/s, height 973,537, BTC $81,400 and other fixed stats | `app/api/network/route.ts:7-20,57-81` |
| Market snapshot | Fixed 11-coin capture dated 25 Nov 2026, BTC $58,919.73; used only when Convex is unreachable and labelled `source: "snapshot"` | `lib/market-core.ts:31-46,64-71`, `lib/market.ts:92-93` |
| FX | `{ USD: 1 }` on failure | `app/api/fx/route.ts:25-27`, `lib/useMoney.ts:10-13` |
| Catalog fallback | The 33 built-in miners when Convex is unavailable | `lib/directory.ts:22-27` |
| History helpers | Return an empty array, not a synthetic chart | `lib/directory.ts:63-105` |
| Offline chat | Keyword rules reading live rows; no invented prices | `lib/chat.ts:122-174`, `components/ChatWidget.tsx:12-16` |

`WHATTOMINE_API_KEY` is present in `.env.local` but **unused by the code**; there is no WhatToMine fetch at runtime (`docs/data-samples.md §2.5`, `.env.example:16-18`).

---

## 6. COMPUTED figures

Profitability, break-even, ROI, energy/day, heat output, "most profitable today" and the four homepage numbers are **calculated**, not collected. Inputs are live or curated; assumptions are hardcoded:

- `$0.07/kWh`, 1% pool fee, electricity presets 3.6¢ / 4.5¢ / 7¢ / 22¢ — `lib/economics.ts:98-105`
- Revenue = `share × blocks/day × reward × price`; profit = revenue − pool fee − electricity — `lib/economics.ts:127-135,214-237`
- Heat = `powerW × 3.412142` BTU/h — `components/directory/MinerSpecs.tsx:24`
- Homepage stats — `components/Hero.tsx:14-30`

These are model outputs, not observed earnings. The UI states the assumptions.

---

## 7. Admin dashboard and signups — what actually exists

### 7.1 Admin UI

`/admin` exists (`app/admin/page.tsx:11-22`) and renders `AdminPanel`. It can:

- show counts of vendors, pending vendors, miners and the last snapshot time;
- approve/reject sellers and edit vendor status, tier and verified flag;
- add/edit miners;
- remove sample vendors.

Admin **mutations are enforced server-side** by `requireAdmin` in Convex (`convex/users.ts:33-37`, `convex/admin.ts:11,36,61,74`). The UI also hides itself for non-admins (`components/portal/AdminPanel.tsx:21-26`), but there is **no middleware/server page guard** on `/admin` or `/vendor-portal`. Authentication is username/password via Convex Auth; no MFA or admin invite flow was found (`convex/auth.ts:9-12`, `components/portal/ConvexAuthClient.tsx:8-30`).

### 7.2 Signups / leads

All three public forms — contact, report and newsletter — POST to `/api/leads`, which writes a row to the Convex `leads` table and optionally forwards it to `LEADS_WEBHOOK_URL`:

- `components/LeadForm.tsx:19-23`
- `components/directory/ReportForm.tsx:19-27`
- `components/NewsletterForm.tsx:15-19`
- `app/api/leads/route.ts:15-65`
- `convex/schema.ts:132-142`, `convex/leads.ts:24-58`

In `.env.local`, `LEADS_WEBHOOK_URL` is **empty**, so locally nothing is forwarded; leads are logged to the server console and stored in Convex.

### 7.3 What is NOT built

- **No UI to view, search, manage or export leads or newsletter signups.** `leads.list` and `leads.remove` are internal Convex functions, reachable only from CLI or server-side code (`convex/leads.ts:6-22`), and `AdminPanel` does not call them (`components/portal/AdminPanel.tsx:37-58`).
- **No CSV/email export, no bulk-send, no email provider installed.** `@convex-dev/resend` appears only in `package-lock.json`, not in `package.json` or any source import.
- **No dedicated newsletter/subscriber/waitlist table**, no double opt-in, and no unsubscribe implementation — despite the form text "Unsubscribe any time from any email" (`components/NewsletterForm.tsx:32`).
- Chat transcripts are stored but only accessible through internal queries (`convex/chat.ts:57-78`).
- The `/sell` marketing claims "Quote requests and buyer leads sent straight to you" and "Seller portal: views, clicks and leads every month" are **not implemented** (`app/sell/page.tsx:22-23`).

**What exists instead:** leads can be read with `npx convex run leads:list` (documented in `README.md:190-195`), forwarded through a webhook, or deleted by ID through the internal mutation. Seller account signups do appear in `/admin` as pending vendors for approval, because those go through the seller portal, not the leads form.

### 7.4 To actually email signups

You currently cannot do this from the app. The practical options are:

1. Set `LEADS_WEBHOOK_URL` to a CRM or automation tool and manage consent/emailing there.
2. Build an admin leads page that calls a new public `leads.list` query protected by `requireAdmin`, with CSV export.
3. Add an email provider and explicit consent/double opt-in before sending marketing email.

---

## 8. Production checklist specific to this document

- [ ] Confirm no `SAMPLE_DATA=allowed` on the production Convex deployment.
- [ ] Run `admin:purgeSampleData` on production; verify 0 sample vendors and 0 generated offers.
- [ ] Re-verify the 37 curated spec entries and 7 hosting rates before publishing them as current.
- [ ] Decide what the "with seller prices" number should mean in production (27 today).
- [ ] Decide how signups will be viewed and emailed (webhook, admin export, or CRM) and implement consent/unsubscribe.
- [ ] Remove or qualify the unimplemented lead claims on `/sell`.
