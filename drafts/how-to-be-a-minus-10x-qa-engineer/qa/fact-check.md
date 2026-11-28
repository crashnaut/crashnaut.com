# Fact-check: How to Be a -10x QA Engineer With an AI Agent

Checked 2026-11-21 against pages fetched that day. Blocked or empty sources: none.

| Claim | Status | Evidence | Replacement wording |
| --- | --- | --- | --- |
| Playwright can retry failing tests with the `retries` option [1] | OK | https://playwright.dev/docs/test-retries: config example `retries: 3`, comment "Give failing tests 3 retry attempts" | |
| Playwright reports a test that failed first and then passed as "flaky" [1] | OK | test-retries: "flaky" means "tests that failed on the first run, but passed when retried"; sample output shows `1 flaky` | |
| Config snippet `retries: process.env.CI ? 1 : 0` with `defineConfig` from `@playwright/test` | OK | https://playwright.dev/docs/test-configuration uses the same pattern: "// Retry on CI only." `retries: process.env.CI ? 2 : 0,` (1 is a valid value) | |
| Author's scratch run with `CI` set showed "1 flaky" | UNVERIFIABLE (consistent with docs) | Author's own run; matches the docs' sample output `1 flaky` | Keep as is (first-hand) |
| Developers on high-AI-adoption teams merged 98% more pull requests [2] | OK | https://www.faros.ai/blog/ai-productivity-paradox-report-2025 (July 23, 2025): "Developers on teams with high AI adoption complete 21% more tasks and merge 98% more pull requests" | |
| Source 2 title and date: "The AI Productivity Paradox Report 2025", July 23, 2025 | OK | Faros page header "July 23, 2025" | |
| "Two years ago, a test case cost someone an hour to think through and write" | SOFTEN | No source; the hour is a made-up figure | "Two years ago, a test case took someone real time to think through and write." |
| "an agent can generate 300 cases from one user story before the coffee is ready" | OK (hyperbole) | Satirical illustration, no source needed; flag only if read as a benchmark | |
| When asked to fix a failing test, the agent "will often add a fixed wait or loosen the assertion" | SOFTEN | No source; general claim about agent behaviour | "It may add a fixed wait or loosen the assertion until the failure goes away." |
| "Ten minutes reading the PR ... is worth more than an hour testing the build afterward" | OK (opinion) | Opinion, not a measured claim | |
