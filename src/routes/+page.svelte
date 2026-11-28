<script lang="ts">
  import Seo from "#lib/Seo.svelte"
  import { personJsonLd, site, websiteJsonLd } from "#lib/seo.ts"
  import { humanDate } from "#lib/formatters.ts"
  import WorkWithMe from "#lib/WorkWithMe.svelte"
  import PostRow from "#lib/PostRow.svelte"

  const { data } = $props()

  const suites = [
    {
      name: "Test automation architecture",
      stack: "Playwright, TypeScript, pytest, GraphQL",
      body: "Suites your team can read and extend: fixtures instead of setup scripts, data factories instead of hardcoded IDs, and no sleeps.",
    },
    {
      name: "CI/CD pipeline integration",
      stack: "GitHub Actions, Docker, AWS",
      body: "Tests that run on every pull request, in parallel, against real environments, so a red build means a real bug.",
    },
    {
      name: "Financial systems testing",
      stack: "Payments, compliance, data integrity",
      body: "The bugs that cost money: duplicate charges, rounding drift, cut-off times, and ledgers that don’t reconcile.",
    },
  ]

  // Every figure is quoted from the linked post, which cites its own source.
  const proof = [
    {
      figure: "£48.65M",
      text: "in fines for TSB in 2022, after a configuration difference between two data centres went undetected in testing.",
      slug: "what-late-qa-really-costs",
      title: "What late QA really costs",
    },
    {
      figure: "1,024 → 6",
      text: "test runs for ten on/off feature flags: every configuration, or every pair of flag values covered with pairwise testing.",
      slug: "the-feature-flag-nightmare",
      title: "How to test feature flags without testing 2ⁿ combinations",
    },
    {
      figure: "5",
      text: "parts every integration test shares, worked through a create-payment test that checks the ledger.",
      slug: "anatomy-of-an-integration-test",
      title: "Every integration test has the same five parts",
    },
  ]
</script>

<Seo
  title="Mike Sell · Senior SDET contractor for FinTech | Crashnaut"
  description="I help FinTech teams ship reliable software faster with Playwright test automation, CI/CD pipelines and financial systems testing."
  canonical={site.url}
  keywords="SDET contractor, FinTech QA, test automation, Playwright, CI/CD, payments testing, Mike Sell, Crashnaut"
  schema={[personJsonLd(), websiteJsonLd()]}
/>

<section class="wall hero-wall" aria-labelledby="hero-title">
  <svg class="target" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle cx="16" cy="16" r="15.4" fill="var(--signal)" />
    <path
      d="M16 16 L16 .6 A15.4 15.4 0 0 0 .6 16 Z M16 16 L16 31.4 A15.4 15.4 0 0 0 31.4 16 Z"
      fill="var(--target-ink)"
    />
    <circle
      cx="16"
      cy="16"
      r="15.4"
      fill="none"
      stroke="var(--target-ring)"
      stroke-width=".6"
    />
  </svg>
  <div class="container hero">
    <h1 id="hero-title">
      I <span class="nowrap">crash-test</span> FinTech software before your customers
      do.
    </h1>
    <p class="lede">
      I’m Mike Sell, a senior SDET contractor working remotely from Brazil on US
      hours. I build test automation and CI/CD pipelines that catch payment,
      ledger and compliance bugs before they reach production.
    </p>
    <div class="actions">
      <a class="btn btn-primary" href={site.calendly} rel="external"
        >Book a 30-min call</a
      >
      <a class="btn btn-ghost" href="/blog">Read the blog</a>
    </div>
  </div>
</section>

<section class="container proof" aria-labelledby="proof-title">
  <div class="intro">
    <h2 id="proof-title">From the crash log</h2>
    <p>
      What bugs in money software cost, and how to catch them. Each figure is
      sourced in its post.
    </p>
  </div>
  <ul class="proof-list">
    {#each proof as item}
      <li>
        <p class="figure">{item.figure}</p>
        <p class="text">{item.text}</p>
        <a class="link source" href={`/blog/${item.slug}`}>{item.title}</a>
      </li>
    {/each}
  </ul>
</section>

<section class="container suites" aria-labelledby="suites-title">
  <div class="intro">
    <h2 id="suites-title">What I test</h2>
    <p>Three kinds of work, one goal: a red build means a real bug.</p>
  </div>
  <dl class="suite-list">
    {#each suites as suite}
      <div class="suite">
        <dt>{suite.name}</dt>
        <dd>
          <p>{suite.body}</p>
          <p class="stack">{suite.stack}</p>
        </dd>
      </div>
    {/each}
  </dl>
</section>

<section class="container recent" aria-labelledby="recent-title">
  <header class="section-head">
    <h2 id="recent-title">Latest writing</h2>
    <a class="link more" href="/blog">All {data.total} posts</a>
  </header>
  <ul class="post-list">
    {#each data.recent as post}
      <PostRow {...post} date={humanDate(post.date)} level={3} />
    {/each}
  </ul>
</section>

<section class="wall cta-wall">
  <div class="container cta">
    <WorkWithMe context="page" />
  </div>
</section>

<style>
  .hero-wall {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  /* The quadrant target, cropped off the right edge at the point of impact */
  .target {
    position: absolute;
    z-index: -1;
    top: 50%;
    right: max(-9vw, -8rem);
    width: min(44vw, 34rem);
    height: auto;
    aspect-ratio: 1;
    transform: translateY(-50%);
  }

  .hero {
    padding-block: clamp(3rem, 7vw, 5.5rem) clamp(3rem, 6vw, 4.5rem);
  }

  .hero > * + * {
    margin-top: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  h1 {
    max-width: 52rem;
    font-size: clamp(3rem, 1.5rem + 5.2vw, 6rem);
    line-height: 0.92;
    letter-spacing: -0.005em;
  }

  .nowrap {
    white-space: nowrap;
  }

  .lede {
    max-width: 44ch;
    font-size: var(--step-1);
    line-height: 1.55;
    color: var(--ink-2);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  /* Shared 12-column section: heading + one-line intro in 4, content in 8 */
  .proof,
  .suites {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1.5rem;
    padding-block: clamp(3rem, 7vw, 5rem) 0;
  }

  .intro {
    grid-column: 1 / span 4;
  }

  .intro > * + * {
    margin-top: 0.75rem;
  }

  .intro p {
    max-width: 30ch;
    color: var(--ink-2);
  }

  h2 {
    font-size: var(--step-3);
    line-height: 1.05;
  }

  .proof-list,
  .suite-list {
    grid-column: 5 / -1;
    list-style: none;
    border-top: 3px solid var(--ink);
  }

  .proof-list li {
    display: grid;
    grid-template-columns: 11rem minmax(0, 1fr);
    gap: 0.35rem 1.5rem;
    padding: 1.25rem 0 1.35rem;
    border-bottom: 1px solid var(--line);
  }

  .figure {
    grid-row: span 2;
    font-family: var(--head-font);
    font-weight: 700;
    font-size: var(--step-3);
    line-height: 1;
    font-variant-numeric: tabular-nums lining-nums;
    white-space: nowrap;
  }

  .proof-list .text {
    max-width: 52ch;
    line-height: 1.55;
  }

  .source {
    justify-self: start;
    font-family: var(--ui-font);
    font-weight: 500;
    font-size: var(--step--1);
    color: var(--ink-2);
  }

  .suite {
    display: grid;
    grid-template-columns: 11rem minmax(0, 1fr);
    gap: 0.35rem 1.5rem;
    padding: 1.25rem 0 1.35rem;
    border-bottom: 1px solid var(--line);
  }

  .suite dt {
    font-family: var(--ui-font);
    font-weight: 600;
    font-size: 1.0625rem;
    line-height: 1.3;
  }

  .suite dd {
    color: var(--ink-2);
    line-height: 1.6;
  }

  .suite dd > * + * {
    margin-top: 0.4rem;
  }

  .suite .stack {
    font-family: var(--ui-font);
    font-size: var(--step--1);
    color: var(--ink-3);
  }

  .recent {
    padding-block: clamp(3rem, 7vw, 5rem) 0;
  }

  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .post-list {
    list-style: none;
    border-top: 3px solid var(--ink);
  }

  .more {
    font-family: var(--ui-font);
    font-weight: 600;
    white-space: nowrap;
  }

  /* The page ends back at the wall it started on */
  .cta-wall {
    margin-top: clamp(3rem, 7vw, 5rem);
    border-top: 3px solid var(--ink);
    border-bottom: 0;
  }

  .cta {
    padding-block: clamp(2.5rem, 6vw, 4rem);
  }

  @media (max-width: 960px) {
    .intro,
    .proof-list,
    .suite-list {
      grid-column: 1 / -1;
    }
    .intro p {
      max-width: 60ch;
    }
  }

  @media (max-width: 560px) {
    .proof-list li,
    .suite {
      grid-template-columns: 1fr;
    }
    .figure {
      grid-row: auto;
    }
  }

  /* Up to tablet width the headline needs the full measure, so the target moves
     off the text: about 60% of it, its centre near the right edge beside the buttons. */
  @media (max-width: 1100px) {
    .target {
      top: auto;
      bottom: clamp(2.5rem, 6vw, 3.5rem);
      right: 0;
      width: clamp(10rem, 22vw, 15rem);
      transform: translateX(40%);
    }
  }

  /* Phones: a smaller target, about 60% showing, centred on the last row of
     buttons, which keep clear of it. */
  @media (max-width: 560px) {
    .target {
      width: 8.5rem;
      bottom: calc(clamp(3rem, 6vw, 4.5rem) + 24px - 4.25rem);
      right: 0;
      transform: translateX(40%);
    }
    .actions {
      padding-right: 3.75rem;
    }
    .hero > .actions {
      margin-top: 1.75rem;
    }
  }
</style>
