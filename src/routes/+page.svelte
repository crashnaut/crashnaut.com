<script lang="ts">
  import Seo from "#lib/Seo.svelte"
  import { personJsonLd, site, websiteJsonLd } from "#lib/seo.ts"
  import { humanDate } from "#lib/formatters.ts"
  import WorkWithMe from "#lib/WorkWithMe.svelte"
  import PostRow from "#lib/PostRow.svelte"

  const { data } = $props()

  const suites = [
    {
      id: "01",
      name: "Test automation architecture",
      stack: "Playwright · TypeScript · pytest · GraphQL",
      body: "Suites your team can read and extend: fixtures instead of setup scripts, data factories instead of hardcoded IDs, and no sleeps.",
    },
    {
      id: "02",
      name: "CI/CD pipeline integration",
      stack: "GitHub Actions · Docker · AWS",
      body: "Tests that run on every pull request, in parallel, against real environments, so a red build means a real bug.",
    },
    {
      id: "03",
      name: "Financial systems testing",
      stack: "Payments · Compliance · Data integrity",
      body: "The bugs that cost money: duplicate charges, rounding drift, cut-off times, and ledgers that don't reconcile.",
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

<section class="hero container">
  <div class="hero-copy">
    <p class="telemetry">
      <span class="status-dot" aria-hidden="true"></span>
      Senior SDET contractor · Remote from Brazil · US hours
    </p>
    <h1>I crash-test FinTech software <em>before</em> your customers do.</h1>
    <p class="lede">
      I'm Mike Sell. I build test automation and CI/CD pipelines that catch
      payment, ledger and compliance bugs before they reach production.
    </p>
    <div class="actions">
      <a class="btn btn-primary" href={site.calendly} rel="external"
        >Book a 30-min call</a
      >
      <a class="btn btn-ghost" href="/blog">Read the crash log</a>
    </div>
  </div>

  <figure class="report" aria-label="What I do, written as a test report">
    <div class="report-head">
      <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span>npx playwright test --project=crashnaut</span>
    </div>
    <pre><code
        ><span class="dim">Running 3 suites using 3 workers</span>

<span class="ok">✓</span> test-automation-architecture.spec.ts
<span class="ok">✓</span> ci-cd-pipeline-integration.spec.ts
<span class="ok">✓</span> financial-systems.spec.ts

<span class="ok">  3 passed</span> <span class="dim">· 0 flaky · 0 retries</span
        ></code
      ></pre>
  </figure>
</section>

<section class="container suites" aria-labelledby="suites-title">
  <header class="section-head">
    <p class="telemetry">What I test</p>
    <h2 id="suites-title">Three suites, one goal: boring releases.</h2>
  </header>
  <ol class="suite-grid">
    {#each suites as suite}
      <li class="suite">
        <p class="telemetry">Suite {suite.id}</p>
        <h3>{suite.name}</h3>
        <p class="stack">{suite.stack}</p>
        <p>{suite.body}</p>
      </li>
    {/each}
  </ol>
</section>

<section class="container recent" aria-labelledby="recent-title">
  <header class="section-head row">
    <div>
      <p class="telemetry">From the crash log · {data.total} posts</p>
      <h2 id="recent-title">Latest writing</h2>
    </div>
    <a class="link more" href="/blog">All posts →</a>
  </header>
  <ul class="post-list">
    {#each data.recent as post}
      <PostRow {...post} date={humanDate(post.date)} />
    {/each}
  </ul>
</section>

<section class="container narrow cta">
  <WorkWithMe context="page" />
</section>

<style>
  .hero {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: clamp(2rem, 5vw, 4rem);
    align-items: center;
    padding-block: clamp(3rem, 8vw, 6rem) 3rem;
  }

  .hero-copy > * + * {
    margin-top: 1.25rem;
  }

  h1 {
    font-size: clamp(2.3rem, 1.4rem + 3.6vw, 4rem);
    line-height: 1.02;
    letter-spacing: -0.03em;
    font-variation-settings: "wdth" 118;
  }

  h1 em {
    font-style: normal;
    background: var(--signal);
    color: #141414;
    padding: 0 0.12em;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .lede {
    font-size: 1.15rem;
    color: var(--ink-2);
    max-width: 46ch;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem;
    padding-top: 0.5rem;
  }

  .report {
    border: 2px solid var(--ink);
    border-radius: var(--radius);
    background: #121315;
    color: #e6e6e1;
    box-shadow: 8px 8px 0 var(--signal);
    overflow: hidden;
  }

  .report-head {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.55rem 0.9rem;
    background: #1c1d21;
    border-bottom: 1px solid #2b2c31;
    font-family: var(--mono-font);
    font-size: 0.72rem;
    color: #9a9da3;
    white-space: nowrap;
    overflow: hidden;
  }

  .dots {
    display: inline-flex;
    gap: 5px;
  }

  .dots i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #3a3b40;
  }

  .dots i:first-child {
    background: var(--signal);
  }

  .report pre {
    border: 0;
    border-radius: 0;
    background: transparent;
    color: inherit;
    padding: 1.1rem 1.2rem 1.3rem;
    font-size: 0.85rem;
    line-height: 1.75;
  }

  .report code {
    background: none;
    border: 0;
    padding: 0;
    font-size: inherit;
    white-space: pre-wrap;
  }

  .ok {
    color: #6fd08c;
  }

  .dim {
    color: #8a8d93;
  }

  .section-head {
    margin-bottom: 1.5rem;
  }

  .section-head > * + * {
    margin-top: 0.4rem;
  }

  .section-head.row {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
  }

  .section-head h2 {
    font-size: clamp(1.6rem, 1.2rem + 1.5vw, 2.25rem);
  }

  .suites,
  .recent {
    padding-block: 3rem;
  }

  .suite-grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .suite {
    padding: 1.4rem;
    border: 1px solid var(--line);
    border-top: 4px solid var(--signal);
    border-radius: var(--radius);
    background: var(--surface);
  }

  .suite > * + * {
    margin-top: 0.55rem;
  }

  .suite h3 {
    font-size: 1.2rem;
  }

  .suite p:not(.telemetry) {
    color: var(--ink-2);
    font-size: 0.97rem;
    line-height: 1.6;
  }

  .suite .stack {
    font-family: var(--mono-font);
    font-size: 0.78rem !important;
    color: var(--ink-3) !important;
  }

  .post-list {
    list-style: none;
    border-top: 2px solid var(--ink);
  }

  .more {
    font-family: var(--head-font);
    font-weight: 600;
    white-space: nowrap;
  }

  .cta {
    padding-top: 2rem;
  }

  @media (max-width: 520px) {
    .report pre {
      font-size: 0.72rem;
      padding: 0.9rem;
    }
  }

  @media (max-width: 900px) {
    .hero {
      grid-template-columns: 1fr;
    }
    .suite-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
