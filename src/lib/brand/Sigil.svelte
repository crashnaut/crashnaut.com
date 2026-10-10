<script lang="ts">
  // Per-post crash target. The SVG is built at build time by sigilSvg() in
  // src/lib/post-signals.ts; this only sizes it.
  let { svg, size = 32 }: { svg: string; size?: number } = $props()
</script>

<span class="sigil" style:--size={`${size}px`}>{@html svg}</span>

<style>
  .sigil {
    display: inline-block;
    flex: none;
    width: var(--size);
    height: var(--size);
    line-height: 0;
  }

  .sigil :global(svg) {
    width: 100%;
    height: 100%;
  }
</style>
