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

  const showUpdated = $derived(meta.modified && meta.modified !== meta.date)
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
  <div class="container post-grid" class:has-toc={meta.toc.length > 2}>
    <header class="post-head">
      <p class="telemetry crumbs">
        <a href="/blog">← Crash log</a>
        <span aria-hidden="true">/</span>
        <b>Run {String(data.run).padStart(3, "0")}</b>
        <span class="status-dot" aria-hidden="true"></span>
      </p>

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
          <p class="telemetry">
            <time datetime={meta.publishedAt}>{humanDate(meta.date)}</time>
            {#if showUpdated}
              · updated <time datetime={meta.modifiedAt}
                >{humanDate(meta.modified)}</time
              >
            {/if}
            · {meta.readingMinutes} min read
          </p>
        </div>
      </div>

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
            onclick={() => setMode("tldr")}>TL;DR · just the code</button
          >
        </div>
      {/if}
    </header>
  </div>

  <div
    class="container post-grid post-body"
    class:has-toc={meta.toc.length > 2}
  >
    <div class="prose" bind:this={prose}>
      {#if tldr()}
        {@html post.tldr}
      {:else}
        {@html post.html}
      {/if}
    </div>

    {#if meta.toc.length > 2}
      <aside class="toc" aria-label="On this page" hidden={tldr()}>
        <p class="telemetry">On this page</p>
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

  <footer class="container narrow post-foot">
    <WorkWithMe />

    {#if data.related.length}
      <section aria-labelledby="related-title" class="related">
        <p class="telemetry" id="related-title">Keep reading</p>
        <ul>
          {#each data.related as r}
            <li>
              <a href={`/blog/${r.slug}`}>
                <span class="title">{r.title}</span>
                <span class="telemetry">{humanDate(r.date)}</span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <div class="share-row">
      <Share text={meta.title} url={meta.canonical} />
      <a class="telemetry edit" href={meta.edit} rel="external"
        >Suggest an edit on GitHub</a
      >
    </div>

    <Comments />
  </footer>
</article>

<style>
  .post-head {
    max-width: var(--measure);
    margin-inline: auto;
    width: 100%;
    padding-top: clamp(2.5rem, 6vw, 4.5rem);
    padding-bottom: 2rem;
  }

  .post-head > * + * {
    margin-top: 1rem;
  }

  .crumbs {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .crumbs a:hover {
    color: var(--ink);
  }

  h1 {
    font-size: clamp(2rem, 1.3rem + 3vw, 3.25rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .deck {
    font-size: clamp(1.08rem, 1rem + 0.4vw, 1.25rem);
    color: var(--ink-2);
    line-height: 1.55;
    max-width: 60ch;
  }

  .byline {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-top: 0.5rem;
  }

  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid var(--signal);
    object-fit: cover;
  }

  .author {
    font-weight: 600;
    line-height: 1.3;
  }

  .tags {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tags .tag:hover {
    border-color: var(--ink-3);
    color: var(--ink);
  }

  .mode {
    display: inline-flex;
    border: 2px solid var(--ink);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .mode button {
    padding: 0.45rem 0.9rem;
    font-family: var(--head-font);
    font-weight: 600;
    font-size: 0.88rem;
    color: var(--ink-2);
  }

  .mode button + button {
    border-left: 2px solid var(--ink);
  }

  .mode button[aria-pressed="true"] {
    background: var(--signal);
    color: #141414;
  }

  .post-body {
    padding-top: 0.5rem;
  }

  /* header and body share one grid so the title lines up with the text */
  .post-grid.has-toc {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 15rem;
    gap: 3rem;
  }

  .toc {
    position: sticky;
    top: calc(var(--header-height) + 1.5rem);
    align-self: start;
    max-height: calc(100dvh - var(--header-height) - 3rem);
    overflow: auto;
    padding-top: 1rem;
    font-size: 0.88rem;
  }

  .toc ol {
    list-style: none;
    margin-top: 0.75rem;
    border-left: 2px solid var(--line);
  }

  .toc li a {
    display: block;
    padding: 0.3rem 0 0.3rem 0.85rem;
    margin-left: -2px;
    border-left: 2px solid transparent;
    color: var(--ink-3);
    line-height: 1.35;
    transition:
      color 0.15s,
      border-color 0.15s;
  }

  .toc li.sub a {
    padding-left: 1.6rem;
    font-size: 0.82rem;
  }

  .toc li a:hover {
    color: var(--ink);
  }

  .toc li.active a {
    color: var(--ink);
    font-weight: 600;
    border-left-color: var(--signal);
  }

  .post-foot {
    padding-top: 3.5rem;
  }

  .post-foot > :global(* + *) {
    margin-top: 2.5rem;
  }

  .related ul {
    list-style: none;
    margin-top: 0.75rem;
    border-top: 2px solid var(--ink);
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
  }

  .related a:hover .title {
    text-decoration: underline;
    text-decoration-color: var(--signal);
    text-decoration-thickness: 3px;
    text-underline-offset: 4px;
  }

  .related .telemetry {
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
    .toc {
      display: none;
    }
  }
</style>
