# Design review: How to Be a -100x Engineer: Let the Agent Read Your Messages

Reviewed 2026-11-21 from a production build (`npm run build && npm run preview`), at
1280×800 and 375×812 in light and dark. Screenshots: `qa/crops/` (`*-fold.png` is the
first screen, `*-full.png` the full page, plus crops of each diagram, chart, table, code
and compare block). Line numbers refer to `index.md` as of this review.

## Post issues

1. **P1. Broken arrowheads into "Agent via MCP" (lines 27–29).** The two heads are drawn
   as upward-pointing triangles a few pixels off the line ends, so both lines look
   unfinished and the heads float in front of the box (visible in both themes). Replace
   the three lines with heads that sit on each line's angle, tips on the box edge (x=275):
   ```html
   <path class="d-flow" d="M180,68 L263,110.5 M180,178 L263,135.5"/>
   <path class="d-flow-head" d="M274,116 L260.6,115.9 L266,105.2 z"/>
   <path class="d-flow-head" d="M274,130 L266,140.9 L260.6,130.2 z"/>
   ```
   (Head length 12, half-width 6, along the 27° directions of each line.)
2. **P2. The engineer isn't visibly outside the loop (lines 42–43).** The "engineer: reads
   nothing" panel floats above the agent like a fourth node, so the diagram's one point
   (nobody human is in the loop) needs the caption to land. Connect it and say so:
   ```html
   <path class="d-line" d="M350,60 L350,90"/>
   <text class="d-edge" x="358" y="79">out of the loop</text>
   ```
   15 characters at about 6.6px is 99px (358–457), clear of "600 words" at y=110.
3. **P3. Bar chart title wraps to two lines on mobile (line 55).** 98 characters. Shorter,
   same facts: `:::bar-chart[Example: team reading hours a week, 600-word posts, 40 readers]`.
4. **P3. Give the extra zero a bar.** The copy says four such engineers cost a -10x
   engineer; the chart stops at 100. Add a reference row so the comparison is visible:
   `-10x engineer (essay) | 400 | neutral`. The other bars shrink to a quarter width, which
   is the point.
5. **P3. Mobile H1 is three lines and long (58 characters).** Fine on desktop. If you trim,
   "How to Be a -100x Engineer: Let the Agent Read for You" saves a word without losing the
   claim. Optional.

Hierarchy: H1, deck and byline work; on desktop the first four lines of the opening show
above the fold (first line at y=675, the 3-line H1 costs one line).

## Delight ideas (cheap, crash-test)

- **The three questions as a crash checklist.** After "The wall of text", a `:::note`
  with three lines, "1. What did you do? 2. Why? 3. What was it worth?", titled
  "The three-question crash test". It's the line readers will screenshot.
- **"Passenger: not in vehicle."** Change the panel label in line 43 to
  `engineer: not in vehicle` (23 characters, fits the 150px panel with 6px spare per side
  at 11px). It's the crash-test version of "reads nothing".

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
