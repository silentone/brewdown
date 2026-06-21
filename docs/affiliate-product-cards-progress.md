# Affiliate product cards: work summary

Progress notes for the static affiliate product card plan (thumbnail, highlight copy, full-card link).

## Assigned todos (status)

| Todo | Status | Notes |
|------|--------|-------|
| `extend-affiliate-model` | **Done** | `AffiliateLink` has `image` and `highlight`; all 15 presets populated |
| `add-thumbnails` | **Done** | 15 WebP files under `public/affiliates/`, names match link `id`s |
| `rebuild-referral-cards` | **Done** | Full-card `<a>` layout with thumbnail, highlight, and "Check price" CTA |

## What was attempted

### 1. Data model (`src/data/affiliates.ts`)

- Extended `AffiliateLink` with `image` and `highlight`.
- Populated all 15 preset entries with `/affiliates/{id}.webp` paths and review-derived highlight copy.
- Updated stale placeholder comment.

### 2. Product images (`public/affiliates/`)

**Goal:** 15 local WebP files named `{id}.webp`, ~400–600px, from Amazon listing heroes or manufacturer CDN.

**Approach A: scrape Amazon product pages** (`scripts/fetch-affiliate-images.mjs`)

- Follow affiliate URLs, resolve ASIN, parse `hiRes` / `data-a-dynamic-image` from HTML.
- **Blocked:** after a few requests, Amazon returns a ~5 KB captcha page instead of full product HTML.
- Only 1–2 images succeeded intermittently before rate limiting.

**Approach B: probe with delays** (`scripts/probe-images.mjs`, `scripts/debug-amazon.mjs`)

- Tried `amazon.com` and `amazon.co.uk` with 2.5–4s delays.
- Most requests still hit captcha; occasional successes yielded CDN URLs for a subset of ASINs.

**Approach C: curated CDN + manufacturer URLs** (`scripts/download-affiliate-images.mjs`)

- Download directly from `m.media-amazon.com` (CDN works without captcha) or manufacturer hosts.
- Resize to 500×500 `object-contain` on white via **sharp**, save as WebP.
- Script keys aligned with link `id`s in `affiliates.ts` (including `manual-espresso-budget` and `manual-espresso-mid`).

**Manufacturer URL probe results:**

| URL | Status |
|-----|--------|
| OXO 9-Cup (`oxo.com/.../11411200.jpg`) | 200 |
| Ninja CE251 (`ninjakitchen.com/.../CE251_1.jpg`) | 200 |
| Ratio Four (guessed Shopify CDN) | 404 |
| Ratio Four (`ratiocoffee.com/cdn/shop/files/ratio4-black-B2_1024x1024.jpg`) | 200 |

**Download script entries (15 products):** `scripts/download-affiliate-images.mjs` maps these link ids to sources:

| Link id | Source |
|---------|--------|
| `bean-to-cup-budget` | Amazon `51EvAQ5unqL` |
| `bean-to-cup-mid` | Amazon `51Q+Kaj2f-L` |
| `bean-to-cup-premium` | Amazon `61aGMpJ7o-L` |
| `manual-espresso-budget` | Amazon `714iikjNi-L` |
| `manual-espresso-mid` | Amazon `71QxJ8rQqSL` |
| `manual-espresso-premium` | Amazon `61MEPYMxZIL` |
| `bulk-drip-budget` | Amazon `61p-3iQVZqL` |
| `bulk-drip-mid` | OXO manufacturer JPG |
| `bulk-drip-premium` | Ratio manufacturer JPG |
| `bulk-french-press-budget` | Amazon `51Tk7Bl5PML` |
| `bulk-french-press-mid` | Amazon `61UeQjIpANL` |
| `bulk-french-press-premium` | Amazon `71G5mqLYaQL` |
| `bulk-pour-over-budget` | Amazon `71zt0Gcnj6L` |
| `bulk-pour-over-mid` | Amazon `51Wp-8q4A7L` |
| `bulk-pour-over-premium` | Amazon `71HlJIN9-6L` |

Misnamed files removed: `builk-drip-mid.webp`, `bean-to-cup-budget-premium.webp`.

### 3. Review-derived highlight copy

- One-line highlights authored for all 15 products in `affiliates.ts`, based on common review themes per tier.

### 4. UI refactor (`ReferralBlocks.svelte`)

- Removed nested `Card` + inner text link.
- Each product is a full-card `<a>` with `cardClasses.root`, lazy thumbnail, label, highlight, and "Check price" CTA.
- Focus ring via `focus-visible:ring-2 focus-visible:ring-brand/20`.

### 5. Helper scripts (not plan deliverables)

| Script | Purpose |
|--------|--------|
| `scripts/fetch-affiliate-images.mjs` | Scrape Amazon pages for images + review text |
| `scripts/download-affiliate-images.mjs` | Download from hardcoded CDN/manufacturer URLs |
| `scripts/debug-amazon.mjs` | Diagnose captcha vs full HTML responses |
| `scripts/probe-images.mjs` | Batch ASIN probing with delays |
| `scripts/probe-ratio.mjs` | Extract Ratio Four Shopify CDN URLs |
| `scripts/probe-urls.mjs` | Verify candidate URLs for missing products |
| `scripts/probe-breville.mjs` | Probe Breville Barista Touch CDN candidates |

## Blockers (resolved)

1. **Amazon bot protection:** programmatic page fetches return captcha HTML; curated CDN URLs used instead.
2. **Breville Barista Touch** (`manual-espresso-mid`): CDN URL `71QxJ8rQqSL` verified; thumbnail on disk.

## Verification

- `npm run build` passes.
- All 15 `/affiliates/{id}.webp` files present in `public/affiliates/`.

## Optional cleanup

- Delete or gitignore one-off `scripts/probe-*.mjs` if not wanted long term.

## Files touched vs unchanged

| File | State |
|------|-------|
| `public/affiliates/*.webp` | 15 files, names match link ids |
| `scripts/download-affiliate-images.mjs` | Updated with all 15 ids |
| `scripts/*.mjs` | Helper scripts added |
| `src/data/affiliates.ts` | Extended with `image` and `highlight` |
| `src/components/ReferralBlocks.svelte` | Full-card product layout |
| `SPEC.md` | Unchanged (not in assigned todos) |
