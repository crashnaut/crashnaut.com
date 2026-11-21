<script lang="ts">
  import { onMount, tick } from "svelte"
  import { page } from "$app/state"
  import { afterNavigate, onNavigate } from "$app/navigation"
  import { variables } from "#lib/variables.ts"
  import { site } from "#lib/seo.ts"
  import { theme } from "#lib/theme.store.ts"
  import Mark from "#lib/brand/Mark.svelte"
  import "./layout.css"
  // Preload the two faces visible above the fold on every page.
  import displayFont from "@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2?url"
  import textFont from "@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2?url"

  let { children } = $props()

  const path = $derived(page.url.pathname)
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

  // Shallow navigations (search/tag filters updating the URL) neither animate
  // nor count as page views.
  onNavigate((navigation) => {
    if (navigation.shallow || !document.startViewTransition) return
    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve()
        await navigation.complete
      })
    })
  })

  afterNavigate(({ to, shallow }) => {
    if (variables.gtag_id && typeof gtag === "function" && to && !shallow) {
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
      typeof document.startViewTransition === "function" &&
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
          // Hold the end state: going to dark, the old (light) snapshot shrinks
          // to nothing, and without this it snaps back to full size for one
          // frame before the transition is torn down.
          fill: "forwards",
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

<svelte:head>
  <link
    rel="preload"
    as="font"
    type="font/woff2"
    href={displayFont}
    crossorigin="anonymous"
  />
  <link
    rel="preload"
    as="font"
    type="font/woff2"
    href={textFont}
    crossorigin="anonymous"
  />
</svelte:head>

<a class="skip-to-content" href="#main-content">Skip to main content</a>

<header class="site-header">
  <div class="container bar">
    <a class="brand" href="/" aria-label="Crashnaut home">
      <Mark size={26} />
      <span class="wordmark" translate="no">Crashnaut</span>
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
</header>

<main id="main-content">
  {@render children?.()}
</main>

<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand" href="/">
        <Mark size={22} />
        <span class="wordmark" translate="no">Crashnaut</span>
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

    <p class="meta build">
      Built
      <time datetime={variables.timestamp.toISOString()}
        >{variables.timestamp.toISOString().slice(0, 10)}</time
      >
      from
      {#if variables.hash}
        <a
          href="https://github.com/crashnaut/crashnaut.com/commit/{variables.hash}"
          rel="external">{variables.hash.substring(0, 7)}</a
        >
      {:else}
        a local build
      {/if}
    </p>
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
    background: var(--surface);
    border-bottom: 1px solid var(--line);
  }

  .bar {
    height: calc(var(--header-height) - 1px);
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
    font-weight: 700;
    font-size: 1.45rem;
    letter-spacing: 0.01em;
    line-height: 1;
  }

  nav {
    display: flex;
    align-items: center;
    gap: clamp(0.75rem, 3vw, 1.75rem);
    font-family: var(--ui-font);
    font-weight: 600;
    font-size: 1rem;
  }

  nav a {
    color: var(--ink-2);
    white-space: nowrap;
    padding-block: 0.4rem;
    border-bottom: 3px solid transparent;
    transition:
      color 0.15s,
      border-color 0.15s;
  }

  nav a:hover,
  nav a[aria-current="page"] {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }

  .theme-switch {
    flex-shrink: 0;
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--radius);
    color: var(--ink-2);
    border: 1px solid var(--line);
  }

  .theme-switch:hover {
    color: var(--ink);
    border-color: var(--ink-3);
  }

  .site-footer {
    margin-top: 5rem;
    border-top: 3px solid var(--ink);
    background: var(--surface-2);
    font-family: var(--ui-font);
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
      font-size: 1.25rem;
    }
    nav {
      font-size: 0.88rem;
    }
  }

  /* iPhone SE width: keeps the header on one line */
  @media (max-width: 360px) {
    .bar {
      gap: 0.5rem;
    }
    .wordmark {
      font-size: 1.1rem;
    }
    .bar nav {
      gap: 0.5rem;
      font-size: 0.8rem;
    }
    .theme-switch {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
</style>
