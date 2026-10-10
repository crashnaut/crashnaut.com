<script lang="ts">
  import type { RibbonSegment } from "#lib/post-signals.ts"

  let { segments, label }: { segments: RibbonSegment[]; label: string } =
    $props()
</script>

<div class="ribbon" role="img" aria-label={label}>
  {#each segments as segment, i (i)}
    <span class={`seg ${segment.kind}`} style:flex-grow={segment.weight}></span>
  {/each}
</div>

<style>
  .ribbon {
    display: flex;
    gap: 2px;
    height: 6px;
    max-width: 75ch;
    overflow: hidden;
  }

  .seg {
    flex-basis: 0;
    min-width: 3px;
    border-radius: 1px;
  }

  .prose {
    background: hsla(var(--base-color), 0.22);
  }
  .code {
    background: var(--info);
  }
  .diagram {
    background: var(--signal);
  }
  .callout {
    background: var(--warn);
  }
  .compare {
    background: var(--pass);
  }
</style>
