<script lang="ts">
  import { onMount, tick } from "svelte"
  import { page } from "$app/stores"
  import { afterNavigate, onNavigate } from "$app/navigation"
  import { variables } from "$lib/variables"
  import { site } from "$lib/seo"
  import { theme } from "$lib/theme.store"
  import Mark from "$lib/brand/Mark.svelte"
  import "./layout.css"

  let { children } = $props()

  const path = $derived($page.url.pathname)
  const year = new Date().getFullYear()

  onMount(() => {
    if (!variables.gtag_id) return
    const script = document.createElement("script")
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${variables.gtag_id}`
    document.head.appendChild(script)
    // page views are sent from afterNavigate (including the first load)
    gtag("config", variables.gtag_id, { send_page_view: false })
  })

  onNavigate((navigation) => {
    if (!document.startViewTransition) return
    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve()
        await navigation.complete
      })
    })
  })

  afterNavigate(({ to }) => {
    if (variables.gtag_id && typeof gtag === "function" && to) {
      gtag("event", "page_view", {
        page_title: document.title,
        page_location: location.href,
        page_path: to.url.pathname,
      })
    }
  })

  function toggleTheme(event: MouseEvent) {
    const newTheme = $theme === "dark" ? "light" : "dark"
    try {
      localStorage.setItem("theme-chosen", "1")
    } catch {
      // storage blocked: theme still switches for this visit
    }
    const animate =
      document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!animate) {
      theme.set(newTheme)
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )
    const transition = document.startViewTransition(async () => {
      theme.set(newTheme)
      await tick()
    })
    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        { clipPath: newTheme === "dark" ? [...clipPath].reverse() : clipPath },
        {
          duration: 400,
          easing: "ease-out",
          pseudoElement:
            newTheme === "dark"
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
        },
      )
    })
  }

  $effect(() => {
    if ($theme) document.documentElement.className = $theme
  })
</script>

<a class="skip-to-content" href="#main-content">Skip to main content</a>

<header class="site-header">
  <div class="container bar">
    <a class="brand" href="/" aria-label="Crashnaut home">
      <Mark size={26} />
      <span class="wordmark">crashnaut</span>
    </a>

    <nav aria-label="Main">
      <a
        href="/blog"
        aria-current={path.startsWith("/blog") ? "page" : undefined}>Blog</a
      >
      <a
        href="/contact"
        aria-current={path.startsWith("/contact") ? "page" : undefined}
        >Work with me</a
      >
      <button
        type="button"
        class="theme-switch"
        aria-label={$theme === "dark"
          ? "Switch to light theme"
          : "Switch to dark theme"}
        title={$theme === "dark" ? "Light theme" : "Dark theme"}
        onclick={toggleTheme}
      >
        {#if $theme === "dark"}
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
            ><circle cx="12" cy="12" r="4.5" fill="currentColor" /><path
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            /></svg
          >
        {:else}
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
            ><path
              d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
              fill="currentColor"
            /></svg
          >
        {/if}
      </button>
    </nav>
  </div>
  <div class="hazard" aria-hidden="true"></div>
</header>

<main id="main-content">
  {@render children?.()}
</main>

<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand" href="/">
        <Mark size={22} />
        <span class="wordmark">crashnaut</span>
      </a>
      <p>
        Test automation and CI/CD for FinTech teams. Written by Mike Sell,
        senior SDET contractor.
      </p>
    </div>

    <nav class="footer-links" aria-label="Footer">
      <a href="/blog">Blog</a>
      <a href="/contact">Work with me</a>
      <a href="/blog/rss.xml">RSS</a>
      <a href={site.github} rel="external">GitHub</a>
      <a href={site.linkedin} rel="external">LinkedIn</a>
    </nav>

    <div class="telemetry build">
      <span class="status-dot" aria-hidden="true"></span>
      build
      {#if variables.hash}
        <a
          href="https://github.com/crashnaut/crashnaut.com/commit/{variables.hash}"
          rel="external">{variables.hash.substring(0, 7)}</a
        >
      {:else}
        local
      {/if}
      · {variables.timestamp.toISOString().slice(0, 10)}
    </div>
  </div>
  <p class="container legal">
    © {year}
    {site.author}. Professional services through {site.legalEntity.name},
    registered in Ireland.
  </p>
</footer>

<style>
  .site-header {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 20;
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(10px) saturate(140%);
  }

  .bar {
    height: calc(var(--header-height) - 6px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
  }

  .wordmark {
    font-family: var(--head-font);
    font-weight: 850;
    font-size: 1.2rem;
    letter-spacing: -0.03em;
    font-variation-settings: "wdth" 125;
    line-height: 1;
  }

  nav {
    display: flex;
    align-items: center;
    gap: clamp(0.75rem, 3vw, 1.75rem);
    font-family: var(--head-font);
    font-weight: 600;
    font-size: 0.95rem;
  }

  nav a {
    color: var(--ink-2);
    padding-block: 0.25rem;
    border-bottom: 2px solid transparent;
    transition:
      color 0.15s,
      border-color 0.15s;
  }

  nav a:hover,
  nav a[aria-current="page"] {
    color: var(--ink);
    border-bottom-color: var(--signal);
  }

  .theme-switch {
    display: grid;
    place-items: center;
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 50%;
    color: var(--ink-2);
    border: 1px solid var(--line);
  }

  .theme-switch:hover {
    color: var(--ink);
    border-color: var(--ink-3);
  }

  .site-footer {
    margin-top: 5rem;
    border-top: 1px solid var(--line);
    background: var(--surface);
    padding-block: 2.5rem 1.5rem;
    font-size: 0.92rem;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr auto;
    gap: 2rem;
    align-items: start;
  }

  .footer-brand p {
    margin-top: 0.75rem;
    color: var(--ink-2);
    max-width: 38ch;
    line-height: 1.55;
  }

  .footer-links {
    flex-wrap: wrap;
    gap: 0.4rem 1.25rem;
    font-size: 0.92rem;
  }

  .build {
    display: flex;
    align-items: center;
    gap: 0.45em;
    white-space: nowrap;
  }

  .build a {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--line);
  }

  .legal {
    margin-top: 2rem;
    color: var(--ink-3);
    font-size: 0.8rem;
  }

  @media (max-width: 760px) {
    .footer-grid {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }
  }

  @media (max-width: 420px) {
    .wordmark {
      font-size: 1.05rem;
    }
    nav {
      font-size: 0.88rem;
    }
  }
</style>
