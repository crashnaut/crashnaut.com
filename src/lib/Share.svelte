<script lang="ts">
  let { text = "", url = "" }: { text?: string; url?: string } = $props()

  let copied = $state(false)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    copied = true
    setTimeout(() => (copied = false), 1500)
  }
</script>

<div class="share" aria-label="Share this post">
  <span class="telemetry">Share</span>
  <a
    class="tag"
    target="_blank"
    rel="noreferrer"
    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
    >LinkedIn</a
  >
  <a
    class="tag"
    target="_blank"
    rel="noreferrer"
    href={`https://bsky.app/intent/compose?text=${encodeURIComponent(`${text} ${url}`)}`}
    >Bluesky</a
  >
  <button type="button" class="tag" onclick={copyLink}
    >{copied ? "Link copied" : "Copy link"}</button
  >
</div>

<style>
  .share {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .tag {
    cursor: pointer;
  }

  .tag:hover {
    border-color: var(--ink-3);
    color: var(--ink);
  }
</style>
