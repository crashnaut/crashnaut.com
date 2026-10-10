<script lang="ts">
  import { onMount } from "svelte"
  import { theme } from "./theme.store"

  let container: HTMLElement | undefined = $state()

  onMount(() => {
    // IDs from giscus.app for crashnaut/crashnaut.com, "Announcements" category
    const script = document.createElement("script")
    const attrs: Record<string, string> = {
      "data-repo": "crashnaut/crashnaut.com",
      "data-repo-id": "R_kgDOP3-hMA",
      "data-category": "Announcements",
      "data-category-id": "DIC_kwDOP3-hMM4CwkPy",
      "data-mapping": "pathname",
      "data-strict": "1",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": $theme === "dark" ? "dark" : "light",
      "data-lang": "en",
      "data-loading": "lazy",
      crossorigin: "anonymous",
    }
    for (const [k, v] of Object.entries(attrs)) script.setAttribute(k, v)
    script.async = true
    script.src = "https://giscus.app/client.js"
    container?.appendChild(script)

    return theme.subscribe((value) => {
      const frame = document.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame",
      )
      frame?.contentWindow?.postMessage(
        {
          giscus: { setConfig: { theme: value === "dark" ? "dark" : "light" } },
        },
        "https://giscus.app",
      )
    })
  })
</script>

<section class="comments" aria-label="Comments">
  <p class="telemetry">Comments · via GitHub Discussions</p>
  <div bind:this={container}></div>
</section>

<style>
  .comments > * + * {
    margin-top: 1rem;
  }
</style>
