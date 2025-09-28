<script lang="ts">
	import Head from '$lib/Head.svelte';
	import Socials from '$lib/Socials.svelte';

	let meta = {
		canonical: 'https://crashnaut.com/contact',
		title: 'Contact Me - Mike Sell',
		description: 'Get in touch with Mike Sell for SDET, Test Automation, and QA consulting opportunities',
	};
</script>

<Head title="Contact Me - Mike Sell" details={true} />

<svelte:head>
	<link rel="canonical" href={meta.canonical} />

	<meta name="title" content={meta.title} />
	<meta name="description" content={meta.description} />

	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />

	<meta name="og:url" content={meta.canonical} />
	<meta name="og:title" content={meta.title} />
	<meta name="og:description" content={meta.description} />
	<meta name="og:type" content="website" />
</svelte:head>

<section>
	<h1>Contact Me</h1>
	
	<p>
		I'm always interested in connecting with fellow professionals in the SDET and test automation space. 
		Whether you have questions about my work, want to discuss potential opportunities, or just want to chat 
		about testing strategies, I'd love to hear from you.
	</p>

	<div class="contact-methods">
		<div class="contact-method">
			<h2>Schedule a Call</h2>
			<p>
				Ready to discuss your project? Book a free consultation call to discuss 
				your testing needs and how I can help.
			</p>
			<a href="https://calendly.com/mikesell404" class="cta-secondary mark-hover" rel="external">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
		Available for <strong>direct contracting</strong>. 
		I work remotely from Brazil, while maintaining 
		US market standards and timezone compatibility.


		
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

	.contact-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-half);
		padding: var(--spacing-half) var(--spacing);
		background-color: var(--accent-color);
		color: white;
		text-decoration: none;
		border-radius: 4px;
		font-weight: 500;
		transition: background-color 0.2s ease;
	}

	.contact-link:hover {
		background-color: var(--accent-color-dark, #5a8bd4);
	}

	.availability {
		margin: var(--spacing-large) 0;
		padding: var(--spacing);
		background-color: var(--background-color-subtle);
		border-radius: 8px;
		border-left: 4px solid var(--accent-color);
	}

	.availability h2 {
		margin-top: 0;
		margin-bottom: var(--spacing-half);
	}

	.socials-section {
		margin-top: var(--spacing-large);
		padding-top: var(--spacing);
		border-top: 1px solid var(--text-color-subtle);
	}

	.socials-section p {
		margin-bottom: var(--spacing-half);
	}

	@media (max-width: 768px) {
		.contact-methods {
			grid-template-columns: 1fr;
		}
	}
</style>
