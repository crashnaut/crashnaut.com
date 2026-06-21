<script>
  import { site } from "$lib/seo"
  import { variables } from "$lib/variables"

  const year = new Date().getFullYear()
</script>

<div class="host">
  <div class="host-meta">
    <a
      href="https://github.com/crashnaut/crashnaut.com/commit/{variables.hash}"
      rel="noreferrer"
      target="_blank">{variables.hash?.substring(0, 6) ?? "local"}</a
    >
    hosted on
    <a href="https://firebase.google.com" rel="noreferrer" target="_blank"
      >Firebase</a
    >
    ({variables.timestamp.toISOString()})
  </div>

  <p class="host-legal">
    Professional services through {site.legalEntity.name}, registered in
    Ireland. © {year}
    {site.author}.
  </p>
</div>

<style>
  .host {
    text-align: center;
  }

  .host-meta {
    font-size: 0.85rem;
    color: var(--text-color-light);
  }

  .host-legal {
    font-size: 0.8rem;
    color: var(--text-color-light);
    margin-top: 0.75rem;
    max-width: 55ch;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.4;
  }
</style>
