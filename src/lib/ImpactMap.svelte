<script lang="ts">
  // Laid out at build time by impactMap() in src/lib/post-signals.ts.
  import type { ImpactMap } from "#lib/post-signals.ts"

  let { map }: { map: ImpactMap } = $props()
</script>

<section class="impact" aria-labelledby="impact-title">
  <h2 id="impact-title">Map of the crash log</h2>
  <p class="telemetry">
    {map.nodes.length} posts · {map.edges.length} internal links · grouped by first
    tag · dot size = reading time
  </p>

  <figure class="map">
    <svg
      viewBox={`0 0 ${map.size} ${map.size}`}
      role="group"
      aria-labelledby="impact-title"
    >
      {#each map.edges as edge (edge.from + edge.to)}
        <path class="edge" d={edge.d} />
      {/each}
      {#each map.groups as group (group.tag)}
        <path class="arc" d={group.arc} />
        <text
          class="group-label"
          x={group.labelX}
          y={group.labelY}
          text-anchor={group.anchor}
          dominant-baseline="central"
          transform={`rotate(${group.rotate} ${group.labelX} ${group.labelY})`}
          >{group.tag}</text
        >
      {/each}
      {#each map.nodes as node (node.slug)}
        <a href={`/blog/${node.slug}`} aria-label={node.title}>
          <circle class="node" cx={node.x} cy={node.y} r={node.r} />
          <text
            class="node-label"
            x={node.labelX}
            y={node.labelY}
            text-anchor={node.anchor}
            dominant-baseline="central"
            transform={`rotate(${node.rotate} ${node.labelX} ${node.labelY})`}
            >{node.label}</text
          >
        </a>
      {/each}
    </svg>
    <figcaption>
      Each dot is a post; lines are links between posts. Bigger dots take longer
      to read.
    </figcaption>
  </figure>
</section>

<style>
  .impact > * + * {
    margin-top: 0.75rem;
  }

  h2 {
    font-size: clamp(1.4rem, 1.1rem + 1vw, 1.8rem);
  }

  .map {
    margin-inline: 0;
    padding: 1rem;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
  }

  .map svg {
    display: block;
    width: 100%;
    max-width: 660px;
    height: auto;
    margin-inline: auto;
  }

  .edge {
    fill: none;
    stroke: var(--ink-3);
    stroke-width: 1.25;
    opacity: 0.55;
  }

  .arc {
    fill: none;
    stroke: var(--signal);
    stroke-width: 4;
    stroke-linecap: round;
  }

  .group-label {
    fill: var(--signal-text);
    font-family: var(--mono-font);
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .node {
    fill: var(--signal);
    stroke: var(--logo-ink);
    stroke-width: 1.5;
  }

  .node-label {
    fill: var(--ink);
    font-family: var(--text-font);
    font-size: 11px;
  }

  a:hover .node,
  a:focus-visible .node {
    fill: var(--fail);
  }

  a:hover .node-label,
  a:focus-visible .node-label {
    text-decoration: underline;
  }

  figcaption {
    color: var(--ink-3);
    font-size: 0.85rem;
    font-style: italic;
    text-align: center;
    margin-top: 0.5rem;
  }

  /* labels shrink to ~5px on phones, and the post list above covers the same ground */
  @media (max-width: 600px) {
    .impact {
      display: none;
    }
  }
</style>
