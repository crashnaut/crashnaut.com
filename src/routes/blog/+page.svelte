<script lang="ts">
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import Seo from "#lib/Seo.svelte"
  import PostRow from "#lib/PostRow.svelte"
  import ImpactMap from "#lib/ImpactMap.svelte"
  import { humanDate } from "#lib/formatters.ts"
  import { site } from "#lib/seo.ts"

  const { data } = $props()
  const { posts } = $derived(data)

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

  // Topics: every tag with its post count, most-used first.
  const topics = $derived(
    [
      ...posts
        .flatMap((p) => p.tags)
        .reduce(
          (m, t) => m.set(t, (m.get(t) ?? 0) + 1),
          new Map<string, number>(),
        ),
    ].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  )

  const TOP_TOPICS = 8
  let allTopics = $state(false)
  const shownTopics = $derived(
    allTopics
      ? topics
      : topics.filter(
          ([tag], i) => i < TOP_TOPICS || tag === activeTag,
        ),
  )

  function pickTag(tag: string) {
    activeTag = activeTag === tag ? null : tag
    syncUrl()
  }

  function clearTag() {
    activeTag = null
    syncUrl()
  }
</script>

<Seo
  title="The crash log · Test automation & QA engineering blog | Crashnaut"
  description={`${posts.length} field notes on Playwright, CI/CD and testing software that moves money, by senior SDET Mike Sell.`}
  canonical={`${site.url}/blog`}
  keywords="SDET blog, Playwright, test automation, CI/CD, QA engineering, FinTech testing"
/>

<header class="wall">
  <div class="container grid head">
    <div class="main">
      <h1>The crash log</h1>
      <p class="lede">
        Field notes from breaking software on purpose: Playwright patterns, CI
        pipelines, and the testing strategy behind them.
      </p>
    </div>
  </div>
</header>

<div class="container grid page">
  <nav class="topics" aria-labelledby="topics-title">
    <h2 id="topics-title">Topics</h2>
    <ul>
      {#each shownTopics as [tag, count] (tag)}
        <li>
          <button
            type="button"
            aria-pressed={activeTag === tag}
            onclick={() => pickTag(tag)}
          >
            <span>{tag}</span>
            <span class="n">{count}</span>
          </button>
        </li>
      {/each}
    </ul>
    {#if topics.length > TOP_TOPICS}
      <button
        type="button"
        class="link more-topics"
        aria-expanded={allTopics}
        onclick={() => (allTopics = !allTopics)}
        >{allTopics ? "Show fewer topics" : `Show all ${topics.length} topics`}</button
      >
    {/if}
  </nav>

  <div class="main">
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
          name="q"
          placeholder="Search posts…"
          autocomplete="off"
          bind:value={query}
          oninput={syncUrl}
        />
      </label>

      <p class="meta count" aria-live="polite">
        {filtered.length} of {posts.length} posts
        {#if activeTag}
          tagged {activeTag}.
          <button type="button" class="link" onclick={clearTag}>Show all</button
          >
        {/if}
      </p>
    </div>

    <h2 class="visually-hidden">Posts</h2>
    {#if filtered.length}
      <ul class="post-list">
        {#each filtered as post (post.slug)}
          <PostRow {...post} date={humanDate(post.date)} level={3} />
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

    <div class="map-wrap">
      <ImpactMap map={data.map} />
    </div>
  </div>

</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 0 1.5rem;
  }

  .main {
    grid-column: 1 / span 8;
    grid-row: 1;
    min-width: 0;
  }

  .head {
    padding-block: clamp(2.5rem, 6vw, 4.5rem) clamp(2rem, 4vw, 3rem);
  }

  .head .main > * + * {
    margin-top: 0.75rem;
  }

  h1 {
    font-size: var(--step-4);
    line-height: 1;
  }

  .lede {
    color: var(--ink-2);
    font-size: var(--step-1);
    line-height: 1.5;
    max-width: 52ch;
  }

  .page {
    padding-top: 2rem;
  }

  .filters > * + * {
    margin-top: 0.9rem;
  }

  .search {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 48px;
    padding: 0.5rem 0.9rem;
    border: 2px solid var(--ink);
    border-radius: var(--radius);
    background: var(--surface);
    color: var(--ink-3);
  }

  .search:focus-within {
    outline: 3px solid var(--info);
    outline-offset: 2px;
  }

  :global(html.dark) .search:focus-within {
    outline-color: var(--signal);
  }

  .search input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    font-family: var(--ui-font);
    font-size: 1.0625rem;
    color: var(--ink);
  }

  .count {
    text-align: right;
  }

  .post-list {
    list-style: none;
    margin-top: 1rem;
    border-top: 3px solid var(--ink);
  }

  .empty {
    padding-block: 2rem;
    color: var(--ink-2);
  }

  .map-wrap {
    margin-top: 3.5rem;
  }

  /* first in the DOM so keyboard order matches the narrow layout, where it sits on top */
  .topics {
    grid-column: 10 / -1;
    grid-row: 1;
    align-self: start;
    position: sticky;
    top: calc(var(--header-height) + 1.5rem);
    font-family: var(--ui-font);
  }

  .topics h2 {
    font-size: var(--step-2);
    padding-bottom: 0.5rem;
    border-bottom: 3px solid var(--ink);
  }

  .topics ul {
    list-style: none;
  }

  .topics ul button {
    width: 100%;
  }

  .topics ul button {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.35rem 0.5rem 0.35rem 0;
    border-bottom: 1px solid var(--line);
    font-weight: 500;
    text-align: left;
    color: var(--ink-2);
    transition: color 0.15s ease-out;
  }

  .topics ul button:hover {
    color: var(--ink);
  }

  .topics ul button[aria-pressed="true"] {
    color: var(--ink);
    font-weight: 600;
    box-shadow: inset 0 -3px 0 var(--ink);
  }

  .more-topics {
    margin-top: 0.75rem;
    min-height: 44px;
    font-weight: 600;
    color: var(--ink-2);
  }

  .topics .n {
    font-variant-numeric: tabular-nums;
    color: var(--ink-3);
  }

  @media (max-width: 960px) {
    .main,
    .topics {
      grid-column: 1 / -1;
    }
    /* on narrow screens topics sit above the list as a wrapping row */
    .main {
      grid-row: 2;
    }
    .topics {
      position: static;
      grid-row: 1;
      margin-bottom: 1.5rem;
    }
    .topics h2 {
      font-size: 1.1rem;
      border-bottom-width: 0;
      padding-bottom: 0.25rem;
    }
    .topics ul {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 1.25rem;
    }
    .topics ul button {
      width: auto;
      border-bottom: 0;
      padding-right: 0;
      gap: 0.4rem;
    }
  }
</style>
