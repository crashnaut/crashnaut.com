<script lang="ts">
  import { site } from "$lib/seo"

  type OgType = "website" | "article"

  let {
    title,
    description = site.description,
    canonical,
    image = site.defaultImage,
    type = "website",
    author = site.author,
    keywords,
    publishedTime,
    modifiedTime,
    tags = [],
    robots,
    schema,
  }: {
    title: string
    description?: string
    canonical?: string
    image?: string
    type?: OgType
    author?: string
    keywords?: string
    publishedTime?: string
    modifiedTime?: string
    tags?: string[]
    robots?: string
    schema?: Record<string, unknown> | Record<string, unknown>[]
  } = $props()

  const canonicalUrl = $derived(canonical ?? site.url)
  const schemas = $derived(
    schema ? (Array.isArray(schema) ? schema : [schema]) : [],
  )
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  {#if keywords}
    <meta name="keywords" content={keywords} />
  {/if}
  <meta name="author" content={author} />
  <link rel="canonical" href={canonicalUrl} />

  <meta property="og:site_name" content={site.name} />
  <meta property="og:locale" content={site.locale} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={image} />
  <meta property="og:image:alt" content={title} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
  <meta name="twitter:image:alt" content={title} />

  {#if type === "article"}
    {#if publishedTime}
      <meta property="article:published_time" content={publishedTime} />
    {/if}
    {#if modifiedTime}
      <meta property="article:modified_time" content={modifiedTime} />
    {/if}
    {#each tags as tag}
      <meta property="article:tag" content={tag} />
    {/each}
    <meta property="article:author" content={author} />
  {/if}

  {#if robots}
    <meta name="robots" content={robots} />
  {/if}

  {#each schemas as item}
    {@html `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</scr` +
      `ipt>`}
  {/each}
</svelte:head>
