# Convex backend

Database, auth, scheduled jobs and seller flows for NowMining. The frontend reads through `lib/directory.ts`, which uses Convex when `NEXT_PUBLIC_CONVEX_URL` is set and falls back to the bundled catalog otherwise.

## Tables (`schema.ts`)

| Table | Purpose |
|---|---|
| `users` | Seller/admin roles; credentials and sessions are in the Convex Auth components |
| `miners` | ASIC catalog (slug, specs, release year, reference price) |
| `vendors` | Seller companies, plans, verification and partner-link state |
| `offers` | One vendor price per miner (price, shipping, condition, availability) |
| `marketSnapshots` | Hourly network snapshots used for profit-history charts |
| `leads` | Contact, report and newsletter submissions |
| `chatMessages` | Assistant conversation history per browser session |

## Functions

| Module | Highlights |
|---|---|
| `directory.ts` | Public `snapshot` (miners, public vendors, offers) and `marketHistory` |
| `backpow.ts` | Imports coin network data (hourly) and the full ASIC catalog with specs and market price ranges (daily) from BackPoW |
| `market.ts` | `takeSnapshot` (hourly, from the `coins` table), `backfillFromHistory`, `clearLegacySnapshots` |
| `leads.ts` | Validated lead creation; listing is internal |
| `chat.ts` | Assistant message persistence |
| `seller.ts` | Seller onboarding, company and offer management, listing plan |
| `partnerLink.ts` | Server-side check (and weekly re-check) of the required backlink |
| `admin.ts` | Seeding, sample-data guard, purge and admin grants |

## Scheduled jobs (`crons.ts`)

- Hourly `market.takeSnapshot` — builds our own price, hashrate, reward and block-time history.
- Weekly `partnerLink.recheckAll` — verifies sellers still link to `oneminers.com`.

## Commands

```powershell
npx convex dev                              # sync to the dev deployment
npx convex deploy                           # deploy functions to prod
npx convex run admin:seed                   # real miner catalog (dev)
npx convex run admin:seedSamples            # sample vendors/prices (dev only, SAMPLE_DATA=allowed)
npx convex run admin:purgeSampleData --prod # remove sample data from prod
npx convex run admin:grantAdmin '{"userId":"<account id>"}' --prod
```

See the root `README.md` for the full dev/prod environment table.
