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

<h1>Yikes. This is an awkward...</h1>
<p>
  Go to the <a class="mark" href="/">Home</a> page so we can quickly forget
  about this, or search for articles on the
  <a class="mark" href="/blog">Blog</a> page.
</p>
