<script lang="ts">
  import { site } from "$lib/seo"
  import Mark from "$lib/brand/Mark.svelte"

  let { context = "post" }: { context?: "post" | "page" } = $props()
</script>

<aside class="work" aria-labelledby="work-title">
  <div class="hazard" aria-hidden="true"></div>
  <div class="body">
    <Mark size={40} />
    <div class="copy">
      <p class="telemetry">Available for contract work</p>
      <h2 id="work-title">
        {context === "post"
          ? "Want this kind of rigor on your team?"
          : "Shipping software that moves money?"}
      </h2>
      <p>
        I'm a senior SDET contractor. I design test automation and CI pipelines
        for FinTech teams, so payment, ledger and compliance bugs get caught
        before release. I work remotely from Brazil with a full US working-day
        overlap.
      </p>
      <div class="actions">
        <a class="btn btn-primary" href={site.calendly} rel="external"
          >Book a 30-min call</a
        >
        <a class="btn btn-ghost" href="/contact">How I work</a>
      </div>
    </div>
  </div>
</aside>

<style>
  .work {
    border: 2px solid var(--ink);
    border-radius: var(--radius);
    background: var(--surface);
    overflow: hidden;
  }

  .body {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.1rem;
    padding: 1.4rem 1.4rem 1.5rem;
  }

  .copy > * + * {
    margin-top: 0.6rem;
  }

  h2 {
    font-size: 1.35rem;
  }

  p:not(.telemetry) {
    color: var(--ink-2);
    font-size: 0.98rem;
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
