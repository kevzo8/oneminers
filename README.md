# NowMining — ASIC miner profitability, prices and hosting

A live directory of ASIC miners: profitability recalculated from the network every 10 minutes, prices and offers from sellers, hosting rates, and open rankings. Built with Next.js and Convex.

Live data only. Nothing here is investment advice.

## What is inside

- **Profitability-first home page:** searchable/filterable ASIC table with electricity and pool-fee controls, coin filter and a browser watchlist
- **Rankings (`/rankings`):** score every miner within its algorithm using a published formula (profit, efficiency, hashrate, availability)
- **Compare (`/compare`):** up to four miners side by side; the selection is kept in the URL so a shared link reproduces it
- **Coins (`/coins`):** live network stats, CoinGecko market cap / 24h change / 7-day sparklines, per-coin converter, and the miners that mine each coin
- **Miner pages:** live revenue per coin, profit history, best-price offers from sellers, specs, payback and report-an-error link
- **Vendors and sellers:** vendor profiles, listing plans, Convex Auth seller portal (`/vendor-portal`) and partner-link verification
- **Hosting:** comparison of published hosting sites by rate and capacity (`/#hosting`)
- **Data (`/data`):** our own hourly Bitcoin network snapshots (price, hashrate, hashprice) and the ASIC release/efficiency history
- **Glossary (`/glossary`):** plain-English mining terms with `DefinedTermSet` structured data
- **Widgets (`/widgets`):** build an embeddable profitability widget (`/embed/miner/[slug]`), which is allowed in iframes while every other page refuses framing
- **Report (`/report`) and newsletter:** both feed the same validated lead endpoint
- **AI assistant:** floating chat widget grounded in the live directory, with a local fallback when no model key is set
- **Visitor settings:** currency selector (live FX) and electricity price, saved in the browser; every client-rendered table follows them
- SEO metadata, JSON-LD, sitemap, robots and security headers

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- lucide-react icons
- Convex (database, auth, crons)

## Quick start

```powershell
npm install
npm run dev
```

Open http://localhost:3000.

The site runs without Convex: directory pages fall back to the catalog in `lib/catalog.ts`. For leads, chats, seller accounts and history, start the backend too:

```powershell
npx convex dev   # terminal 1
npm run dev      # terminal 2
```

Production:

```powershell
npm run build
npm start
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run codegen` | regenerate `convex/_generated` |
| `npm run convex:dev` / `convex:deploy` | sync Convex functions to dev / prod |

## Routes

| Route | Purpose |
|---|---|
| `/` | Profitability table, network stats, hosting, calculator, assistant |
| `/miners`, `/miners/[slug]` | Full miner directory and miner detail |
| `/rankings` | Published-formula rankings by algorithm and brand |
| `/compare` | Side-by-side miner comparison (`?m=slug,slug`) |
| `/coins`, `/coins/[tag]` | Coin market/network data and mineable miners |
| `/vendors`, `/vendors/[slug]` | Seller directory and vendor profiles |
| `/sell`, `/vendor-portal` | Listing pitch and seller portal (Convex Auth) |
| `/data` | Hourly network history and ASIC release history |
| `/glossary` | Mining glossary |
| `/widgets`, `/embed/miner/[slug]` | Widget builder and embeddable card |
| `/report` | Report wrong data or suggest a feature |
| `/tools/hashrate-converter` | Hashrate unit converter |
| `/api/network`, `/api/fx`, `/api/leads`, `/api/chat` | Data and form endpoints |

## Data sources

| Data | Source | Used by |
|---|---|---|
| Bitcoin network (difficulty, hashrate, height, fees, price, mempool) | mempool.space + CoinGecko | `/api/network`, LiveNetwork |
| Coin prices, network hashrate, block reward/time | WhatToMine (cached snapshot fallback) | `lib/market.ts`, profitability |
| Market cap, 24h/7d change, 7-day sparkline | CoinGecko `/coins/markets` | `/coins`, coin pages |
| Fiat exchange rates | CoinGecko `/simple/price` via `/api/fx` | Currency selector, converter |
| Hourly network snapshots | Our own Convex `marketSnapshots` (cron) | `/data`, profit history |
| Hosting rates and capacity | Published by the hosting partner | `lib/hosting.ts` |

All network fetches are cached (`revalidate = 600` unless noted) and fall back to bundled data when an API is unavailable.

## Visitor settings

Saved in `localStorage` and shared across pages:

- `om.mining-settings.v1` — electricity price, pool fee, display currency
- `om.watchlist.v1` — starred miner slugs

Amounts are calculated in USD and converted for display with rates from `/api/fx`.

## Site assistant

Works immediately with no API key: `lib/chat.ts` answers from the live directory and calculator logic.

To use a real model, copy `.env.example` to `.env.local` and set:

```dotenv
OPENAI_API_KEY=your_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Any OpenAI-compatible endpoint works (OpenAI, OpenRouter, Groq, local vLLM, LM Studio). The route is `app/api/chat/route.ts`; it falls back to the local knowledge base on any model error.

## Leads, reports and newsletter

`POST /api/leads` validates name and email, optionally forwards to `LEADS_WEBHOOK_URL`, and writes to Convex when `NEXT_PUBLIC_CONVEX_URL` is set. The contact form, report form and newsletter signup all use it.

## Project structure

```text
app/
  api/{chat,fx,leads,network,revalidate}/   route handlers
  coins/, miners/, vendors/                 directory pages (list + [slug]/[tag])
  rankings/, compare/, data/, glossary/     analysis and reference pages
  widgets/, embed/miner/[slug]/             widget builder and iframe-safe embed
  report/, sell/, vendor-portal/, admin/    contribution and seller flows
  sitemap.ts, robots.ts                     SEO
components/
  Hero, Ticker, LiveNetwork, HostingSection, AiDesk, ProfitCalculator, LeadForm
  SiteHeader, SiteFooter, NewsletterForm, ChatWidget
  directory/
    MinerExplorer        searchable miner table + watchlist
    MinerCompare         side-by-side compare (URL-synced)
    OffersTable          seller offers and best price
    ProfitPanel/History  live profit and hourly history charts
    HostingCompare       hosting vs your own power
    HeaderSettings/SettingsBar  currency, electricity and pool fee
    CoinConverter, Sparkline, NetworkHistory, Glossary, WidgetBuilder, EmbedCard, ReportForm
lib/
  catalog.ts             bundled miner/vendor/offer catalog + sample flag
  directory.ts           Convex-or-catalog loader, revenues, offers, history
  economics.ts           profit, ROI, break-even and formatting math
  market.ts              live coin/network snapshot
  coinMarkets.ts         CoinGecko market data
  ranking.ts             published ranking formula
  chat.ts                assistant prompt and fallback answers
  hosting.ts, glossary.ts, currency.ts, brand.ts
  useMiningSettings.ts, useMoney.ts, useWatchlist.ts
convex/
  schema.ts              users, miners, vendors, offers, marketSnapshots, leads, chatMessages
  directory.ts, market.ts, crons.ts   public data + hourly snapshot job
  seller.ts, partnerLink.ts, admin.ts seller flows, link verification, seeding
```

## Convex backend

- **Schema** (`convex/schema.ts`): `users`, `miners`, `vendors`, `offers`, `marketSnapshots`, `leads`, `chatMessages`.
- **Hourly snapshot** (`convex/crons.ts` → `convex/market.ts`): records price, hashrate, reward and block time per coin so profit history is ours.
- **Auth** (`convex/auth.ts`, `convex/auth.config.ts`): seller and admin accounts via `@convex-dev/auth`.
- **Partner link checks** (`convex/partnerLink.ts`): weekly re-check of the required `oneminers.com` backlink.
- **Seed and sample rules** (`convex/admin.ts`): real catalog everywhere; sample vendors/prices only where `SAMPLE_DATA=allowed` (dev).

### Environments (dev vs prod)

| | Local (your laptop) | Production (Vercel) |
|---|---|---|
| Convex deployment | `dev:fantastic-viper-570` | `prod:qualified-puffin-550` |
| Configured by | `.env.local` (`CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`) | Vercel project env vars |
| Data | Real catalog + **sample** vendors/prices for testing | **Real data only** |
| Sample data | Allowed (`SAMPLE_DATA=allowed` set on the dev deployment) | Refused: `admin:seedSamples` throws |

Useful commands:

```powershell
npx convex run admin:seed                 # real catalog (dev)
npx convex run admin:seedSamples          # sample vendors + placeholder prices (dev only)
npx convex run admin:seed --prod          # real catalog (prod)
npx convex run admin:purgeSampleData --prod   # remove sample/placeholder data from prod
npx convex run admin:grantAdmin '{"userId":"<account id>"}' --prod
npx convex deploy                          # deploy functions to PROD
```

### Verify the backend

```powershell
npx convex run api.listings.list
npx convex run api.leads.create --args '{"name":"Test","email":"test@example.com","interest":"Hosting"}'
npx convex run leads:list   # internal: CLI and dashboard only
```

## Deploy

Vercel is the fastest path:

```powershell
npx vercel
```

Set the environment variables in the Vercel dashboard (see `.env.example`):

- `NEXT_PUBLIC_SITE_URL` — canonical origin used by sitemap, robots and embed links
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL
- `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL` — optional assistant model
- `LEADS_WEBHOOK_URL` — optional lead forwarding

The site also deploys cleanly to any Node host with `npm run build && npm start`.

## Data policy

Miner specs come from manufacturer announcements (±5% tolerance). Prices and offers come from sellers; listings marked **Sample** are placeholders until real sellers join. Production runs real data only. All listings, power rates, miner profits and market prices are informational, not investment advice.

## Footnotes & attribution

Live sources and design references are linked in the site footer.
