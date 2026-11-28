# Design review: Adding AI Agents to a Late Project Makes It Later

Reviewed 2026-11-21 from a production build (`npm run build && npm run preview`), at
1280×800 and 375×812 in light and dark. Screenshots: `qa/crops/` (`*-fold.png` is the
first screen, `*-full.png` the full page, plus crops of each diagram, chart, table, code
and compare block). Line numbers refer to `index.md` as of this review.

## Post issues

1. **P1. The "human" label is invisible in light mode (line 64).** The text has
   `class="d-text-sm d-on-fill"`. In `layout.css`, `.diagram .d-text-sm` (line 1082) is
   declared after `.diagram .d-on-fill` (line 1062) with the same specificity, so its
   `fill: var(--ink-2)` wins: dark grey on the green fill. It's readable in dark mode only
   by luck. Drop `d-text-sm` and match the panel title ("1 reviewer"), widening the box
   for the longer word:
   ```html
   <rect class="d-fill" x="474" y="152" width="92" height="36" rx="6"/>
   <text class="d-on-fill" x="520" y="175" text-anchor="middle">reviewer</text>
   ```
   "reviewer" at 12.5px is about 56px, leaving 18px a side. The nearest agent nodes end at
   x=456 and start at x=584, so the box clears them.
2. **P2. Bar chart colours tell a different story from the copy (lines 37–40).** The copy
   compares 5 people with 8 (three late hires). The chart colours a plain count with a
   good → info → amber → bad ramp, so 3 people reads as "good" and 12 as "bad". Highlight
   the two bars the text uses:
   ```md
   3 people | 3 | neutral
   5 people | 10 | info
   8 people (5 + 3 late) | 28 | bad
   12 people | 66 | neutral
   ```
3. **P2. "same file" floats away from its curve (line 66).** The conflict curve runs from
   (598,229) round to (534,260); its right edge is at about x=599, y=245, but the label is
   centred at x=640, so it reads as a stray note. Anchor it to the curve:
   ```html
   <text class="d-edge" x="608" y="250">same file</text>
   ```
   9 characters, about 59px (608–667), inside the 700 viewBox.
4. **P3. The star looks simpler than the mesh.** At a glance, 6 lines beat 10, which is
   the opposite of the point, and there's no free wedge around the hub for a label. Put
   the load in the note under the star instead (line 67):
   `<text class="d-text-sm" x="520" y="295" text-anchor="middle">6 PRs and 1 conflict, all on one desk</text>`
   (37 characters, about 222px, 409–631, same slot as the current note).
5. **P3. Two tips across the series say the same line.** This tip ("cut scope before you
   add anything that writes code") repeats the manager post's +1x bullet word for word.
   Fine inside one post; across a series read back to back it shows. Reword one.

Hierarchy is good: a 2-line H1 that is itself the claim, and the opening is fully above
the fold on desktop (first line at y=618). The mesh-vs-star diagram is the right picture
for this post.

## Delight ideas (cheap, crash-test)

- **Impact zone on the reviewer.** A ring around the hub marks where the load lands:
  `<circle class="d-panel" cx="520" cy="170" r="54"/>` plus
  `<text class="d-edge" x="505" y="100" text-anchor="end">impact zone</text>`
  (r=54 clears the widened box corners at 49px and the agent nodes, whose edges are 76px
  out; the label sits left of the vertical spoke at x=520 and above the node at 442,125).
- **Count the lines per head.** Under the mesh, change the note (line 54) to
  `4 lines per person, shared` (shorter than the current text, so no new collisions); with
  issue 4 the two notes read as a pair.

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
