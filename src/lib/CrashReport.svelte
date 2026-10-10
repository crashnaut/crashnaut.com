<script lang="ts">
  import type { PostSignals } from "#lib/post-signals.ts"

  let { run, signals }: { run: number; signals: PostSignals } = $props()

  const plural = (n: number, one: string, many = `${one}s`) =>
    `${n} ${n === 1 ? one : many}`
  // non-breaking space keeps "ts 6" together when the strip wraps
  const langs = $derived(
    signals.samples.map((s) => `${s.lang}\u00a0${s.count}`).join(", "),
  )
</script>

<p class="telemetry crash-report">
  <span class="items">
    <b class="item">Run {String(run).padStart(3, "0")}</b>
    <span class="item">{plural(signals.zones, "zone")}</span>
    <span class="item">
      {plural(signals.sampleTotal, "sample")}
      {#if signals.samples.length}
        <span class="langs">({langs})</span>
      {/if}
    </span>
    <span class="item">{plural(signals.diagrams, "diagram")}</span>
    <span class="item">{plural(signals.compares, "compare")}</span>
  </span>
</p>

<style>
  /* Every item carries a leading "·"; the negative margin pushes the one
     starting each line outside the clipped box, so wrapped lines start clean. */
  .crash-report {
    overflow: hidden;
  }

  .items {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    row-gap: 0.2rem;
    margin-left: -1.4em;
  }

  .item {
    white-space: nowrap;
  }

  .item:has(.langs) {
    white-space: normal;
  }

  .item::before {
    content: "·" / "";
    display: inline-block;
    width: 1.4em;
    text-align: center;
    color: var(--ink-3);
  }
</style>
