<script lang="ts">
  import Seo from "$lib/Seo.svelte"
  import { personJsonLd, site, websiteJsonLd } from "$lib/seo"
  import confetti from "canvas-confetti"
  import Socials from "$lib/Socials.svelte"

  let lastConfetti = 0
  function fireConfetti(evt: MouseEvent | FocusEvent): void {
    if (evt instanceof FocusEvent) {
      return
    }
    if (lastConfetti + 1_111 > Date.now()) return

    lastConfetti = Date.now()

    const defaults = {
      disableForReducedMotion: true,
      origin: {
        x: evt.x / window.innerWidth,
        y: (evt.y - 1) / window.innerHeight,
      },
    }
    confetti({
      ...defaults,
      spread: 26,
      startVelocity: 55,
      particleCount: Math.floor(200 * 0.25),
    })
    confetti({
      ...defaults,
      spread: 60,
      particleCount: Math.floor(200 * 0.2),
    })
    confetti({
      ...defaults,
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      particleCount: Math.floor(200 * 0.35),
    })
    confetti({
      ...defaults,
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      particleCount: Math.floor(200 * 0.1),
    })
    confetti({
      ...defaults,
      spread: 120,
      startVelocity: 45,
      particleCount: Math.floor(200 * 0.1),
    })
  }
</script>

<Seo
  title="Mike Sell - Senior SDET Contractor"
  description="Mike Sell helps FinTech companies ship reliable software faster through test automation and CI/CD pipeline design."
  canonical={site.url}
  keywords="QA, SDET, Test Automation, Playwright, DevOps, CI/CD, Nix, Testing, Mike Sell, Crashnaut"
  schema={[personJsonLd(), websiteJsonLd()]}
/>

<section>
  <h1>
    Hi, I'm Mike
    <button
      type="button"
      class="wave"
      aria-label="Celebrate"
      onclick={fireConfetti}
    >
      👋
    </button>
  </h1>

  <p>
    I help FinTech companies ship reliable software faster through test
    automation and CI/CD pipeline design.
  </p>

  <p>As a Senior SDET Contractor, I specialize in:</p>
  <ul>
    <li>
      <strong>Test Automation Architecture</strong> (Playwright, Cypress, BDD)
    </li>
    <li>
      <strong>CI/CD Pipeline Integration</strong> (GitHub Actions, Docker, AWS)
    </li>
    <li>
      <strong>Financial Systems Testing</strong> (payments, compliance, data integrity)
    </li>
  </ul>

  <p>
    I build automated testing systems that catch bugs before production,
    accelerating deployment cycles.
  </p>

  <section class="services" aria-labelledby="portfolio-heading">
    <h2 id="portfolio-heading">Selected work</h2>
    <div class="service-grid">
      <article class="service-item">
        <h3>Playwright boilerplate</h3>
        <p>
          Opinionated Playwright + POM + BDD starter used as a teaching baseline
          for teams adopting browser automation.
        </p>
        <a
          class="mark-hover"
          href="https://github.com/crashnaut/playwright-pom-boilerplate"
          rel="external">View on GitHub</a
        >
      </article>
      <article class="service-item">
        <h3>Writing</h3>
        <p>
          Long-form notes on SDET practice: CI, flags, flaky tests, and how
          teams actually ship quality.
        </p>
        <a class="mark-hover" href="/blog">Read the blog</a>
      </article>
      <article class="service-item">
        <h3>Contracting</h3>
        <p>
          FinTech-focused SDET engagements: automation architecture, pipelines,
          and hands-on delivery.
        </p>
        <a
          class="mark-hover"
          href="https://calendly.com/mikesell404"
          rel="external">Schedule a call</a
        >
      </article>
    </div>
  </section>

  <div class="cta-section">
    <a
      href="https://calendly.com/mikesell404"
      class="cta-secondary"
      rel="external">Schedule a Call</a
    >
  </div>

  <p>
    <Socials />
  </p>
</section>

<style>
  section {
    font-size: 1.25rem;
    margin-top: 2em;
  }

  h1 .wave {
    display: inline;
    cursor: pointer;
    border: none;
    background: none;
    font: inherit;
    padding: 0;
    line-height: inherit;
    vertical-align: baseline;
  }

  .services {
    margin: var(--spacing-large) 0;
  }

  .services h2 {
    margin-bottom: var(--spacing);
  }

  .service-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing);
    margin-top: var(--spacing);
  }

  .service-item {
    padding: var(--spacing);
    border: 1px solid var(--text-color-subtle);
    border-radius: 4px;
    background-color: var(--background-color-subtle);
  }

  .service-item h3 {
    margin: 0 0 var(--spacing-half) 0;
    font-size: 1.1rem;
  }

  .service-item p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-color-subtle);
  }

  .cta-section {
    margin: var(--spacing-large) 0;
    display: flex;
    gap: var(--spacing);
    flex-wrap: wrap;
  }

  .cta-secondary {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    transition: all 0.2s ease-in-out;
    border: 1px solid var(--text-color);
    color: var(--text-color);
  }

  .cta-secondary:hover {
    background-color: var(--text-color);
    color: var(--background-color);
  }
</style>
