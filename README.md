# OneMiners — Powered land for proof-of-work

A polished demo marketplace for energized crypto-mining sites, hosting capacity, and miner economics. Built for the Oneminers CTO conversation in Cebu.

Inspired by the structure of cryptosites.io and miningnow.com, with the same design language as the finance-tracker app: dark glass surfaces, gradient accents, Inter typography, and responsive motion.

## What is inside

- Hero with live-style site card, network stats, and animated market ticker
- Marketplace with sale / lease / hosting filters and six demo listings
- ASIC profitability table with coin filters
- Interactive profit calculator with hardware presets
- AI deal desk section plus a floating site assistant
- Lead capture form and API routes
- SEO metadata, security headers, responsive layout, reduced-motion support

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- lucide-react icons

## Quick start

```powershell
npm install
npm run dev
```

Open http://localhost:3000.

Production:

```powershell
npm run build
npm start
```

## Site assistant

Works immediately with no API key: `lib/chat.ts` answers from the demo inventory and calculator logic.

To use a real model, copy `.env.example` to `.env.local` and set:

```dotenv
OPENAI_API_KEY=your_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Any OpenAI-compatible endpoint works (OpenAI, OpenRouter, Groq, local vLLM, LM Studio). The route is `app/api/chat/route.ts`; it falls back to the local knowledge base on any model error.

## Leads

`POST /api/leads` validates the name and email, logs the lead, and returns an id. Set `LEADS_WEBHOOK_URL` in `.env.local` to forward submissions to Slack, Make, Zapier, n8n, or a CRM.

The route also writes to Convex when `NEXT_PUBLIC_CONVEX_URL` is set (see Convex Backend below).

## Project structure

```text
app/
  api/chat/route.ts      AI chat endpoint with local fallback
  api/leads/route.ts     lead capture endpoint + optional webhook
  globals.css            design tokens, glass, gradients, motion
  layout.tsx             metadata, Inter font, viewport
  page.tsx               section composition
components/
  SiteHeader.tsx         sticky nav + mobile menu
  Hero.tsx               headline, stats, live-style site card
  Ticker.tsx             sample coin ticker
  Listings.tsx           marketplace filters + cards
  MinersTable.tsx        ASIC profitability + coin tabs
  HowItWorks.tsx         browse -> connect -> close
  AiDesk.tsx             AI positioning + chat preview
  ProfitCalculator.tsx   interactive net-profit model
  Insights.tsx           demo articles
  LeadForm.tsx           lead capture UI
  SiteFooter.tsx         footer + disclaimers
  ChatWidget.tsx         floating assistant
lib/
  data.ts                listings, miners, coins, insights, nav
  chat.ts                assistant system prompt + fallback answers
  format.ts              money / number formatting
```

## Customize

- **Inventory and copy:** `lib/data.ts`
- **Brand colors and surfaces:** `app/globals.css` (`@theme`)
- **Metadata and SEO:** `app/layout.tsx`
- **Assistant answers:** `lib/chat.ts` (fallback), or the env-backed model
- **Sections:** `components/` and `app/page.tsx`
- **Convex schema & functions:** `convex/` (schema, listings, leads, seed)

## Convex Backend

The repo includes a complete Convex backend (same pattern as finance-tracker):

- **Schema** (`convex/schema.ts`): tables `listings`, `leads`, `chatMessages` with indexes.
- **Queries/Mutations** (`convex/listings.ts`, `convex/leads.ts`): list listings, create/list leads with validation and rate-limiting.
- **Seed** (`convex/seed.ts`): inserts the 6 demo listings from `lib/data.ts`.
- **Generated types** (`convex/_generated/`): run `npx convex codegen` after any schema/function change.

### Local development (full stack)

```powershell
# Terminal 1: start the Convex dev backend (provisions a local deployment)
npx convex dev

# Terminal 2: start the Next.js dev server
npm run dev
```

The first `npx convex dev` run will prompt to create/select a project (uses team `kevzo8`, project `oneminers`) and writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local`. After that, the lead API route will automatically persist leads to Convex in addition to logging and optional webhook.

### Seed the database

```powershell
npx convex run api.seed.seedListings
```

### Verify the backend

```powershell
# List all listings
npx convex run api.listings.list

# Create a test lead
npx convex run api.leads.create --args '{"name":"Test","email":"test@example.com","interest":"Hosting"}'

# List leads
npx convex run api.leads.list
```

### Production deployment

1. Run `npx convex deploy` (creates a production deployment).
2. Copy the generated `NEXT_PUBLIC_CONVEX_URL` to your hosting provider (Vercel, etc.).
3. The site will then persist leads and can serve listings from Convex.

## Deploy

Vercel is the fastest path:

```powershell
npx vercel
```

Add the environment variables in the Vercel dashboard. The site also deploys cleanly to any Node host with `npm run build && npm start`.

## Demo disclaimer

All listings, power rates, miner profits, and market prices are illustrative demo data. Nothing here is investment advice, and no real inventory or customer data is included.
