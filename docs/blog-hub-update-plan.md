# Blog Hub Update Plan

How to replace the placeholder copy on `/blog` as Keurig cluster posts publish. Target file: [`src/pages/blog/index.astro`](../src/pages/blog/index.astro).

**Related:** [keurig-alternative-cluster-content-plan.md](./keurig-alternative-cluster-content-plan.md), [keurig-cluster-internal-linking.md](./keurig-cluster-internal-linking.md).

---

## Current state

The blog index is an empty-state page:

- **Title:** `Blog | The Brewdown`
- **Description:** mentions "New posts coming soon"
- **Body:** "We are getting this section ready; check back soon"
- **UI:** centered "No posts yet" card with a single link to the calculator

This is correct until Post 1 publishes. Do not update the hub before the first post has a live URL.

---

## Rollout by publishing stage

### Stage 0: Before Post 1 (now)

No code changes. Keep empty state.

### Stage 1: After Post 1 publishes

**Trigger:** `/blog/best-keurig-alternatives` is live and linked internally from the post.

**Hub changes:**

1. Update `BaseLayout` **description** to describe active content (remove "coming soon").
2. Replace intro paragraph: acknowledge the series is underway; one pillar post live, more coming.
3. **Remove** the "No posts yet" empty-state `<section>`.
4. **Add** a post list with one card for Post 1.
5. Keep a calculator fallback link below the list (lighter weight than today's empty-state card).

**Suggested hub description (Stage 1):**

> Guides and breakdowns on what home brewing actually costs. Start with our Keurig alternatives series, then run your habits through the calculator.

### Stage 2: After Post 2 publishes

**Trigger:** `/blog/keurig-cost-per-cup-comparison` is live.

1. Add Post 2 card to the list (newest first or series order; see layout below).
2. Optionally add a **series blurb** above the list if not added in Stage 1.
3. No further meta title change required.

### Stage 3: After Post 3 publishes (cluster complete)

**Trigger:** `/blog/quit-keurig-pods-7-day-plan` is live.

1. Add Post 3 card.
2. Update intro copy to present the cluster as complete ("three-part series" wording).
3. Consider a one-line reading order hint: pillar → cost comparison → 7-day plan.

---

## Post metadata for hub cards

Define a single data array at the top of `index.astro` (or extract to `src/data/blog-posts.ts` if reused elsewhere). Each entry:

```ts
interface BlogPostEntry {
  slug: string;           // path without domain, e.g. '/blog/best-keurig-alternatives'
  title: string;          // display title (may match H1)
  description: string;    // 1–2 sentences for card excerpt
  series?: string;        // e.g. 'Keurig alternatives'
  seriesOrder?: number;   // 1 | 2 | 3 for cluster ordering
  publishedAt: string;    // ISO date for <time datetime="">
}
```

### Seed data (fill `publishedAt` on publish)

| seriesOrder | slug | title | description (card excerpt) |
|-------------|------|-------|----------------------------|
| 1 | `/blog/best-keurig-alternatives` | Best Keurig Alternatives in 2026 | Compare drip, French press, pour-over, AeroPress, and bean-to-cup by cost per cup, time, cleanup, and taste. |
| 2 | `/blog/keurig-cost-per-cup-comparison` | Keurig vs French Press, AeroPress, Pour-Over, and Drip: Real Cost Per Cup | Ingredient-only cost per cup with every assumption spelled out. Verify the math, then adjust beans, pods, and cups in the calculator. |
| 3 | `/blog/quit-keurig-pods-7-day-plan` | How to Quit Pods in 7 Days | A day-by-day plan, shopping list, and busy-morning fallbacks to leave K-Cups behind without hobbyist gear. |

Sort for display: `seriesOrder` ascending within the Keurig series; future unrelated posts can sort by `publishedAt` descending above or below the series block.

---

## Layout spec

Match existing content pages (`about.astro`, current blog index): `article` wrapper, `max-w-3xl`, same typography tokens.

### Page structure (Stages 1–3)

```
article
├── eyebrow: "Blog · The Brewdown"
├── h1: "Coffee cost insights" (unchanged)
├── intro paragraph (stage-dependent; see copy below)
├── [optional] series intro (Keurig alternatives, 3 posts when complete)
├── section.post-list
│   └── ul or div grid
│       └── li/card per published post
│           ├── series badge (mono uppercase, optional)
│           ├── h2 → link to post
│           ├── excerpt (description)
│           └── time (publishedAt, formatted)
└── p.calculator-fallback → link "Open the calculator" → /
```

### Card styling (minimal, on-brand)

Reuse patterns from the site without new components:

- Card container: `rounded-lg border border-[var(--line)] bg-paper-2 px-5 py-5 shadow-md` (same family as about callout boxes).
- Post title: `font-display text-xl font-bold`; wrap in `<a>` with brand underline on hover.
- Excerpt: `mt-2 text-ink-2 text-sm` or base size.
- Date: `mt-2 font-mono text-xs uppercase tracking-wide text-ink-3`.
- List spacing: `mt-10 space-y-4` between cards.

### Intro copy by stage

**Stage 1 (one post):**

> Guides and breakdowns on what home brewing actually costs. We are publishing a Keurig alternatives series; the first guide compares methods by cost, convenience, and taste.

**Stage 2 (two posts):**

> Guides and breakdowns on what home brewing actually costs. Our Keurig alternatives series now includes a full roundup and a transparent cost-per-cup comparison.

**Stage 3 (three posts, complete):**

> Guides and breakdowns on what home brewing actually costs. Read the Keurig alternatives series in order: pick a method, verify the math, then follow the 7-day switch plan.

**Series blurb (Stages 2–3, optional `p` above list):**

> **Keurig alternatives series:** replacement options, real cost per cup, and a beginner plan to quit pods.

---

## Metadata updates

| Field | Stage 0 (current) | Stages 1–3 |
|-------|---------------------|------------|
| `title` | `Blog \| The Brewdown` | unchanged |
| `description` | `...New posts coming soon.` | `Articles on home coffee costs, brewing methods, and savings tips from The Brewdown.` |

Do not add `noindex`. Sitemap auto-discovers `/blog` via Astro config; individual post routes will appear when their `.astro` files exist under `src/pages/blog/`.

---

## Implementation snippet (Stage 1 example)

Append-only pattern for `index.astro` frontmatter and template. Adjust `publishedPosts` filter as posts go live.

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';

const posts = [
  {
    slug: '/blog/best-keurig-alternatives',
    title: 'Best Keurig Alternatives in 2026',
    description:
      'Compare drip, French press, pour-over, AeroPress, and bean-to-cup by cost per cup, time, cleanup, and taste.',
    series: 'Keurig alternatives',
    seriesOrder: 1,
    publishedAt: '2026-06-27', // set on publish
  },
  // Uncomment as posts go live:
  // { slug: '/blog/keurig-cost-per-cup-comparison', ... seriesOrder: 2, ... },
  // { slug: '/blog/quit-keurig-pods-7-day-plan', ... seriesOrder: 3, ... },
];

const publishedPosts = posts.filter((p) => p.publishedAt);
---

<BaseLayout
  title="Blog | The Brewdown"
  description="Articles on home coffee costs, brewing methods, and savings tips from The Brewdown."
>
  <!-- article header + intro (Stage 1 copy) -->
  {publishedPosts.length > 0 && (
    <section class="mt-10 space-y-4" aria-label="Blog posts">
      {publishedPosts
        .sort((a, b) => (a.seriesOrder ?? 99) - (b.seriesOrder ?? 99))
        .map((post) => (
          <article class="rounded-lg border border-[var(--line)] bg-paper-2 px-5 py-5 shadow-md">
            {post.series && (
              <p class="font-mono text-xs uppercase tracking-wide text-ink-3">{post.series}</p>
            )}
            <h2 class="mt-1 font-display text-xl font-bold text-ink">
              <a href={post.slug} class="text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand">
                {post.title}
              </a>
            </h2>
            <p class="mt-2 text-ink-2">{post.description}</p>
            <time class="mt-2 block font-mono text-xs uppercase tracking-wide text-ink-3" datetime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          </article>
        ))}
    </section>
  )}
  <p class="mt-8 text-ink-2">
    <a href="/" class="text-sm font-medium text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand">
      Open the calculator
    </a>
  </p>
</BaseLayout>
```

---

## Cross-links from posts to hub

After Stage 1, add to each cluster post (see internal linking doc): optional eyebrow or series line linking to `/blog` with anchor **Keurig alternatives series**.

After Stage 3, Post 3 closing CTA may add: "Browse the full series on the blog" → `/blog`.

---

## Verification checklist (each stage)

- [ ] `/blog` renders without empty-state section once at least one post is listed.
- [ ] Every listed card links to a 200 OK post URL.
- [ ] Meta description no longer says "coming soon" after Stage 1.
- [ ] Footer Blog link still resolves to `/blog`.
- [ ] `npm run build` succeeds; new post routes appear in sitemap output.
- [ ] Calculator fallback link remains on the hub page.
- [ ] No em dashes in new copy.

---

## Out of scope (for later)

- RSS feed, tags, or content collections (`src/content/`).
- Featured images on hub cards.
- Pagination (only three posts in v1).
- Extracting `blog-posts.ts` until a second series exists.
