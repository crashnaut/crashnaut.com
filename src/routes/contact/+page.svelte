<script lang="ts">
  import Seo from "$lib/Seo.svelte"
  import { site } from "$lib/seo"
</script>

<Seo
  title="Contact Me - Mike Sell"
  description="Get in touch with Mike Sell for SDET, test automation, and QA consulting opportunities."
  canonical={`${site.url}/contact`}
/>

<section>
  <h1>Contact Me</h1>

  <p>
    I'm always interested in connecting with fellow professionals in the SDET
    and test automation space. Whether you have questions about my work, want to
    discuss potential opportunities, or just want to chat about testing
    strategies, I'd love to hear from you.
  </p>

  <div class="contact-methods">
    <div class="contact-method">
      <h2>Schedule a Call</h2>
      <p>
        Ready to discuss your project? Book a free consultation call to discuss
        your testing needs and how I can help.
      </p>
      <a
        href="https://calendly.com/mikesell404"
        class="cta-secondary mark-hover"
        rel="external"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M15.6947 13.7H15.7037M15.6947 16.7H15.7037M11.9955 13.7H12.0045M11.9955 16.7H12.0045M8.29431 13.7H8.30329M8.29431 16.7H8.30329"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Book a Call
      </a>
    </div>
  </div>

  <p>
    Available for <strong>direct contracting</strong>. I work remotely from
    Brazil, while maintaining US market standards and timezone compatibility.
  </p>
</section>

<style>
  section {
    margin-top: 2em;
  }

  .contact-methods {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-large);
    margin: var(--spacing-large) 0;
  }

  .contact-method {
    padding: var(--spacing);
    border: 1px solid var(--text-color-subtle);
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .contact-method:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--accent-color);
  }

  .contact-method h2 {
    margin-top: 0;
    margin-bottom: var(--spacing-half);
  }

  .contact-method p {
    margin-bottom: var(--spacing);
    color: var(--text-color-light);
  }

  @media (max-width: 768px) {
    .contact-methods {
      grid-template-columns: 1fr;
    }
  }
</style>
