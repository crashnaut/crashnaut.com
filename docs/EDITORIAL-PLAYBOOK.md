# Editorial playbook: how a crashnaut post gets made

This is adapted from the best agent-run publication I've seen: a weekly two-page AI
newsletter where every issue is researched, written, fact-checked, typeset and reviewed by
Claude agents. Only the **method** is borrowed here (pipeline, slots, sourcing rules, QA
prompts, build-time checks). Its content and branding stay where they are. The point is to
turn "I should write more" into a repeatable pipeline that ships 2 posts a month with
facts that hold up.

Why it's worth copying: the facts are **boringly correct** (every claim is checked against
a fetched page, with a verdict table). The layout is **enforced by a build check, not by
willpower** (overflow fails the build, so copy gets cut). And every story ends with a
**"why we care" line that ties it to the reader's actual work**. Those three habits are
exactly what the blog was missing.

---

## 1. Ground rules

1. **Trust only pages you fetched.** Model training data predates recent releases.
   Versions, APIs, CLI flags and prices must come from a page fetched while writing.
   (Missing this rule is what produced the invented Synpress APIs.)
2. **Every factual sentence has a source** you could point to: docs, changelog, paper,
   repo. Prefer primary sources. Add one reputable secondary for anything surprising.
3. **Numbers are labelled honestly.** Vendor-reported benchmarks say so. Your own
   measurements say what was measured, on what, and how many runs.
4. **Code runs.** Every snippet is copied from a repo or a scratch project where it was
   executed, or it's marked as pseudo-code. Every command or flag in a "Try this" section
   must exist in the current docs.
5. **Quotes are verbatim.** Mark cuts with an ellipsis and keep the context fair.
6. **Never rewrite a published post silently.** Fix it, set `updated:` in the
   frontmatter, and say what changed in a short note at the end.

## 2. Fixed slots for every post

Consistency is what makes a publication feel like one. Every post has these:

| Slot                             | Rule                                                                                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Title**                        | A claim or a searchable how-to, never a topic. "How to Test Idempotency in Payment APIs", not "Idempotency".                                    |
| **Description**                  | ≤160 characters, one sentence, shown in search results and share cards.                                                                         |
| **Opening**                      | 2–4 sentences: the bug or cost, who hits it, what you'll leave with. The first sentence makes the reader curious. No throat-clearing.           |
| **Body**                         | H2 sections that work as a table of contents. One idea per section.                                                                             |
| **Proof**                        | At least one of: runnable code, a real number, a diagram, or a `:::compare` do/don't block.                                                     |
| **The takeaway**                 | One sentence, at most once per post, in a `:::tip` block.                                                                                       |
| **Why it matters for your team** | One sentence tying it to shipping software that moves money: payments, ledgers, compliance, release speed.                                      |
| **TL;DR**                        | `tldr.md` with just the code and the steps, for readers who want the answer.                                                                    |
| **Links**                        | 2–3 internal links in a closing "Related" line. No links or names in the body: cite with [n] and list sources under `## Sources` (STYLE.md §5). |
| **Tags**                         | 2–4, reused from existing tags where possible.                                                                                                  |

**Length budget:** 900–1,800 words for a tutorial, 700–1,200 for an opinion piece. If it's
longer, cut it: the newsletter fails its build on overflow and fixes it by cutting copy,
never by shrinking type. Same rule here.

## 3. Voice

The full voice guide, drawn from Mike's pre-AI writing, is [`STYLE.md`](STYLE.md). In
short: define the term, lay out the options, measure, report what failed, give a verdict.

- Headlines are claims, not topics.
- Write for a senior engineer or engineering manager at a FinTech company with a test-suite
  problem. Assume they're smart and busy.
- Wit is welcome, but never at the expense of accuracy or a named person.
- US spelling. Product names written exactly as their vendors write them (Playwright,
  GitHub Actions, Stripe, Plaid).
- One language per cluster: TypeScript for Playwright and CI posts. If an example is in
  another stack, say so in the first paragraph.

## 4. The pipeline

Run it end to end for every post. Steps 2 and 5 run as parallel background agents.

1. **Scaffold:** `npm run g "Title"` → `drafts/<slug>/index.md`.
2. **Research:** 1–3 agents, one per angle (prompt A). Each writes
   `drafts/<slug>/research/<angle>.md` with URLs and dates. Research notes are leads, not
   sources.
3. **Write:** fill every slot in §2. Pick the angle by **value to a FinTech reader**, not
   by hype.
4. **Build and look:** `npm run dev`, read the post on desktop and mobile, in light and
   dark. `npm run build && npm test` must pass.
5. **QA:** run the fact-check (prompt B) and design review (prompt C) agents in parallel.
   Apply every FIX/SOFTEN and every P1/P2. Rebuild.
6. **Publish:** move the folder to `blog/`, `npm run og`, commit the post and its share
   card, open a PR. Check the preview channel, then merge.
7. **Distribute:** a LinkedIn post with the share card and the one-sentence takeaway.

### Definition of done

- [ ] Every slot in §2 is filled.
- [ ] `drafts/<slug>/qa/fact-check.md` exists, and every FIX/SOFTEN is applied or explained.
- [ ] `drafts/<slug>/qa/design-review.md` exists, and every P1/P2 is applied or explained.
- [ ] `npm run check`, `npm run lint`, `npm run build && npm test` pass.
- [ ] Share card generated, and the post renders on mobile without horizontal scroll.
- [ ] Commit only after you've read it yourself.

## 5. Prompts

Copy these into Claude Code. Replace `{TODAY}`, `{SLUG}`, `{TOPIC}` and `{ANGLE}`.

### Kickoff (runs the whole pipeline)

```text
Write a new crashnaut post. Topic: {TOPIC}. Angle: {ANGLE}.
Follow docs/EDITORIAL-PLAYBOOK.md end to end: scaffold with `npm run g`, run 1–3 research
agents in parallel (prompt A), write the draft filling every slot in §2, build and check
it on desktop and mobile, then run the fact-check (prompt B) and design review (prompt C)
agents in parallel, apply their fixes, and rebuild. Keep it in drafts/. Don't publish or
commit; show me the draft and a summary of the QA fixes first.
```

### A. Research (one agent per angle)

```text
Today is {TODAY}. You are a research reporter for crashnaut.com, a blog by a senior SDET
contractor whose readers are engineers and engineering managers at FinTech companies
(payments, lending, banking, ledgers). The post is "{TOPIC}"; your angle is {ANGLE}.

Use WebSearch and WebFetch extensively. Trust only pages you fetch; your training data
predates current releases, so never state a version, API, flag, price or behavior you
didn't read today. Prefer primary sources (official docs, changelogs, RFCs, specs, papers,
source code), plus one reputable secondary for anything surprising. Capture concrete
numbers and exact API signatures.

Write drafts/{SLUG}/research/{ANGLE}.md. Per finding: headline (≤10 words), source URL +
publish/updated date, 2–3 sentence summary, key numbers or code, and "why a FinTech team
cares" (one sentence). End with: the 3 most common mistakes teams make here, 2–3 runnable
examples worth showing (with the doc page that proves each API exists), and open
questions you couldn't verify.
```

### B. Fact-check

```text
You are the fact-checker for the crashnaut.com post at drafts/{SLUG}/index.md (and
tldr.md). Today is {TODAY}. Verify every factual claim, version number, API name, CLI
flag, config key, quote and statistic against a page you fetch with WebFetch/WebSearch.
Trust only fetched pages. Also check that every code snippet uses APIs that exist in the
current docs, with the right signatures, and that commands would actually run. Flag
allegations stated as fact, numbers without a source, [n] citations that don't support their
sentence, outdated versions (e.g. EOL Node, deprecated actions), and claims the author
can't know.

Do NOT edit the post. Write drafts/{SLUG}/qa/fact-check.md as a table:
claim | OK / FIX / SOFTEN / UNVERIFIABLE | evidence (URL + quote) | replacement wording (same
length or shorter). Record any source that was blocked or empty. Reply with only the
FIX/SOFTEN/UNVERIFIABLE items.
```

### C. Design review

```text
You are a senior editorial designer reviewing the crashnaut.com post /blog/{SLUG}.
Run `npm run build` then `npm run preview`, and screenshot the post with Playwright at
1280×800 and 375×812, in light and dark color schemes (save to drafts/{SLUG}/qa/crops/).
Styles are in src/routes/layout.css, the template in src/routes/blog/[slug]/+page.svelte.

Check: hierarchy (title, deck, H2 rhythm), reading measure and leading, code blocks
(overflow, line highlights, file names), callouts and compare blocks, diagrams and charts
(labels colliding or clipped, contrast in both themes), widows, curly quotes and dashes,
image alt text, mobile horizontal scroll, and whether the opening shows above the fold.
Suggest 2–3 cheap delight ideas that fit the crash-test identity.

Edit nothing except drafts/{SLUG}/qa/design-review.md: numbered issues ranked P1/P2/P3,
exact location, and a concrete copy or CSS fix. Mark anything touching the template or
design system as a proposal.
```

### D. Refresh an old post

```text
Refresh blog/{SLUG}. Run prompt B against it first. Apply every FIX/SOFTEN, update
versions and actions to current ones (check them, don't guess), keep the slug and voice,
add `updated: {TODAY}` to the frontmatter, and add a one-line "Updated {TODAY}: …" note
at the end. Then run prompt C and fix P1/P2. Don't commit; show me the diff.
```

## 6. Ideas worth porting from the newsletter's tooling

- ✅ **A build-time content check** (like its "fit check"). Fail the build when a post has
  no description, a description over 160 characters, no tags, a missing share card, an
  unknown internal link, or a `TODO(` comment in a published post. Part of this exists
  already in `tests/smoke.test.ts`; `npm run lint:posts` (`scripts/lint-posts.mjs`) catches
  it before the build.
- ⬜ **Citations as data.** The newsletter writes `{sourceKey}` in copy and the build
  numbers them and fails on unknown keys. A `sources:` list in frontmatter plus `{key}`
  markers would give posts a numbered references section for free.
- ⬜ **A palette validator** before adding chart colors: the newsletter checks OKLCH
  lightness and chroma, colorblind separation and WCAG contrast from hex values. Use it
  for the bar-chart and diagram colors in `layout.css`.
- ⬜ **Computed visuals instead of decoration.** It draws seeded generative art and a story
  map computed from the issue's own text (TF-IDF → cosine similarity → MDS). The crashnaut
  equivalent: a per-post "test report" header generated from the post (sections as specs,
  code blocks as assertions), or a "crash log" map of all posts clustered by tag.
- ✅ **A scaffold that copies the last good example.** Its `new-issue` script copies the
  previous issue and bumps the numbers. `npm run g` could start from a template with every
  §2 slot stubbed out.
- ⬜ **QA reports kept next to the content** (`qa/fact-check.md`, `qa/design-review.md`) as
  a record of what was verified, so a reader's "is this right?" has an answer.
- ✅ **An agent guide.** A short `AGENTS.md`/`CLAUDE.md` with ground rules ("never commit
  unless asked", "never hand-edit generated files", "propose before changing the design
  system"), a repo map and a definition of done, so every agent session starts from the
  same rules.
