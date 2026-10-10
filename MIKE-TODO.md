# Mike's TODO: things Claude couldn't do

Left over from the October 2026 audit and redesign (branch `feat/crashnaut-identity`).
Delete items as you finish them.

Related docs:

- [`docs/AUDIT-2026-10.md`](docs/AUDIT-2026-10.md): the full audit, covering code,
  UI/UX, per-post verdicts, ranked drafts and what to write next, with each item marked
  done or still to do.
- [`docs/EDITORIAL-PLAYBOOK.md`](docs/EDITORIAL-PLAYBOOK.md): how to produce posts
  (pipeline, fixed slots, voice, and the research / fact-check / design-review prompts).
- Private brown-bag study notes, with the original prompts verbatim, are kept outside
  this repo.

## Setup (accounts and secrets)

- [ ] **Turn on analytics.** The GA4 property "crashnaut" (509416308) is already
      linked to the Firebase project. Add a web data stream for
      `https://crashnaut.com` and copy its measurement ID (`G-XXXXXXXXXX`). In GitHub, open **Settings → Secrets and
      variables → Actions → Variables** and add `GA_MEASUREMENT_ID`. Until it's
      set, builds ship without analytics and CI prints a warning.
- [ ] **Filter out your own visits.** In GA4, open **Admin → Data streams → Configure
      tag settings → Define internal traffic** and add your own IP.
- [ ] **Set up Google Search Console.** Verify crashnaut.com (a DNS TXT record is
      easiest) and submit `https://crashnaut.com/sitemap.xml`. It shows which
      search terms bring people in, which GA alone can't.
- [ ] **Check that comments work.** Make sure the giscus GitHub app is installed for
      `crashnaut/crashnaut.com` (https://github.com/apps/giscus). Discussions are
      already on; the IDs in `src/lib/Comments.svelte` belong to this repo.

## Check what Claude wrote

- [x] **Engagement steps** on `/contact` ("Intro call → Audit → Build & hand over",
      in `src/routes/contact/+page.svelte`): make sure this is really how you work.
- [x] **LinkedIn URL:** `/in/mikedcsell` (`src/lib/seo.ts`, `firebase.json`).
- [x] **Bluesky / X:** no accounts, so the Bluesky share button, the `/bluesky`
      and `/twitter` redirects and the `@crashnaut` Twitter meta tags are gone.
- [ ] **Homepage and footer copy** (`src/routes/+page.svelte`,
      `src/lib/WorkWithMe.svelte`): tweak it so it sounds like you.

## Posts that don't match your repos

Each one has a `<!-- TODO(mike) -->` comment in the markdown.

- [ ] `blog/vanilla-playwright-pom-setup`: the linked boilerplate repo still ships
      `basePage.ts` and has no `skipGoto`. Update the repo or reword the link.
- [ ] `blog/playwright-bdd`: the repo has no playwright-bdd dependency, no
      `features/` folder and no `bddgen` script, but the post says it does.
- [ ] `blog/nix-flakes-for-sdet-setup`: the `crashnaut/nix` flakes don't include
      Node or pnpm, but the post promises "Node.js 22 with pnpm".
- [ ] Two numbers nobody has verified: "five minutes from clone to running tests"
      and "~2GB" of disk.

## Check the seven new posts (published on `feat/publish-drafts`)

They were finished from your drafts by agents following `docs/STYLE.md`, and every API
was checked against current docs, but **none of the code samples has been run**. Read
each one and correct anything that doesn't sound like you.

- [ ] `the-golden-rule-of-mocking`: TypeScript, Vitest, MSW 3 and stripe-node, plus a
      pytest + `responses` version. Run the snippets once.
- [ ] `anatomy-of-an-integration-test` (now includes the "questions before you write"
      draft): check that the pytest fixture names (`load_assets`, `execute`,
      `db_defaults`) match your real suites.
- [ ] `test-database-isolation-function-vs-class`: Neo4j database names can't contain
      underscores, so `test_8a2f3c9d` is now `test-8a2f3c9d`. Check your real fixture.
- [ ] `coverage-is-a-health-signal`: the charts are labelled as illustrative. Swap in
      real numbers if you have them.
- [ ] `ephemeral-preview-environments-slot-based-deploys`: confirm that AWS SSM
      Parameter Store is the slot store you used, and that the pool is 7 exclusive
      slots plus 1 shared. The workflow is untested.
- [ ] `mcp-servers-rules-and-skills-for-qa` (merged MCP + agent-skills drafts): the
      `commit-and-mr` skill is presented as the one you use most. Confirm that.
- [ ] `sandboxing-your-ai-coding-agent`: `my-agent-image` is a placeholder. The
      devcontainer, `settings.json` and `sandbox.json` examples are untested.
- [ ] Two headings were renamed during the copy-edit, so their anchor links changed:
      "The bottom line" (feature-flag post) and "The Bottom Line" (cross-repo post).
- [ ] All seven are dated 2026-10-10. If you'd rather release them over a few weeks,
      move some back to `drafts/` and publish one a week.

## Pulled posts (now in `drafts/`, old URLs redirect to `/blog`)

- [ ] `drafts/testing-web3-using-synpress`: check it against current Synpress
      docs and cut it to about 1,200 words, or delete it.
- [ ] `drafts/llms-unkept-promise-to-sdets`: fix the factual errors listed at the
      top of the file, or delete it.

## Proof (needs your real experience)

- [ ] **Case study:** "How I cut a payments team's flaky E2E suite from X hours to
      Y minutes". Use real before/after numbers, anonymize the client, and link it
      from the homepage. This is the most valuable missing page.
- [ ] Add 1–2 client logos or testimonials to the homepage, if you have permission.

## What to write next (in order)

1. ~~Ship the nearly finished drafts~~ (done on `feat/publish-drafts`: mocking,
   anatomy + questions, DB isolation, coverage, preview environments, MCP + agent
   skills, sandboxing). Read each one and correct anything that doesn't sound like you.
2. How to Test Idempotency in Payment APIs (retries, duplicate webhooks,
   idempotency keys)
3. Never Use Floats for Money: Testing Rounding and Currency Precision
4. AI guardrails for test teams: a starter pack of Cursor rules, `CLAUDE.md` /
   `AGENTS.md`, permission settings and review checklists you can copy. (You said you
   lack docs here, so this doubles as your own reference.)
5. Testing GraphQL APIs: schema contract checks, resolver-level tests vs end-to-end,
   and N+1 detection (TypeScript first, with a pytest version)
6. Testing Stripe Webhooks in CI (Stripe CLI, signed payloads, test clocks)
7. Testing graph data in Neo4j: isolating test data, Cypher assertions, and why
   graph fixtures leak
8. pytest for TypeScript people: fixtures, scopes and parametrize, mapped to their
   Playwright Test equivalents
9. Testing Time in FinTech: Cutoffs, Business Days, Time Zones and DST
10. Ledger Reconciliation Testing
11. Run Playwright in Docker Against Your Local App
12. Test Data for FinTech: Factories, Stripe/Plaid Sandboxes, PCI
13. Contract Testing Payment Integrations with Pact

Your primary language is TypeScript. Python/pytest, GraphQL and Neo4j are trends worth
covering (see `docs/STYLE.md` §4). BDD is no longer recommended as a default.

To publish: `npm run g "Title"` → write it in `drafts/` → move the folder to
`blog/` → `npm run og` → `npm run lint:posts` → commit the post and the PNG.

## Process (from the editorial playbook)

- [ ] When you resolve a post's `TODO(mike)`, remove its slug from `TODO_ALLOWLIST` in
      `scripts/lint-posts.mjs` so `npm run lint:posts` guards it again.
- [ ] Run the fact-check prompt on every post before you publish it, and on the two
      pulled posts before you decide whether to fix or delete them.

## Later (code)

- [ ] Upgrade SvelteKit, Vite, vite-plugin-svelte and vitest to current major
      versions in their own PR.
- [ ] Turn on `"strict": true` in `tsconfig.json` and fix whatever breaks.
