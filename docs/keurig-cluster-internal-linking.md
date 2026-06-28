# Keurig Cluster: Internal Linking and Calculator CTAs

Anchor text, placement, and URL targets for cross-links among the three cluster posts and the Brewdown calculator. Use this when drafting or editing posts; do not change the plan file in `.cursor/plans/`.

**Related:** [keurig-alternative-cluster-content-plan.md](./keurig-alternative-cluster-content-plan.md) (outlines and keywords).

---

## URL reference

| Target | Path | Notes |
|--------|------|-------|
| Calculator (standard) | `/` | Primary conversion destination |
| Calculator (partner) | `/compare` | Same UI; use `/` in blog copy unless partner-specific page |
| About / methodology | `/about` | Machine cost on day one, 60-month horizon, what's included |
| Post 1 (pillar) | `/blog/best-keurig-alternatives` | Best Keurig Alternatives in 2026 |
| Post 2 (support) | `/blog/keurig-cost-per-cup-comparison` | Keurig vs bulk methods: cost per cup |
| Post 3 (support) | `/blog/quit-keurig-pods-7-day-plan` | How to Quit Pods in 7 Days |
| Blog hub | `/blog` | Series index after first post publishes |

The calculator has no query-param deep links today. CTAs should link to `/` and tell the reader which methods or inputs to adjust after landing (pods vs French press, beans price, cups per day).

---

## Linking rules (all three posts)

1. **Minimum cluster links per post:** 2 links to the other cluster posts (different anchor text each time) plus 2 calculator links (one inline, one in the closing CTA block).
2. **One `/about` link** in Post 2 only (methodology section); optional second mention in Post 1 objection handling (upfront machine cost).
3. **Do not repeat the same anchor text** for the same destination within a single post.
4. **First calculator mention** in each post should be inline in body copy; the **closing H2 CTA** uses the primary button-style link (see CTA blocks below).
5. **FAQ answers** are required link slots: at least 2 FAQ answers per post must link to another cluster post or the calculator.
6. **Publishing order:** Post 1 may tease Post 2 and Post 3 before those URLs exist (plain text + "coming soon" is OK for draft only). Replace with live links when each support post publishes.

---

## Calculator CTA patterns

Use action-oriented anchor text. Avoid generic "click here" or "learn more" for calculator links.

| Context | Recommended anchor text | Placement |
|---------|-------------------------|-----------|
| Primary closing CTA | **Run your own numbers** | Final H2 section; standalone link or button |
| Adjust inputs framing | **Open the calculator and adjust the assumptions** | Post 2 sensitivity section and closing CTA |
| Savings teaser | **see your monthly savings in the calculator** | Post 1 FAQ ("How much money can I save") and Post 3 Day 7 |
| Crossover / long-run | **compare cumulative costs on the chart** | Post 1 bean-to-cup dive, Post 2 machine upfront section |
| Personal habits | **enter your pod box price and local beans** | Post 2 FAQ ("How do I compare my actual spending") |
| Day 7 benchmark | **benchmark pods vs French press in the calculator** | Post 3 Day 7 and closing CTA |

**Reader instructions after landing (prose, not URL params):**

- **Post 1 default scenario:** Keep pods selected; add bulk brew with French press or drip gear preset; compare ingredient lines and chart.
- **Post 2 default scenario:** Pods vs one bulk method from the results table; change beans price and K-Cup price to match the reader's cart.
- **Post 3 default scenario:** Pods vs French press; enter actual pod price paid and beans price from the shopping list tier.

---

## Post 1: Best Keurig Alternatives (pillar)

**File (when published):** `src/pages/blog/best-keurig-alternatives.astro`  
**Slug:** `/blog/best-keurig-alternatives`

### Outbound links

| # | Section | Placement | Link to | Anchor text |
|---|---------|-----------|---------|-------------|
| 1 | §1 Hook | After teaser cost comparison (K-Cup vs French press) | Post 2 | **full assumptions table for Keurig cost per cup** |
| 2 | §2 At a glance | Table footnote | Post 2 | **how we calculate ingredient cost per cup** |
| 2b | §2 At a glance | Table footnote (second link) | `/` | **run your own numbers in the calculator** |
| 3 | §3 Decision framework | After persona tied to bulk brew presets | `/` | **try the bulk brew gear presets in the calculator** |
| 4 | §4 Bean-to-cup H3 | After crossover mention | `/` | **compare cumulative costs on the chart** |
| 5 | §5 Objection handling | Upfront gear cost bullet | `/about` | **how Brewdown treats machine cost on day one** |
| 6 | §6 FAQ | "How much money can I save vs K-Cups?" answer | `/` | **see your monthly savings in the calculator** |
| 7 | §6 FAQ | "Is pour-over or French press easier for beginners?" answer | Post 3 | **7-day plan to quit pods** |
| 8 | §6 FAQ | "Are bean-to-cup machines worth it vs Keurig?" answer | Post 2 | **Keurig vs alternatives cost breakdown** |
| 9 | §7 Action CTA | Primary button | `/` | **Run your own numbers** |
| 10 | §7 Action CTA | Secondary link list | Post 2 | **cost assumptions and methodology** |
| 11 | §7 Action CTA | Secondary link list | Post 3 | **quit pods in 7 days** |

### Inbound links (from other posts)

| From | Section | Anchor text pointing to Post 1 |
|------|---------|-------------------------------|
| Post 2 | §1 Hook or §9 CTA | **best Keurig alternatives** or **pick a brewing method** |
| Post 3 | §2 Shopping list, §6 Busy mornings, §9 CTA | **compare all Keurig alternatives** or **best alternatives roundup** |
| Post 3 | §8 FAQ "easiest pod alternative" | **best Keurig alternatives for beginners** |

---

## Post 2: Keurig cost per cup comparison (support)

**File (when published):** `src/pages/blog/keurig-cost-per-cup-comparison.astro`  
**Slug:** `/blog/keurig-cost-per-cup-comparison`

### Outbound links

| # | Section | Placement | Link to | Anchor text |
|---|---------|-----------|---------|-------------|
| 1 | §1 Hook | End of paragraph (after headline $/cup answer) | Post 1 | **which Keurig alternative fits your household** |
| 2 | §2 Assumptions table | Below table invite | `/` | **replace any row in the calculator** |
| 3 | §3 Methodology | After "what this does not include" | `/about` | **full Brewdown cost model** |
| 4 | §4 Results table | Monthly savings callout box | `/` | **see your monthly savings in the calculator** |
| 5 | §5 Machine upfront | Crossover scenario paragraph | `/` | **compare cumulative costs on the chart** |
| 6 | §6 Sensitivity | Section closing | `/` | **Open the calculator and adjust the assumptions** |
| 7 | §7 Café spend | Closing sentence | `/` | **set shop drinks honestly per method** |
| 8 | §8 FAQ | "How do I compare my actual spending?" | `/` | **enter your pod box price and local beans** |
| 9 | §8 FAQ | "Keurig vs French press: which is cheaper?" | Post 3 | **switch to French press in a week** |
| 10 | §9 Action CTA | Primary button | `/` | **Open the calculator and adjust the assumptions** |
| 11 | §9 Action CTA | Secondary link | Post 1 | **pick a method from the alternatives guide** |
| 12 | §9 Action CTA | Secondary link | Post 3 | **7-day plan to quit pods** |

### Inbound links (from other posts)

| From | Section | Anchor text pointing to Post 2 |
|------|---------|-------------------------------|
| Post 1 | §1 Hook, §2 footnote, §7 CTA, §8 FAQ | **full assumptions table**, **cost assumptions and methodology**, **Keurig vs alternatives cost breakdown** |
| Post 3 | §1 Hook, §7 Day 7, §8 FAQ, §9 CTA | **real cost per cup comparison**, **cost assumptions behind these numbers** |

---

## Post 3: Quit pods in 7 days (support)

**File (when published):** `src/pages/blog/quit-keurig-pods-7-day-plan.astro`  
**Slug:** `/blog/quit-keurig-pods-7-day-plan`

### Outbound links

| # | Section | Placement | Link to | Anchor text |
|---|---------|-----------|---------|-------------|
| 1 | §1 Hook | Savings tease (no full math) | Post 2 | **real cost per cup comparison** |
| 2 | §2 Shopping list | "Prefer drip from the start" callout | Post 1 | **drip and other Keurig alternatives** |
| 3 | §4 Day 5 H3 | After AeroPress backup intro | Post 1 | **why AeroPress works as a backup** |
| 4 | §4 Day 7 H3 | Benchmark step | `/` | **benchmark pods vs French press in the calculator** |
| 5 | §4 Day 7 H3 | After calculator step | Post 2 | **cost assumptions behind these numbers** |
| 6 | §6 Busy mornings | Drip switch bullet | Post 1 | **drip coffee maker section in the alternatives guide** |
| 7 | §7 Objections | "Coffee shop on the way to work" | `/` | **count shop drinks in the calculator** |
| 8 | §8 FAQ | "Is it cheaper to stop using K-Cups?" | Post 2 | **Keurig vs French press ingredient cost** |
| 9 | §8 FAQ | "What is the easiest pod alternative?" | Post 1 | **best Keurig alternatives for beginners** |
| 10 | §9 Action CTA | Primary button | `/` | **Run your own numbers** |
| 11 | §9 Action CTA | Secondary link | Post 1 | **compare all Keurig alternatives** |
| 12 | §9 Action CTA | Secondary link | Post 2 | **cost assumptions and methodology** |

### Inbound links (from other posts)

| From | Section | Anchor text pointing to Post 3 |
|------|---------|----------------------------------|
| Post 1 | §6 FAQ, §7 CTA | **7-day plan to quit pods**, **quit pods in 7 days** |
| Post 2 | §8 FAQ, §9 CTA | **switch to French press in a week**, **7-day plan to quit pods** |

---

## Link matrix (quick reference)

Rows link **to** columns. Minimum anchors listed; additional contextual links above are encouraged.

|  | Post 1 | Post 2 | Post 3 | Calculator `/` | About `/about` |
|--|--------|--------|--------|----------------|----------------|
| **Post 1** | — | 2+ | 2+ | 3+ | 0–1 |
| **Post 2** | 1+ | — | 1+ | 4+ | 1 |
| **Post 3** | 2+ | 2+ | — | 3+ | 0 |

---

## CTA block markup (closing section)

Each post ends with an H2 action section. Use consistent structure:

1. **One sentence** restating that defaults are starting points.
2. **Primary link** to `/` with anchor **Run your own numbers** (Post 2 may use **Open the calculator and adjust the assumptions**).
3. **Two secondary text links** to the other cluster posts (anchor text from tables above).
4. **One closing encouragement line** (no link required).

Style secondary links like existing site inline links (`text-brand underline decoration-brand/40`). Primary CTA may match the blog hub calculator link pattern in `src/pages/blog/index.astro` until a shared button component exists.

---

## Blog hub back-links (after publish)

When posts are live, each post should also be discoverable from `/blog` (see [blog-hub-update-plan.md](./blog-hub-update-plan.md)). Optional but recommended: add a short "Part of: Keurig alternatives series" line above the Post 1 H1 (and support posts) linking to `/blog` with anchor **Keurig alternatives series**.

---

## Pre-publish checklist (per post)

- [ ] Every outbound link in the tables above is present (or intentionally deferred with a tracked TODO for not-yet-published targets).
- [ ] Calculator links include brief "what to change after you land" instructions in adjacent prose.
- [ ] No duplicate anchor text for the same URL within the post.
- [ ] FAQ section includes at least 2 internal or calculator links.
- [ ] Closing CTA block matches the three-part pattern (primary calculator + 2 cluster links).
- [ ] No em dashes in anchor text or surrounding copy.
