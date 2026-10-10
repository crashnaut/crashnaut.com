<script lang="ts">
  import Sigil from "#lib/brand/Sigil.svelte"
  import PostRibbon from "#lib/PostRibbon.svelte"
  import type { RibbonSegment } from "#lib/post-signals.ts"

  let {
    run,
    slug,
    title,
    description,
    date,
    tags = [],
    readingMinutes,
    sigil,
    ribbon,
    ribbonLabel,
  }: {
    run: number
    slug: string
    title: string
    description: string
    date: string
    tags?: string[]
    readingMinutes: number
    sigil: string
    ribbon: RibbonSegment[]
    ribbonLabel: string
  } = $props()
</script>

<li class="row">
  <Sigil svg={sigil} size={30} />
  <div class="body">
    <a href={`/blog/${slug}`} class="hit">
      <p class="telemetry meta">
        <span class="status-dot" aria-hidden="true"></span>
        <b>Run {String(run).padStart(3, "0")}</b>
        <span>{date}</span>
        <span>{readingMinutes} min read</span>
      </p>
      <h3>{title}</h3>
      <p class="desc">{description}</p>
    </a>
    <PostRibbon segments={ribbon} label={ribbonLabel} />
    {#if tags.length}
      <ul class="tags" aria-label="Tags">
        {#each tags.slice(0, 4) as tag}
          <li class="tag">{tag}</li>
        {/each}
      </ul>
    {/if}
  </div>
</li>

<style>
  .row {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0 0.9rem;
    align-items: start;
    padding: 1.25rem 0 1.35rem;
    border-bottom: 1px solid var(--line);
  }

  .row > :global(.sigil) {
    margin-top: 0.1rem;
  }

  .body > :global(* + *) {
    margin-top: 0.75rem;
  }

  .hit {
    display: block;
  }

  .hit > * + * {
    margin-top: 0.4rem;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem 0.9rem;
  }

  h3 {
    font-size: clamp(1.15rem, 1rem + 0.6vw, 1.4rem);
    transition: color 0.15s;
  }

  .hit:hover h3 {
    text-decoration: underline;
    text-decoration-color: var(--signal);
    text-decoration-thickness: 3px;
    text-underline-offset: 4px;
  }

  .desc {
    color: var(--ink-2);
    max-width: 75ch;
    line-height: 1.6;
  }

  .tags {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
</style>
