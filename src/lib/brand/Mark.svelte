<script lang="ts">
  // Crash-test target: the quadrant marker stuck on test dummies and crash cars.
  let { size = 28, title = "" }: { size?: number; title?: string } = $props()
</script>

<svg
  class="mark"
  width={size}
  height={size}
  viewBox="0 0 32 32"
  role={title ? "img" : undefined}
  aria-hidden={title ? undefined : "true"}
  aria-label={title || undefined}
>
  <circle cx="16" cy="16" r="15" fill="var(--signal, #f8c400)" />
  <path d="M16 16 L16 1 A15 15 0 0 0 1 16 Z" fill="var(--logo-ink, #141414)" />
  <path
    d="M16 16 L16 31 A15 15 0 0 0 31 16 Z"
    fill="var(--logo-ink, #141414)"
  />
  <circle
    cx="16"
    cy="16"
    r="15"
    fill="none"
    stroke="var(--logo-ink, #141414)"
    stroke-width="1.5"
  />
</svg>

<style>
  .mark {
    display: inline-block;
    flex: none;
  }
</style>
