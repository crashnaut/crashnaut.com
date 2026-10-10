<script lang="ts">
  import Seo from "$lib/Seo.svelte"
  import Mark from "$lib/brand/Mark.svelte"
  import { site } from "$lib/seo"

  const steps = [
    {
      n: "01",
      title: "Intro call",
      body: "30 minutes, free. You describe the product, the stack and what keeps breaking. I tell you honestly whether I'm the right fit.",
    },
    {
      n: "02",
      title: "Audit",
      body: "I review your current tests, CI pipeline and release process, then come back with a prioritized list of what to fix first and why.",
    },
    {
      n: "03",
      title: "Build & hand over",
      body: "I build the automation and the pipeline gates alongside your team, document them, and leave something your engineers can own.",
    },
  ]

  const logistics = [
    ["Engagement", "Direct contract, no agency in the middle"],
    ["Location", "Remote from Brazil (UTC−3)"],
    ["Overlap", "A full US working day, East Coast to Pacific"],
    ["Invoicing", `Through ${site.legalEntity.name}, registered in Ireland`],
  ]
</script>

<Seo
  title="Work with me · Senior SDET contractor | Crashnaut"
  description="Hire Mike Sell, a senior SDET contractor, for Playwright test automation, CI/CD pipelines and FinTech systems testing. Remote, with US hours overlap."
  canonical={`${site.url}/contact`}
/>

<div class="container narrow page">
  <header class="head">
    <p class="telemetry">
      <span class="status-dot" aria-hidden="true"></span> Taking new contracts
    </p>
    <h1>Work with me</h1>
    <p class="lede">
      I help FinTech teams ship faster without shipping bugs: test automation
      architecture, CI/CD integration, and testing for payments, compliance and
      data integrity.
    </p>
    <div class="actions">
      <a class="btn btn-primary" href={site.calendly} rel="external"
        >Book a 30-min call</a
      >
      <a class="btn btn-ghost" href={site.linkedin} rel="external"
        >Message me on LinkedIn</a
      >
    </div>
  </header>

  <section aria-labelledby="how-title">
    <h2 id="how-title">How an engagement runs</h2>
    <ol class="steps">
      {#each steps as step}
        <li>
          <span class="telemetry">Step {step.n}</span>
          <h3>{step.title}</h3>
          <p>{step.body}</p>
        </li>
      {/each}
    </ol>
  </section>

  <section aria-labelledby="log-title">
    <h2 id="log-title">Logistics</h2>
    <dl class="spec">
      {#each logistics as [k, v]}
        <div>
          <dt class="telemetry">{k}</dt>
          <dd>{v}</dd>
        </div>
      {/each}
    </dl>
  </section>

  <section class="sign-off">
    <Mark size={36} />
    <p>
      Not ready for a call? Read the <a class="link" href="/blog">crash log</a>
      to see how I think about testing, or find the code on
      <a class="link" href={site.github} rel="external">GitHub</a>.
    </p>
  </section>
</div>

<style>
  .page {
    padding-top: clamp(2.5rem, 6vw, 4.5rem);
  }

  .page > * + * {
    margin-top: 3.5rem;
  }

  .head > * + * {
    margin-top: 1rem;
  }

  h1 {
    font-size: clamp(2.2rem, 1.5rem + 3vw, 3.4rem);
    letter-spacing: -0.03em;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .lede {
    color: var(--ink-2);
    font-size: 1.15rem;
    max-width: 55ch;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem;
    padding-top: 0.5rem;
  }

  .steps {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    counter-reset: step;
  }

  .steps li {
    padding: 1.25rem;
    border: 1px solid var(--line);
    border-top: 4px solid var(--signal);
    border-radius: var(--radius);
    background: var(--surface);
  }

  .steps li > * + * {
    margin-top: 0.5rem;
  }

  .steps h3 {
    font-size: 1.1rem;
  }

  .steps p {
    color: var(--ink-2);
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .spec {
    border-top: 2px solid var(--ink);
  }

  .spec > div {
    display: grid;
    grid-template-columns: 9rem 1fr;
    gap: 1rem;
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--line);
    align-items: baseline;
  }

  .sign-off {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1.25rem;
    border: 1px dashed var(--ink-3);
    border-radius: var(--radius);
    color: var(--ink-2);
  }

  @media (max-width: 760px) {
    .steps {
      grid-template-columns: 1fr;
    }
    .spec > div {
      grid-template-columns: 1fr;
      gap: 0.2rem;
    }
  }
</style>
