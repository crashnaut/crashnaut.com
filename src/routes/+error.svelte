<script lang="ts">
  import { page } from "$app/state"
  import Seo from "#lib/Seo.svelte"

  const notFound = $derived(page.status === 404)
</script>

<Seo
  title={notFound
    ? "404 · Page not found | Crashnaut"
    : "Something broke | Crashnaut"}
  description="The page you requested could not be loaded."
  robots="noindex"
/>

<div class="wall">
  <div class="container page">
    <p class="meta">Error {page.status}</p>
    <h1>
      {notFound ? "This page didn’t survive impact." : "Something broke."}
    </h1>
    <p>
      {notFound
        ? `Nothing lives at ${page.url.pathname}. It may have moved, or the link has a typo.`
        : (page.error?.message ?? "The page could not be loaded.")}
    </p>
    <p>
      Try the <a class="link" href="/">home page</a> or browse the
      <a class="link" href="/blog">blog</a>.
    </p>
  </div>
</div>

<style>
  .page {
    padding-block: clamp(3rem, 8vw, 6rem);
  }

  .page > * + * {
    margin-top: 1.25rem;
  }

  h1 {
    font-size: var(--step-4);
    line-height: 1;
  }

  p {
    max-width: 52ch;
    overflow-wrap: anywhere;
  }
</style>
