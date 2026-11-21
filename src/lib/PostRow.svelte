<script lang="ts">
  import Sigil from "#lib/brand/Sigil.svelte"
  import type { RibbonSegment } from "#lib/post-signals.ts"

  // run, tags and ribbon are still passed by callers; the full post page shows them.
  let {
    slug,
    title,
    description,
    date,
    readingMinutes,
    sigil,
    level = 2,
  }: {
    run?: number
    slug: string
    title: string
    description: string
    date: string
    tags?: string[]
    readingMinutes: number
    sigil: string
    ribbon?: RibbonSegment[]
    ribbonLabel?: string
    /** 2 on the blog index (under the h1), 3 under a section h2 */
    level?: 2 | 3
  } = $props()
</script>

<li class="row">
  <Sigil svg={sigil} size={30} />
  <a href={`/blog/${slug}`} class="hit">
    <svelte:element this={`h${level}`} class="title">{title}</svelte:element>
    <p class="desc">{description}</p>
    <p class="meta">
      <span>{date}</span>
      <span>{readingMinutes} min read</span>
    </p>
  </a>
</li>

<style>
  .row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0 1rem;
    align-items: start;
    padding: 1.4rem 0;
    border-bottom: 1px solid var(--line);
  }

  /* one-colour sigil in lists: yellow is reserved for the mark and the primary action */
  .row > :global(.sigil) {
    margin-top: 0.2rem;
    --signal: var(--surface-2);
    --logo-ink: var(--ink-3);
    --fail: var(--ink);
    --bg: var(--surface-2);
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
    gap: 0.25rem 1.25rem;
  }

  .title {
    font-size: var(--step-2);
    line-height: 1.12;
  }

  .hit:hover .title {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.15em;
  }

  .desc {
    color: var(--ink-2);
    max-width: 68ch;
    line-height: 1.6;
  }
</style>
