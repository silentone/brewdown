# Backlog

Post-v1 ideas and future work for **The Brewdown**. Not committed scope.

**Related docs:** [SPEC.md](./SPEC.md) defines v1 scope, formulas, and UX. Items here are candidates to promote into SPEC when picked up.

## How to use this file

Each item uses:

| Field | Meaning |
|-------|---------|
| **Status** | `idea` · `planned` · `in progress` · `done` |
| **Priority** | `low` · `medium` · `high` |
| **Refs** | Files or SPEC sections to read first |

When something ships, mark it **done**, add a one-line note under the item, and update SPEC if behavior changed.

---

## Local currency support

**Status:** idea  
**Priority:** medium  
**Refs:** SPEC.md §2.2 (currently out of scope), §5.1–5.4 (defaults), `src/data/methods.ts`, `src/lib/format.ts`, `src/components/NumericField.svelte`, `src/lib/brewing-cost.ts`

### Problem

All money amounts assume **USD**. The `$` prefix is hardcoded on currency inputs, display uses `formatUsd()` (`en-US` / `USD`), and default machine/ingredient/shop prices are US-market illustrative values.

### Goals

- User sees amounts in a **local currency** (symbol, grouping, decimal rules).
- Currency inputs show the correct **fixed prefix/suffix**; the symbol is not part of the editable value (same pattern as today's `$` on `NumericField`).
- **Defaults tell a credible story** per market (not just `USD amount × exchange rate`).
- Chart axis, summary cards, breakdown table, and insight copy all use the same formatter.

### Open decisions (resolve before building)

1. **Selector:** Browser locale auto-detect only, explicit dropdown in Advanced options, or both (auto + override)?
2. **Internal storage:** Keep a single numeric amount in the user's chosen currency (simplest), or store USD internally and convert for display (only needed if users switch currency mid-session).
3. **Initial currency set:** Start with USD, GBP, EUR, CAD, AUD? Add others on demand.
4. **Units coupling:** SPEC defers metric units. Currency work can ship without metric, but labels like `Coffee cost ($/lb)` will need locale-aware unit copy later.

### Implementation sketch

- [ ] Add `CurrencyCode` type and a small locale/currency module (e.g. `src/lib/currency.ts`).
- [ ] Replace `formatUsd()` with `formatMoney(amount, currency)` using `Intl.NumberFormat`.
- [ ] Parameterize defaults: split `src/data/methods.ts` into shared structure + per-currency default tables (e.g. `src/data/defaults/usd.ts`, `gbp.ts`, …) or one map keyed by currency.
- [ ] Wire `NumericField` `currency` prop to show the correct symbol from `Intl` (handle prefix vs suffix for EUR).
- [ ] Global state for selected currency (likely in `BrewdownApp.svelte`); persist in `localStorage` optional.
- [ ] Update hardcoded copy: BreakdownTable / SummaryCards `$/drink` column header, MethodPanel `Coffee cost ($/lb)` label.
- [ ] Tests for formatter and default loading per currency.

### Current USD defaults (baseline)

Use these as the reference when drafting regional defaults. Shop drink **counts** are probably currency-independent; **prices** are not.

| Input | Source | USD default |
|-------|--------|-------------|
| Coffee drinks at home per day | `brewing-cost.ts` | `2` |
| Average shop drink price | `brewing-cost.ts` | `$5.00` |
| Bean-to-cup machine | `methods.ts` | `$800` |
| Bean-to-cup coffee | `methods.ts` | `$12/lb` |
| Bulk brew (drip preset) machine | `BULK_GEAR_PRESETS.drip` | `$45` |
| Bulk brew (drip preset) coffee | `BULK_GEAR_PRESETS.drip` | `$10/lb` |
| Manual espresso machine | `methods.ts` | `$550` |
| Manual espresso coffee | `methods.ts` | `$14/lb` |
| K-Cup machine | `POD_STYLE_PRESETS.kcup` | `$120` |
| K-Cup cost per pod | `POD_STYLE_PRESETS.kcup` | `$0.65` |
| Nespresso machine | `POD_STYLE_PRESETS.nespresso` | `$180` |
| Nespresso cost per capsule | `POD_STYLE_PRESETS.nespresso` | `$0.75` |

### Draft regional defaults (to research / confirm)

Round to sensible retail price points. Goal: preserve crossover and café-reduction stories from SPEC §5.4 and Appendix A, not exact FX conversion.

| Input | USD | GBP (draft) | EUR (draft) | CAD (draft) | AUD (draft) |
|-------|-----|-------------|-------------|-------------|-------------|
| Shop drink price | 5 | 4.50 | 5.00 | 6.50 | 7.00 |
| Bean-to-cup machine | 800 | 650 | 750 | 1100 | 1200 |
| Bean-to-cup coffee ($/lb) | 12 | 10 | 11 | 16 | 18 |
| K-Cup machine | 120 | 90 | 100 | 160 | 170 |
| K-Cup per pod | 0.65 | 0.50 | 0.55 | 0.85 | 0.90 |

_Add remaining method/preset rows before implementation. Mark sources or rationale in a comment in the defaults file._

---

## Metric units toggle

**Status:** idea  
**Priority:** low  
**Refs:** SPEC.md §2.2, §5 (grams internally), `src/lib/format.ts` (`GRAMS_PER_POUND`)

Show oz/g for ingredient labels and hints; keep grams internally for math. Likely pairs with currency/locale work but can ship separately.

---

## Shareable scenario URLs

**Status:** idea  
**Priority:** low  
**Refs:** SPEC.md §2.2

Encode calculator state in the URL hash or query string so users can bookmark or share a comparison. No backend required.

---

## Display advertising

**Status:** idea  
**Priority:** low  
**Refs:** SPEC.md §10.2

Deferred from v1. Revisit after affiliate/referral flow is live.
