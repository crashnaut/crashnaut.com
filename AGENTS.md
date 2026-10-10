# AGENTS.md

Guide for AI agents working on crashnaut.com: Mike Sell's site and blog about test
automation, CI/CD and FinTech testing. SvelteKit, prerendered to static HTML, served by
Firebase Hosting. The full editorial method lives in
[`docs/EDITORIAL-PLAYBOOK.md`](docs/EDITORIAL-PLAYBOOK.md); this file is the short version
every session starts from.

## Working rules

- **Never commit unless asked.** Show the diff and a summary; Mike commits.
- **Never push to `main` or merge PRs.** Work on a branch and open a PR.
- **Never hand-edit generated files:**
  - `build/` (output of `npm run build`)
  - `static/og/` (share cards and favicons from `npm run og`)
  - `src/routes/*.theme.css` (written by `src/lib/markdown.ts` from `src/lib/syntax-theme.ts`)
  - `static/blog/` (copied from `blog/` at build time)
- **Propose before changing the design system:** `src/routes/layout.css`,
  `src/lib/brand/` and `scripts/og.mjs`. Describe the change and wait for a yes.
- **Never commit secrets.** Deploy credentials and analytics IDs live in GitHub Actions
  (`FIREBASE_SERVICE_ACCOUNT` secret, `GA_MEASUREMENT_ID` variable).

## Ground rules for content

1. **Trust only pages you fetched.** Training data predates recent releases. Versions,
   APIs, CLI flags and prices must come from a page fetched while writing.
2. **Every factual sentence has a source** you could point to: docs, changelog, paper,
   repo. Prefer primary sources; add one reputable secondary for anything surprising.
3. **Numbers are labelled honestly.** Vendor benchmarks say so. Your own measurements say
   what was measured, on what, and how many runs.
4. **Code runs.** Every snippet comes from a repo or scratch project where it was
   executed, or it's marked as pseudo-code. Every command or flag in a "Try this" section
   must exist in the current docs.
5. **Quotes are verbatim.** Mark cuts with an ellipsis and keep the context fair.
6. **Never rewrite a published post silently.** Fix it, set `updated:` in the frontmatter,
   and add a short note at the end saying what changed.

Research notes in `drafts/<slug>/research/` are leads, not sources.

## Fixed slots for every post

See playbook §2 for the full rules.

- **Title:** a claim or a searchable how-to, never a topic.
- **Description:** one sentence, 160 characters max.
- **Opening:** 2–4 sentences: the bug or cost, who hits it, what you'll leave with.
- **Body:** H2 sections that work as a table of contents, one idea each.
- **Proof:** runnable code, a real number, a diagram, or a `:::compare` block.
- **Takeaway:** one sentence in a `:::tip` block, at most once per post.
- **Why it matters for your team:** one sentence tying it to software that moves money.
- **TL;DR:** `tldr.md` with just the code and the steps.
- **Links:** 2–3 internal links to related posts.
- **Tags:** 2–4, reused from existing tags where possible.

Length: 900–1,800 words for a tutorial, 700–1,200 for an opinion piece. Cut copy to fit;
never shrink type. US spelling; product names as their vendors write them.

## Pipeline

1. **Scaffold:** `npm run g "Title"` creates `drafts/<slug>/index.md`.
2. **Research:** 1–3 parallel agents (playbook prompt A) write
   `drafts/<slug>/research/<angle>.md`.
3. **Write:** fill every slot. Pick the angle by value to a FinTech reader.
4. **Build and look:** `npm run dev`; read it on desktop and mobile, light and dark.
5. **QA:** fact-check (prompt B) and design review (prompt C) in parallel. Apply every
   FIX/SOFTEN and every P1/P2, then rebuild.
6. **Publish:** move the folder to `blog/`, run `npm run og`, commit the post and its share
   card, open a PR, check the preview channel. Mike merges.
7. **Distribute:** LinkedIn post with the share card and the one-sentence takeaway.

## Definition of done

- [ ] Every slot above is filled.
- [ ] `drafts/<slug>/qa/fact-check.md` exists; every FIX/SOFTEN is applied or explained.
- [ ] `drafts/<slug>/qa/design-review.md` exists; every P1/P2 is applied or explained.
- [ ] `npm run check`, `npm run lint`, `npm run lint:posts`, and
      `npm run build && npm test` pass.
- [ ] Share card generated; the post renders on mobile without horizontal scroll.
- [ ] Mike has read it before it's committed.

## Repo map

| Path                        | What it is                                                        |
| --------------------------- | ----------------------------------------------------------------- |
| `blog/<slug>/`              | Published posts: `index.md`, optional `tldr.md` and `images/`     |
| `drafts/<slug>/`            | Unpublished posts; never built                                    |
| `src/routes/`               | Pages: home, `blog/`, `blog/[slug]/`, `contact/`, RSS, sitemap    |
| `src/routes/blog/_posts.ts` | Reads `blog/`, builds post metadata, related links                |
| `src/lib/markdown.ts`       | marked + shiki pipeline and the custom blocks (`:::tip`, etc.)    |
| `src/lib/brand/`            | Crash-test mark (design system: propose first)                    |
| `src/routes/layout.css`     | Global styles and tokens (design system: propose first)           |
| `scripts/generate.js`       | `npm run g`: draft scaffold                                       |
| `scripts/og.mjs`            | `npm run og`: share cards and favicons (design system)            |
| `static/og/`                | Generated share cards: commit them, don't edit them               |
| `tests/`                    | Playwright: request-level smoke checks, browser tests, axe        |
| `docs/`                     | Audit and editorial playbook                                      |
| `.github/workflows/ci.yml`  | Check, lint, build, test; Firebase preview per PR, live on `main` |
| `firebase.json`             | Hosting config, redirects and headers                             |

## Commands

```bash
npm run dev                 # http://localhost:5173
npm run check               # svelte-check
npm run lint                # prettier + eslint
npm run lint:posts          # post fit check (scripts/lint-posts.mjs)
npm run build && npm test   # production build, then Playwright against it
npm run g "Title"           # scaffold a draft
npm run og                  # render share cards for new posts
```
