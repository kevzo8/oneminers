# MinerPicks media kit and design guide

This is the single reference for the brand, palette, typography, component language, icons and voice used across MinerPicks. Everything described here is implemented in the repo; when in doubt, copy the existing token or component rather than inventing a new value.

## 1. Brand at a glance

| Item | Value |
| --- | --- |
| Product name | **MinerPicks** |
| Wordmark | `MINER` in ink + `PICKS` in accent lime (`lib/brand.ts`) |
| Tagline | ASIC miner profitability, prices and hosting |
| Description | Live profitability for every major ASIC miner, prices from sellers, and hosting rates. Compare miners, find the best price and see what each one earns. |
| Domain variable | `NEXT_PUBLIC_SITE_URL` (`lib/site.ts`) |
| Partner | OneMiners — `https://oneminers.com` |
| Persona | Fast, technical, honest, data-first. No hype, no price promises. |

The wordmark is rendered as text, not an image, in the header and footer (`components/SiteHeader.tsx`, `components/SiteFooter.tsx`). The symbol mark is used for favicons and social avatars.

## 2. Colour system

All theme colours are defined once in `app/globals.css` under `@theme` and `:root`. Tailwind utilities such as `text-accent`, `border-line` and `bg-white/[0.03]` come from these tokens.

### Core tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` / page background | `#05070a` | Base canvas |
| Gradient background | `#070a0e` → `#05070a` → `#040608` | Fixed body gradient behind content |
| `--color-ink` | `#f4f7f5` | Primary text and headings |
| `--color-muted` | `#93a1ad` | Secondary text, labels, captions |
| `--color-accent` | `#b9ff66` | Primary lime: CTAs, active states, positive numbers, focus rings |
| `--color-aqua` | `#4de1ff` | Secondary data highlight, partner/links |
| `--color-violet` | `#8b5cf6` | Tertiary glow, decorative depth |
| `--color-amber` | `#ffb340` | Caution, electricity icon, gold tier |
| `--line` | `rgba(255,255,255,0.09)` | Borders and hairlines |
| `--panel` | `rgba(16,22,30,0.62)` | Standard card background (`.surface`) |
| `--panel-strong` | `rgba(13,19,26,0.9)` | Emphasised card background (`.surface-strong`) |

### Signature colours in use

| Treatment | Value / gradient |
| --- | --- |
| Gradient text | `#d6ff9e 0% → #b9ff66 28% → #4de1ff 62% → #a78bfa 95%` (`.text-gradient`) |
| Primary button | `#d4ff96 → #b9ff66 55% → #9ce84f`, text `#08120a`, pill radius |
| Button glow | `0 10px 30px rgba(185,255,102,0.28)` |
| Input focus border | `rgba(185,255,102,0.55)` with `0 0 0 3px rgba(185,255,102,0.12)` |
| Text selection | `rgba(185,255,102,0.28)` |
| Ambient glows | lime `rgba(185,255,102,0.1)`, aqua `rgba(77,225,255,0.1)`, violet `rgba(139,92,246,0.12)` |
| Grid lines | `rgba(255,255,255,0.05)` on a 56px grid, radial mask |
| Positive / negative numbers | `text-accent` / `text-red-400` |
| Caution badges | amber border/background (`border-amber/30 bg-amber/10 text-amber`) |
| Vendor tiers | Gold = amber, Silver = white, Bronze = `orange-300`, Free = muted |
| Verified / Partner badges | Verified = accent lime, Partner = aqua |

### Coin and manufacturer colours

- Coin chips use a published brand colour where known (`COIN_COLORS` in `lib/economics.ts`), otherwise a deterministic fallback from `FALLBACK_COLORS` in `lib/coinIcons.ts`.
- Manufacturer marks use a curated brand-coloured monogram fallback (`lib/makerMarks.ts`) where no official icon is available.
- Do not recolour official coin or manufacturer logos to fit the palette.

### Themes

| Theme | Activation | Palette |
| --- | --- | --- |
| Dark (default) | `data-theme="dark"` or no attribute | Lime `#b9ff66` on `#05070a`; ink `#f4f7f5` |
| Light | `data-theme="light"`, persisted in `localStorage` as `om.theme` | Deep green `#2e7d32` on `#f6f8fa`; ink `#111827` |

The toggle lives in the header settings (desktop and mobile menu) and the footer. Tokens (`--color-ink`, `--color-muted`, `--color-accent`, `--color-line`, `--panel-soft`, `--surface-solid`, `--on-accent`) are switched by the `[data-theme="light"]` block in `app/globals.css`. Theme-aware utilities: `bg-bg`, `bg-panel-soft`, `bg-surface-solid`, `text-on-accent`. Use them instead of hard-coded dark backgrounds so both themes stay correct. In light mode `.text-gradient` becomes solid `--color-accent` (no transparent/clipped fill), so gradient text never disappears on a white background.

## 3. Typography

| Property | Value |
| --- | --- |
| Family | **Inter**, loaded with `next/font/google` (`app/layout.tsx`), exposed as `--font-inter` |
| Fallback stack | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| Body | `font-sans`, `antialiased`, `-webkit-font-smoothing: antialiased` |
| Weights in use | 400 body copy, 500–600 UI labels/buttons, 700 headings and emphasis, 800 display marks and numeric KPIs |
| Headline tracking | `-0.025em` for `h1/h2/h3/.font-display`; hero uses `-0.03em` |
| Numbers | `tabular-nums` on prices, hashrates, power, profit and stats |
| Micro labels | `text-xs` 12px uppercase, `tracking-[0.1em]`–`[0.14em]`, muted; body copy never below `text-sm` (14px) |
| Common scale | `text-xs` 12px · `text-sm` 14px · `text-base` 16px · `text-lg` 18px · `text-xl` 20px · `text-2xl` 24px · `text-3xl` 30px · `text-4xl` 36px · `text-5xl` 48px |

There is no separate display font. Keep all type in Inter; do not introduce a second family without updating the tokens and this guide.

**Accessibility baseline:** the audience includes people aged 50+, so table models are 18px, table numbers 16–20px, feature descriptions 14px, footer notes 14px, and coin/manufacturer icons 18–24px. Coin logos use `title`/`aria-label` tooltips instead of tiny ticker text where the name is redundant.

## 4. Layout and elevation

| Rule | Value |
| --- | --- |
| Content width | `max-w-7xl` (1280px) with `px-5 sm:px-8` |
| Header | Fixed, `h-16` (64px); page content starts at `pt-24` through `PageShell` |
| Page bottom spacing | `pb-20` |
| Card radius | `rounded-2xl` standard, `rounded-3xl` hero/prominent cards |
| Control radius | `rounded-full` buttons/pills/chips, `0.85rem` inputs and searchable dropdown buttons, `rounded-xl` dropdown popovers |
| Standard card | `.surface` — translucent panel, 1px line, soft shadow, blur 22px |
| Strong card | `.surface-strong` — denser panel, deeper shadow, blur 30px |
| Hover lift | `.card-lift` — translateY(-3px), accent border, larger shadow |
| Dividers | `border-line`, usually `border-line/60` inside tables |
| Scroll behaviour | Smooth, disabled automatically for `prefers-reduced-motion` |

## 5. Component library

These are the visual building blocks. Reuse them instead of restyling raw HTML.

| Class / component | Purpose |
| --- | --- |
| `.btn-primary` | Main action; lime gradient pill, dark text, glow |
| `.btn-ghost` | Secondary action; translucent pill with hairline border |
| `.chip` | Small uppercase status label (e.g. “Live snapshot”) |
| `.surface` / `.surface-strong` | Card containers |
| `.card-lift` | Hover elevation for clickable cards |
| `.input` | Text inputs and searchable dropdown buttons |
| `SearchSelect` / `MultiSelect` | Reusable searchable dropdowns; rounded popovers, checkboxes for multi-select |
| `Pill` | Filter toggle in the miner explorer |
| `Breadcrumbs` | Section navigation on sub-pages |
| `TierBadge` | Gold/Silver/Bronze vendor tier |
| `VerifiedBadge` | Verified / partner markers |
| `Flag` | Country code pill — deliberately not emoji flags |
| `MakerMark` | Official manufacturer favicon or generated monogram tile |
| `CoinIcon` / `CoinStack` | Coin logos and overlapping multi-coin stacks |
| `RiskDisclaimer` | Informational-only / high-risk footer note under data tables |
| `PartnerBadgeCard` | “Trusted partner of OneMiners” preview and copyable HTML |

## 6. Logo and symbol usage

### Symbol

Source: `public/icon.svg` and `public/apple-touch-icon.svg` (identical). Viewbox `0 0 64 64`.

- Rounded square background: `#070A0E`, `rx=14`
- Recoloured pickaxe artwork adapted from SVG Repo (`pick-miner-svgrepo-com.svg`): lime pick head `#B9FF66`, aqua tips/handle accents `#4DE1FF`, muted handle `#93A1AD`.
- Header uses the same paths with CSS variables so light mode switches to the darker palette.
- No hexagon frame; the pickaxe sits directly on the dark rounded tile.

Use the symbol for favicons, social avatars and app icons. Export PNG/WebP from the SVG at required sizes rather than redrawing it.

### Wordmark

Rendered as `MINER` + `PICKS` in Inter, bold, wide tracking (`tracking-[0.18em]`), with `PICKS` in `#b9ff66`. Keep the two parts together and on one line whenever possible.

**Do:** keep clear space around the mark, use the approved colours, scale proportionally.
**Don't:** stretch, rotate, add shadows, place on low-contrast backgrounds, recolour, or rebuild it with a different typeface.

## 7. Iconography and imagery

| Asset set | Location | Notes |
| --- | --- | --- |
| Coin logos | `public/coins/` (41 files) | 19 CC0 SVGs from `cryptocurrency-icons@0.18.1`; 22 project logos via CoinGecko. Unknown tickers get monogram fallbacks. |
| Manufacturer icons | `public/logos/manufacturers/` (33 files) | Favicons from curated official domains. Trademarks remain with owners; identification use only. |
| Generated marks | `lib/makerMarks.ts`, `components/directory/MakerMark.tsx` | Brand-coloured initials for brands without a trustworthy icon. |
| Abstract miner glyph | `components/directory/ui.tsx` | Used where no product photo exists; coloured by manufacturer, not a product image. |
| UI icons | `lucide-react` | Consistent 1.5–2px stroke; use `h-3.5`, `h-4`, `h-5` sizes. |
| Social image | `app/opengraph-image.tsx` | 1200×630 PNG generated at build: black canvas, MINERPICKS lockup, tagline. |
| Hosting globe land dots | `lib/worldDots.ts` | Natural Earth land outlines via `world-atlas` (public domain), sampled to a 4° dot grid. |
| Partner badge | `components/directory/PartnerBadgeCard.tsx` | Self-contained dofollow HTML snippet for sellers. |

There are **no product photos**. Any future imagery must be licensed and attributed; do not lift manufacturer or competitor photos.

## 8. Motion

| Class | Effect |
| --- | --- |
| `.anim-fade-up`, `-1/-2/-3` | 12px rise + fade, staggered 0/60/120/180ms |
| `.marquee-track` | 42s linear ticker, pauses on hover |
| `.anim-float` | 6s gentle vertical float |
| `.pulse-ring::after` | Expanding accent ring for live indicators |
| `.typing-dot` | Blinking dots for assistant typing |
| `.shine:hover::after` | One-shot diagonal sheen on hover |

All decorative animation is disabled under `prefers-reduced-motion: reduce`. Keep new motion subtle and respect that media query.

## 9. Voice and content rules

- Be concrete: numbers, sources and timestamps first.
- Never invent specs, prices, fees or product images; unknown values stay blank.
- Clearly separate live data, curated data, generated samples and computed values (`docs/data-classification.md`).
- Every earnings figure is an estimate with a visible risk disclaimer (`components/directory/RiskDisclaimer.tsx`).
- Say “sell miners”, not “invest”; never promise profit or ROI.
- Sample vendors and offers are development-only and hidden from production.
- Legal pages: `/terms`, `/privacy`, `/cookies`, `/vendor-terms`, `/ordering`, `/legal-notice`.

## 10. Where to change things

| Change | File |
| --- | --- |
| Brand name, tagline, description, partner | `lib/brand.ts` |
| Palette, radii, inputs, motion, surfaces | `app/globals.css` |
| Fonts, metadata, OG defaults | `app/layout.tsx` |
| Header/nav labels | `components/SiteHeader.tsx`, `lib/data.ts` |
| Footer links and data-source notes | `components/SiteFooter.tsx` |
| Coin colours | `lib/economics.ts` (`COIN_COLORS`) and `lib/coinIcons.ts` |
| Manufacturer monogram colours | `lib/makerMarks.ts` |
| Social image | `app/opengraph-image.tsx` |
| Partner badge snippet | `components/directory/PartnerBadgeCard.tsx` |
| Canonical origin | `lib/site.ts` + `NEXT_PUBLIC_SITE_URL` |

## 11. Quick checklist for new screens

1. Use `PageShell` for header/footer and `max-w-7xl px-5 sm:px-8` for width.
2. Put content in `.surface` or `.surface-strong`, not a bare white panel.
3. Use `text-ink` for primary copy, `text-muted` for secondary, `text-accent` for emphasis and positive values.
4. Use `.btn-primary` for one main action per view; `.btn-ghost` for the rest.
5. Use `SearchSelect`/`MultiSelect` for any list longer than a handful of options.
6. Add `tabular-nums` to numeric columns.
7. Include `RiskDisclaimer` wherever profit or ROI is shown.
8. Set page-specific `metadata` with a canonical path.
9. Test at 320px width and with reduced motion enabled.
