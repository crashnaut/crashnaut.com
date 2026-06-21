<script lang="ts">
  import Seo from "$lib/Seo.svelte"
  import { site } from "$lib/seo"
</script>

<Seo
  title="Page not found - Mike Sell"
  description="The page you requested could not be found on crashnaut.com."
  canonical={site.url}
  robots="noindex"
/>

<h1>Page not found</h1>
<p>
  That URL does not match anything on this site. Try the
  <a class="mark" href="/">home</a> page or browse the
  <a class="mark" href="/blog">blog</a>.
</p>
