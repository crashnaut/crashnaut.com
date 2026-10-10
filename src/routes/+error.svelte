<script lang="ts">
  import { page } from "$app/stores"
  import Seo from "$lib/Seo.svelte"

  const notFound = $derived($page.status === 404)
</script>

<Seo
  title={notFound
    ? "404 · Page not found | Crashnaut"
    : "Something broke | Crashnaut"}
  description="The page you requested could not be loaded."
  robots="noindex"
/>

<div class="container narrow page">
  <p class="telemetry">
    <span class="dot" aria-hidden="true"></span>
    Test failed · status {$page.status}
  </p>
  <h1>{notFound ? "This page didn't survive impact." : "Something broke."}</h1>
  <pre><code
      >expect(page).toHaveURL(<span class="s">"{$page.url.pathname}"</span>)
<span class="f"
        >✕ {notFound
          ? "Received: 404 Not Found"
          : `Received: ${$page.status} ${$page.error?.message ?? ""}`}</span
      ></code
    ></pre>
  <p>
    Try the <a class="link" href="/">home page</a> or browse the
    <a class="link" href="/blog">crash log</a>.
  </p>
</div>

<style>
  .page {
    padding-top: clamp(3rem, 8vw, 6rem);
  }

  .page > * + * {
    margin-top: 1.25rem;
  }

  h1 {
    font-size: clamp(2rem, 1.4rem + 3vw, 3rem);
  }

  .dot {
    display: inline-block;
    width: 0.55em;
    height: 0.55em;
    border-radius: 50%;
    background: var(--fail);
    margin-right: 0.3em;
  }

  pre {
    padding: 1rem 1.2rem;
  }

  pre code {
    white-space: pre-wrap;
  }

  .s {
    color: var(--pass);
  }

  .f {
    color: var(--fail);
  }
</style>
