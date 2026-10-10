<script lang="ts">
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import Seo from "#lib/Seo.svelte"
  import PostRow from "#lib/PostRow.svelte"
  import ImpactMap from "#lib/ImpactMap.svelte"
  import { humanDate } from "#lib/formatters.ts"
  import { site } from "#lib/seo.ts"

  const { data } = $props()
  const { posts, tags } = $derived(data)

  let query = $state("")
  let activeTag = $state<string | null>(null)

  onMount(() => {
    const params = new URLSearchParams(location.search)
    query = params.get("q") ?? ""
    activeTag = params.get("tag")
  })

  // Plain substring matching: user input never reaches a RegExp.
  const terms = $derived(query.toLowerCase().split(/\s+/).filter(Boolean))
  const filtered = $derived(
    posts.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false
      const haystack = [p.title, p.description, ...p.tags]
        .join(" ")
        .toLowerCase()
      return terms.every((t) => haystack.includes(t))
    }),
  )

  function syncUrl() {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (activeTag) params.set("tag", activeTag)
    goto(params.size ? `?${params}` : location.pathname, {
      shallow: true,
      replace: true,
    })
  }

  function toggleTag(tag: string) {
    activeTag = activeTag === tag ? null : tag
    syncUrl()
  }
</script>

<Seo
  title="The crash log · Test automation & QA engineering blog | Crashnaut"
  description={`${posts.length} field notes on Playwright, CI/CD and testing software that moves money, by senior SDET Mike Sell.`}
  canonical={`${site.url}/blog`}
  keywords="SDET blog, Playwright, test automation, CI/CD, QA engineering, FinTech testing"
/>

<div class="container narrow page">
  <header class="head">
    <p class="telemetry">Blog · {posts.length} runs logged</p>
    <h1>The crash log</h1>
    <p class="lede">
      Field notes from breaking software on purpose: Playwright patterns, CI
      pipelines, and the testing strategy behind them.
    </p>
  </header>

  <div class="map-wrap">
    <ImpactMap map={data.map} />
  </div>

  <div class="filters">
    <label class="search">
      <span class="visually-hidden">Search posts</span>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
        ><circle
          cx="10.5"
          cy="10.5"
          r="6.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        /><path
          d="m15.5 15.5 5 5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        /></svg
      >
      <input
        type="search"
        placeholder="Search posts"
        autocomplete="off"
        bind:value={query}
        oninput={syncUrl}
      />
    </label>

    <div class="tag-filter" role="group" aria-label="Filter by tag">
      {#each tags as tag}
        <button
          type="button"
          class="tag"
          aria-pressed={activeTag === tag}
          onclick={() => toggleTag(tag)}>{tag}</button
        >
      {/each}
    </div>

    <p class="telemetry count" aria-live="polite">
      {filtered.length} of {posts.length} posts
    </p>
  </div>

  {#if filtered.length}
    <ul class="post-list">
      {#each filtered as post (post.slug)}
        <PostRow {...post} date={humanDate(post.date)} />
      {/each}
    </ul>
  {:else}
    <p class="empty">
      No posts match that. <button
        type="button"
        class="link"
        onclick={() => {
          query = ""
          activeTag = null
          syncUrl()
        }}>Clear filters</button
      >
    </p>
  {/if}
</div>

<style>
  .page {
    padding-top: clamp(2.5rem, 6vw, 4.5rem);
  }

  .head > * + * {
    margin-top: 0.75rem;
  }

  h1 {
    font-size: clamp(2.2rem, 1.5rem + 3vw, 3.4rem);
    letter-spacing: -0.03em;
  }

  .lede {
    color: var(--ink-2);
    font-size: 1.1rem;
    max-width: 55ch;
  }

  .map-wrap {
    margin-top: 2.5rem;
  }

  .filters {
    margin-block: 2rem 1rem;
  }

  .filters > * + * {
    margin-top: 0.9rem;
  }

  .search {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.7rem 0.9rem;
    border: 2px solid var(--ink);
    border-radius: var(--radius);
    background: var(--surface);
    color: var(--ink-3);
  }

  .search:focus-within {
    box-shadow: 4px 4px 0 var(--signal);
  }

  .search input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 1rem;
    color: var(--ink);
  }

  .tag-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .tag-filter .tag {
    cursor: pointer;
  }

  .tag-filter .tag:hover {
    border-color: var(--ink-3);
    color: var(--ink);
  }

  .tag-filter .tag[aria-pressed="true"] {
    background: var(--signal);
    border-color: #141414;
    color: #141414;
  }

  .count {
    text-align: right;
  }

  .post-list {
    list-style: none;
    border-top: 2px solid var(--ink);
  }

  .empty {
    padding-block: 2rem;
    color: var(--ink-2);
  }
</style>
