<script lang="ts">
  // The coverage dial from blog/coverage-is-a-health-signal, shrunk: the needle
  // reads minutes on a 0–20 scale. Geometry comes from post-signals.ts.
  import { GAUGE, type GaugeNeedle } from "#lib/post-signals.ts"

  let { minutes, needle }: { minutes: number; needle: GaugeNeedle } = $props()
  const [cx, cy] = GAUGE.centre
</script>

<svg
  class="gauge"
  viewBox={GAUGE.viewBox}
  width="60"
  height="33"
  role="img"
  aria-label={`${minutes} minute read`}
>
  <path class="band" d={GAUGE.band} />
  <path class="fill" d={needle.fill} />
  <path class="needle" d={`M${cx},${cy} L${needle.x},${needle.y}`} />
  <circle class="hub" {cx} {cy} r="12" />
</svg>

<style>
  .gauge {
    flex: none;
    overflow: visible;
  }

  .band {
    fill: var(--surface-2);
    stroke: var(--ink-3);
    stroke-width: 1.25px;
    vector-effect: non-scaling-stroke;
  }

  .fill {
    fill: var(--signal);
    stroke: var(--ink-3);
    stroke-width: 1.25px;
    vector-effect: non-scaling-stroke;
  }

  .needle {
    stroke: var(--ink);
    stroke-width: 2.5px;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }

  .hub {
    fill: var(--surface);
    stroke: var(--ink);
    stroke-width: 1.5px;
    vector-effect: non-scaling-stroke;
  }
</style>
