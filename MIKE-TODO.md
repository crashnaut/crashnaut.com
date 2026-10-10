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

- [ ] **Turn on analytics.** Create a GA4 property for crashnaut.com and copy the
      measurement ID (`G-XXXXXXXXXX`). In GitHub, open **Settings → Secrets and
      variables → Actions → Variables** and add `GA_MEASUREMENT_ID`. Until it's
      set, builds ship without analytics and CI prints a warning.
- [ ] **Filter out your own visits.** In GA4, open **Admin → Data streams → Configure
      tag settings → Define internal traffic** and add your own IP.
- [ ] **Set up Google Search Console.** Verify crashnaut.com (a DNS TXT record is
      easiest) and submit `https://crashnaut.com/sitemap.xml`. It shows which
      search terms bring people in, which GA alone can't.
- [ ] **Turn on automatic deploys.** Run `npx firebase init hosting:github` (or
      create a service-account key in GCP IAM) and save the JSON as the repo secret
      `FIREBASE_SERVICE_ACCOUNT`. Until then, the CI deploy steps are skipped and
      you deploy by hand:
      `VITE_PUBLIC_GA_TRACKING_ID=G-… npm run build && npx firebase deploy --only hosting`
- [ ] **Check that comments work.** Make sure the giscus GitHub app is installed for
      `crashnaut/crashnaut.com` (https://github.com/apps/giscus). Discussions are
      already on; the IDs in `src/lib/Comments.svelte` belong to this repo.

## Check what Claude wrote

- [ ] **Engagement steps** on `/contact` ("Intro call → Audit → Build & hand over",
      in `src/routes/contact/+page.svelte`): make sure this is really how you work.
- [ ] **LinkedIn URL:** the old site had both `/in/mikedcsell` and
      `/in/mike-sell-crashnaut`. The new site uses `/in/mike-sell-crashnaut`
      (`src/lib/seo.ts`, `firebase.json`). Fix it there if that's wrong.
- [ ] **Bluesky:** a share button and a `/bluesky` redirect point to
      `bsky.app/profile/crashnaut.com`. Remove them if you don't use Bluesky.
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

1. Ship the nearly finished drafts: `the-golden-rule-of-mocking` (swap the
   geocoding example for Stripe), `coverage-is-a-health-signal`,
   `test-database-isolation-function-vs-class`, and
   `anatomy-of-an-integration-test` (make the example "create a payment", and
   fold in `questions-to-ask-before-writing-a-test`).
2. How to Test Idempotency in Payment APIs (retries, duplicate webhooks,
   idempotency keys)
3. Never Use Floats for Money: Testing Rounding and Currency Precision
4. Testing Stripe Webhooks in CI (Stripe CLI, signed payloads, test clocks)
5. Testing Time in FinTech: Cutoffs, Business Days, Time Zones and DST
6. Ledger Reconciliation Testing
7. Run Playwright in Docker Against Your Local App
8. Test Data for FinTech: Factories, Stripe/Plaid Sandboxes, PCI
9. Contract Testing Payment Integrations with Pact

To publish: `npm run g "Title"` → write it in `drafts/` → move the folder to
`blog/` → `npm run og` → commit the PNG it creates.

## Process (from the editorial playbook)

- [ ] Add an `AGENTS.md`/`CLAUDE.md` with the ground rules, sourcing rules and definition
      of done from `docs/EDITORIAL-PLAYBOOK.md`.
- [ ] Build `scripts/lint-posts.mjs`, a "fit check" for posts that fails on: missing or
      too-long descriptions, no tags, a missing share card, or `TODO(` in published posts.
- [ ] Run the fact-check prompt on every post before you publish it, and on the two
      pulled posts before you decide whether to fix or delete them.

## Later (code)

- [ ] Upgrade SvelteKit, Vite, vite-plugin-svelte and vitest to current major
      versions in their own PR.
- [ ] Turn on `"strict": true` in `tsconfig.json` and fix whatever breaks.
