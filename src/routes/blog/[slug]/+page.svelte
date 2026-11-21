<script lang="ts">
  import { onMount, tick } from "svelte"
  import { page } from "$app/state"
  import { humanDate } from "#lib/formatters.ts"
  import Seo from "#lib/Seo.svelte"
  import { blogPostingJsonLd, breadcrumbJsonLd, site } from "#lib/seo.ts"
  import Comments from "#lib/Comments.svelte"
  import Share from "#lib/Share.svelte"
  import WorkWithMe from "#lib/WorkWithMe.svelte"
  import { blog } from "#lib/current-blog.svelte.ts"
  import codeBlockLifeCycle from "#lib/code-block-lifecycle.svelte.ts"
  import copyLifeCycle from "#lib/copy-lifecycle.svelte.ts"

  const { data } = $props()
  const post = $derived(data.post)
  const meta = $derived(data.post.metadata)

  const tldr = $derived(() => blog.blog?.state === "tldr")

  // svelte-ignore state_referenced_locally
  codeBlockLifeCycle(tldr)
  copyLifeCycle()

  let activeHeading = $state<string | null>(null)
  let prose: HTMLElement | null = $state(null)

  onMount(() => {
    const wantsTldr = post.tldr && page.url.searchParams.get("tldr") === "true"
    blog.loadBlog(
      meta.title,
      wantsTldr ? "tldr" : post.tldr ? "detailed" : "single",
    )
    return () => blog.reset()
  })

  // Highlight the last section heading scrolled past in the table of contents.
  $effect(() => {
    if (!prose || tldr()) return
    const headings = [...prose.querySelectorAll<HTMLElement>("h2[id], h3[id]")]
    const update = () => {
      const line = 120
      let current: string | null = null
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h.id
        else break
      }
      activeHeading = current
    }
    update()
    addEventListener("scroll", update, { passive: true })
    return () => removeEventListener("scroll", update)
  })

  async function setMode(mode: "tldr" | "detailed") {
    if (blog.blog?.state !== mode) {
      blog.toggleTldr()
      await tick()
    }
  }

  const updatedDate = $derived(
    meta.modified && meta.modified !== meta.date ? meta.modified : null,
  )
</script>

<Seo
  title={`${meta.title} | Crashnaut`}
  description={meta.description}
  canonical={meta.canonical}
  image={meta.banner}
  type="article"
  author={meta.author}
  keywords={meta.tags.join(", ")}
  publishedTime={meta.publishedAt}
  modifiedTime={meta.modifiedAt}
  tags={meta.tags}
  schema={[
    blogPostingJsonLd({
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      image: meta.banner,
      publishedAt: meta.publishedAt,
      modifiedAt: meta.modifiedAt,
      tags: meta.tags,
    }),
    breadcrumbJsonLd([
      { name: "Home", url: site.url },
      { name: "Blog", url: `${site.url}/blog` },
      { name: meta.title, url: meta.canonical },
    ]),
  ]}
/>

<article>
  <div class="wall title-wall">
    <div class="container post-grid" class:has-toc={meta.toc.length > 2}>
      <header class="post-head">
        <p class="meta crumbs"><a href="/blog">The crash log</a></p>

        <h1>{meta.title}</h1>
        {#if meta.description}
          <p class="deck">{meta.description}</p>
        {/if}

        <div class="byline">
          <img
            class="avatar"
            src="/images/mike.webp"
            alt=""
            width="44"
            height="44"
          />
          <div>
            <p class="author">Mike Sell</p>
            <p class="meta">
              <time datetime={meta.publishedAt}>{humanDate(meta.date)}</time>
              {#if updatedDate}
                <span
                  >(updated <time datetime={meta.modifiedAt}
                    >{humanDate(updatedDate)}</time
                  >)</span
                >
              {/if}
              <span class="read">{meta.readingMinutes} min read</span>
            </p>
          </div>
        </div>

        {#if meta.tags.length || post.tldr}
          <div class="head-foot">
            {#if meta.tags.length}
              <ul class="tags" aria-label="Tags">
                {#each meta.tags as tag}
                  <li>
                    <a class="tag" href={`/blog?tag=${encodeURIComponent(tag)}`}
                      >{tag}</a
                    >
                  </li>
                {/each}
              </ul>
            {/if}

            {#if post.tldr}
              <div class="mode" role="group" aria-label="Reading mode">
                <button
                  type="button"
                  aria-pressed={!tldr()}
                  onclick={() => setMode("detailed")}>Full post</button
                >
                <button
                  type="button"
                  aria-pressed={tldr()}
                  onclick={() => setMode("tldr")}>TL;DR: just the code</button
                >
              </div>
            {/if}
          </div>
        {/if}
      </header>
    </div>
  </div>

  <div
    class="container post-grid post-body"
    class:has-toc={meta.toc.length > 2}
  >
    <div class="main-col">
      {#if meta.toc.length > 2}
        <details class="toc-inline" hidden={tldr()}>
          <summary>On this page</summary>
          <ol>
            {#each meta.toc as { slug, description, level }}
              <li class:sub={level > 2}>
                <a href={`#${slug}`}>{description}</a>
              </li>
            {/each}
          </ol>
        </details>
      {/if}

      <div class="prose" bind:this={prose}>
        {#if tldr()}
          {@html post.tldr}
        {:else}
          {@html post.html}
        {/if}
      </div>

      <footer class="post-foot">
        <WorkWithMe />

        {#if data.related.length}
          <section aria-labelledby="related-title" class="related">
            <h2 id="related-title">Keep reading</h2>
            <ul>
              {#each data.related as r}
                <li>
                  <a href={`/blog/${r.slug}`}>
                    <span class="title">{r.title}</span>
                    <span class="meta">{humanDate(r.date)}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/if}

        <div class="share-row">
          <Share url={meta.canonical} />
          <a class="meta edit" href={meta.edit} rel="external"
            >Suggest an edit on GitHub</a
          >
        </div>

        <Comments />
      </footer>
    </div>

    {#if meta.toc.length > 2}
      <aside class="toc" aria-label="On this page" hidden={tldr()}>
        <p class="meta">On this page</p>
        <ol>
          {#each meta.toc as { slug, description, level }}
            <li class:sub={level > 2} class:active={activeHeading === slug}>
              <a href={`#${slug}`}>{description}</a>
            </li>
          {/each}
        </ol>
      </aside>
    {/if}
  </div>
</article>

<style>
  /* Header and body share one left edge: the prose column (--measure, in rem). */
  .post-head,
  .main-col {
    max-width: var(--measure);
    width: 100%;
  }

  .post-head {
    padding-block: clamp(2rem, 5vw, 3.25rem) clamp(1.75rem, 4vw, 2.5rem);
  }

  .post-head > * + * {
    margin-top: 1rem;
  }

  .title-wall {
    margin-bottom: clamp(2rem, 5vw, 3rem);
  }

  .crumbs a {
    text-decoration: underline;
    text-decoration-color: var(--grid-major);
    text-underline-offset: 0.2em;
  }

  .crumbs a:hover {
    color: var(--ink);
    text-decoration-color: currentColor;
  }

  h1 {
    font-size: var(--step-4);
    line-height: 1;
  }

  .deck {
    font-size: var(--step-1);
    color: var(--ink-2);
    line-height: 1.5;
    max-width: 60ch;
  }

  .byline {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .byline .read {
    display: block;
  }

  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid var(--ink);
    object-fit: cover;
  }

  .author {
    font-family: var(--ui-font);
    font-weight: 600;
    line-height: 1.3;
  }

  .head-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem 1.5rem;
  }

  .tags {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
  }

  .mode {
    display: inline-flex;
    border: 2px solid var(--ink);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .mode button {
    min-height: 44px;
    padding: 0.45rem 1rem;
    font-family: var(--ui-font);
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--ink-2);
    background: var(--surface);
  }

  .mode button + button {
    border-left: 2px solid var(--ink);
  }

  .mode button[aria-pressed="true"] {
    background: var(--ink);
    color: var(--bg);
  }

  /* header and body share one grid so the title lines up with the text */
  .post-grid.has-toc {
    display: grid;
    grid-template-columns: minmax(0, var(--measure)) 15rem;
    justify-content: space-between;
    gap: 3rem;
  }

  .post-grid:not(.has-toc) > .post-head,
  .post-grid:not(.has-toc) > .main-col {
    margin-inline: auto;
  }

  .toc {
    position: sticky;
    top: calc(var(--header-height) + 1.5rem);
    align-self: start;
    max-height: calc(100dvh - var(--header-height) - 3rem);
    overflow: auto;
    padding-top: 0.25rem;
    font-family: var(--ui-font);
    font-size: 0.92rem;
  }

  .toc ol,
  .toc-inline ol {
    list-style: none;
    margin-top: 0.75rem;
    border-left: 2px solid var(--line);
  }

  .toc li a,
  .toc-inline li a {
    display: block;
    padding: 0.3rem 0 0.3rem 0.85rem;
    margin-left: -2px;
    border-left: 2px solid transparent;
    color: var(--ink-3);
    line-height: 1.35;
    transition:
      color 0.15s ease-out,
      border-color 0.15s ease-out;
  }

  .toc li.sub a,
  .toc-inline li.sub a {
    padding-left: 1.6rem;
    font-size: 0.85rem;
  }

  .toc li a:hover,
  .toc-inline li a:hover {
    color: var(--ink);
  }

  .toc li.active a {
    color: var(--ink);
    font-weight: 600;
    border-left-color: var(--ink);
  }

  /* below 1100px the sticky contents become a collapsed list above the text */
  .toc-inline {
    display: none;
    margin-bottom: 2rem;
    padding-block: 0.75rem;
    border-block: 1px solid var(--line);
    font-family: var(--ui-font);
  }

  .toc-inline summary {
    min-height: 44px;
    display: flex;
    align-items: center;
    font-weight: 600;
    cursor: pointer;
  }

  .toc-inline[hidden] {
    display: none !important;
  }

  .post-foot {
    padding-top: 3.5rem;
  }

  .post-foot > :global(* + *) {
    margin-top: 2.5rem;
  }

  .related h2 {
    font-size: var(--step-2);
  }

  .related ul {
    list-style: none;
    margin-top: 0.75rem;
    border-top: 3px solid var(--ink);
  }

  .related a {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--line);
  }

  .related .title {
    font-family: var(--head-font);
    font-weight: 700;
    font-size: 1.2rem;
    line-height: 1.15;
  }

  .related a:hover .title {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.15em;
  }

  .related .meta {
    white-space: nowrap;
  }

  .share-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .edit:hover {
    color: var(--ink);
  }

  @media (max-width: 1100px) {
    .post-grid.has-toc {
      display: block;
    }
    .post-head,
    .main-col {
      margin-inline: auto;
    }
    .toc {
      display: none;
    }
    .toc-inline {
      display: block;
    }
  }
</style>
