<script lang="ts">
  import { site } from "#lib/seo.ts"
  import Mark from "#lib/brand/Mark.svelte"

  let { context = "post" }: { context?: "post" | "page" } = $props()
</script>

<aside
  class="work"
  class:on-wall={context === "page"}
  aria-labelledby="work-title"
>
  <div class="body">
    <Mark size={40} />
    <div class="copy">
      <h2 id="work-title">
        {context === "post"
          ? "Want this kind of rigor on your team?"
          : "Shipping software that moves money?"}
      </h2>
      {#if context === "page"}
        <p>
          The first call is 30 minutes and free. You describe the product, the
          stack and what keeps breaking; I tell you honestly whether I’m the
          right fit. Contracts are direct, invoiced through {site.legalEntity
            .name}, registered in Ireland.
        </p>
      {:else}
        <p>
          I’m a senior SDET contractor. I design test automation and CI
          pipelines for FinTech teams, so payment, ledger and compliance bugs
          get caught before release. I work remotely from Brazil with a full US
          working-day overlap.
        </p>
      {/if}
      <div class="actions">
        <a class="btn btn-primary" href={site.calendly} rel="external"
          >Book a 30-min call</a
        >
        <a class="btn btn-ghost" href="/contact">Work with me</a>
      </div>
    </div>
  </div>
</aside>

<style>
  .work {
    border-top: 3px solid var(--ink);
    background: var(--surface-2);
  }

  /* on the home page it sits directly on the closing wall */
  .work.on-wall {
    border-top: 0;
    background: none;
  }

  .work.on-wall .body {
    padding-inline: 0;
    max-width: 46rem;
  }

  .body {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.1rem;
    padding: 1.75rem clamp(1rem, 4vw, 2rem) 2rem;
  }

  .copy > * + * {
    margin-top: 0.6rem;
  }

  h2 {
    font-size: var(--step-3);
    line-height: 1.05;
  }

  p {
    color: var(--ink-2);
    font-size: 1.0625rem;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-top: 0.4rem;
  }

  @media (max-width: 520px) {
    .body {
      grid-template-columns: 1fr;
    }
  }
</style>
