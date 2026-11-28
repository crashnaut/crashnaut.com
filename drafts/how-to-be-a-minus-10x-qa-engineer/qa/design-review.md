# Design review: How to Be a -10x QA Engineer With an AI Agent

Reviewed 2026-11-21 from a production build (`npm run build && npm run preview`), at
1280×800 and 375×812 in light and dark. Screenshots: `qa/crops/` (`*-fold.png` is the
first screen, `*-full.png` the full page, plus crops of each diagram, chart, table, code
and compare block). Line numbers refer to `index.md` as of this review.

## Post issues

1. **P2. The code comment runs off-screen on mobile (line 116).** At 375px the code area
   is 341px and the comment line is 656px wide, so the explanation of the only snippet is
   cut at "surfaces flaky tes…" and needs a sideways swipe. Split it into two lines of
   36 characters or fewer:
   ```ts
     // Retry once in CI so flaky tests
     // show up in the report.
   ```
   The `import` line (46 characters) will still scroll; that's acceptable for code.
2. **P3. Highlight the line that matters.** The pipeline supports line highlights
   (`src/lib/markdown.ts`, `{n}` in the fence info). After the fix above the `retries` line
   is line 7: ` ```ts:playwright.config.ts {7} `.
3. **P3. "The examples use Playwright with TypeScript." (line 15)** is a one-sentence
   paragraph right after the opening, but there's only one example, at the very end. Cut
   it, or move it to the sentence that introduces the code: "Here is the low-retry setting
   in Playwright with TypeScript."
4. **P3. Make the PASS/FAIL inversion explicit in the diagram (lines 46–48, 64–66).** Red
   PASS and green FAIL is the right call, and "bug ships" / "fixed first" carry it. For
   readers who only scan colour, change the labels to `PASS (wrong)` and `FAIL (right)`:
   12 characters at 13px is about 84px, inside the 100px boxes (575–675) with 8px a side.
   Tight; if it feels cramped, widen both boxes to `x="565" width="120"` and end the
   arrows before them at x=555 (`M530,70 L547,70`, head `M555,70 l -8,-4 l 0,8 z`, same
   at y=210).

Diagram, compare block and code block read well in both themes. The diagram shows the
mechanism (order of test vs code) rather than decorating, and the two rows align on a
shared grid. Opening is above the fold on desktop (first line at y=618).

## Delight ideas (cheap, crash-test)

- **A "green is not a verdict" stamp.** Add a rotated hazard label across the top-right
  PASS box: `<text class="d-edge" x="625" y="40" text-anchor="middle" transform="rotate(-8 625 40)">FALSE PASS</text>`
  (above the box top at y=45; "Self-graded" ends near x=130, no collision).
- **Flaky counter in the copy.** Where you mention "1 flaky" in the report, show it as the
  report shows it, in inline code: `1 flaky`. Cheap and recognizable to anyone who has run
  Playwright.

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
