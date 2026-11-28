# Design review: How to Be a -10x Engineering Manager When Code Is Cheap

Reviewed 2026-11-21 from a production build (`npm run build && npm run preview`), at
1280×800 and 375×812 in light and dark. Screenshots: `qa/crops/` (`*-fold.png` is the
first screen, `*-full.png` the full page, plus crops of each diagram, chart, table, code
and compare block). Line numbers refer to `index.md` as of this review.

## Post issues

1. **P2. The dashboard diagram puts the honest number on the wrong side (lines 21–38).**
   "Tasks completed: +21%" sits in green on the "Output dashboard", and the right panel's
   third box, "Bigger PRs to read", repeats "+154%" from the left without a number. The
   post's argument is that PRs went up 98% while tasks went up 21%; the diagram should put
   those in opposite panels. Replace lines 21 and 28–29, 32–37:
   ```html
   <svg viewBox="0 0 700 290" role="img" aria-label="Two dashboards side by side. On the slide: PRs merged up 98 percent, PR size up 154 percent, token spend up, all green. What the team lives with: tasks completed up only 21 percent, review time up 91 percent, bugs per developer up 9 percent.">
   …
   <rect class="d-box-green" x="45" y="182" width="270" height="44" rx="6"/>
   <text class="d-text" x="180" y="209" text-anchor="middle">Agent token spend: up</text>
   …
   <rect class="d-box-amber" x="385" y="70" width="270" height="44" rx="6"/>
   <text class="d-text" x="520" y="97" text-anchor="middle">Tasks completed: +21%</text>
   <rect class="d-box-red" x="385" y="126" width="270" height="44" rx="6"/>
   <text class="d-text" x="520" y="153" text-anchor="middle">PR review time: +91%</text>
   <rect class="d-box-red" x="385" y="182" width="270" height="44" rx="6"/>
   <text class="d-text" x="520" y="209" text-anchor="middle">Bugs per developer: +9%</text>
   ```
   "Agent token spend: up" ties the left panel to the "Mandate the tool" section and needs
   no invented number. The current aria-label also says "PR size … all green" and
   "delivery dashboard", which don't match what's drawn; the new one does.
2. **P2. Only one visual besides the table.** House style §4 asks for at least two visuals
   (SVG plus a bar chart or compare block); a markdown table doesn't count. The "Beyond
   them, the +1x manager" list (lines 75–80) converts cleanly into a compare block:
   ```md
   :::compare
   ::do[Plan for the review queue]

   - Budget review time in planning and cap open PRs per reviewer.
   - Keep QA as an independent check, and invite them into grooming.
   - Cut scope on a late project before adding anything that writes code.

   ::dont[Run the team off the output slide]

   - Put PR count or lines changed on the slide.
   - Cut QA because the agent writes tests.
   - Rank people by agent usage.

   :::
   ```
   Keep the fourth bullet ("Asks what the team stopped doing…") as a sentence after it.
3. **P3. DORA table (lines 67–73).** On mobile it fits 343px with no horizontal scroll
   (checked) and rows wrap to 2–4 lines; that's fine. On desktop, "Failed deployment
   recovery time" wraps while the second column has room. Proposal (design system):
   `th:first-child, td:first-child { white-space: nowrap }` above 768px only. In the draft,
   the separator row on line 69 is padded for 71 characters but line 71's second cell is
   shorter now; run Prettier so the source table lines up again.
4. **P3. Optional grouping in the table.** DORA groups these into throughput (lead time,
   deployment frequency, recovery time) and instability (change fail rate, rework rate).
   Ordering the rows that way, with a short lead-in "three for speed, two for stability",
   makes the table scan faster. Check the grouping against the dora.dev page you cite
   before using it.

Hierarchy: 2-line H1 on desktop, opening fully above the fold (first line at y=618).

## Delight ideas (cheap, crash-test)

- **"On the slide" / "Off the slide".** Rename the two panel titles (lines 23, 31) to
  `On the slide` and `Off the slide` (both well under the 270px inner width). It ties the
  diagram to the caption's last word.
- **Pre-mark the crash metrics.** The closing section says change fail rate and rework
  rate belong on the slide first. Bold those two metric names in the table
  (`**Change fail rate**`, `**Deployment rework rate**`) so the table already shows which
  rows are the crash sensors; the last section then pays it off.

## Site-wide items (same on all six series posts)

These touch the template or design system, so they are **proposals**, not draft edits.

- **S1. P2 (proposal): diagram text is about 6px on phones.** Every `figure.diagram` SVG
  (viewBox 700 wide) renders at 309px at 375×812, a 0.44 scale, so 13px `d-text` shows at
  about 5.7px and 11px `d-text-sm` at about 4.9px. Published posts have the same problem
  (feature-flag post: 309px for 620–720 viewBoxes). `.diagram` already has
  `overflow-x: auto`, so in `src/routes/layout.css`:
  ```css
  @media (max-width: 600px) {
    .diagram svg { min-width: 560px; max-width: none; }
  }
  ```
  That gives 0.8 scale (13px → 10.4px) with a horizontal swipe inside the figure. The page
  itself still doesn't scroll sideways.
- **S2. P2 (proposal): on mobile the opening sits below the fold.** At 375×812 the first
  prose line starts at y = 747–777. The hero (crumb, 3-line H1, deck, byline, tags and the
  mode toggle) ends at about 640, then the collapsed "On this page" `<details class="toc-inline">`
  (70px, top 645) pushes the opening down. At most one line of the opening shows. Fix in
  `src/routes/blog/[slug]/+page.svelte`: below 768px, render `toc-inline` after the first
  paragraph of `.prose`, or merge it into the `head-foot` row next to the mode toggle as a
  small "Contents" button. Either change brings the first 3–4 lines above the fold.
- **S3. P2 (proposal): "TL;DR: just the code" label is wrong for five of six posts.** Only
  the QA post's `tldr.md` has a code block; the others are bullets. In
  `+page.svelte` line 154, use "TL;DR" (or "TL;DR: just the steps") when the tldr has no
  fenced code. A flag from `_posts.ts` such as `post.tldrHasCode` keeps it build-time.
- **S4. P3 (proposal): straight quotes and apostrophes.** Rendered prose uses `'` and `"`
  throughout ("that's", "small refactor", "a mirror and a multiplier"). Published posts do
  too, so this is a pipeline choice: a smart-quotes pass in `src/lib/markdown.ts` (text
  tokens only, skipping code and inline code) would fix all posts at once. Don't hand-edit
  drafts for this.
- **S5. P3 (copy, optional): "-10x" uses a hyphen.** In the Barlow Condensed H1 it reads
  as a dash. A true minus (U+2212, "−10x") in the displayed title, H2s and SVG labels looks
  right; keep ASCII "-10x" in the slug and description so search still matches. The
  Brooks post already uses U+2212 in n(n−1)/2. Skip it if search matching on the title
  matters more.
- **S6. Delight (proposal): a series strip.** A one-line "−10x series · Part 2 of 5"
  row under the crumb, with five small crash-test dots (filled = published), would link
  the parts once they ship and fits the flight-recorder look.

Checked and fine on every post: no page-level horizontal scroll at 375px
(scrollWidth = 375), no SVG text outside its viewBox or overlapping other text, no
widowed last words in paragraphs, H2s or captions, reading measure about 640px (about
75 characters) at 17px on desktop, and both themes keep box strokes and labels readable.
