# Design review: How to Be a -10x Product Owner When Code Is Cheap

Reviewed 2026-11-21 from a production build (`npm run build && npm run preview`), at
1280×800 and 375×812 in light and dark. Screenshots: `qa/crops/` (`*-fold.png` is the
first screen, `*-full.png` the full page, plus crops of each diagram, chart, table, code
and compare block). Line numbers refer to `index.md` as of this review.

## Post issues

1. **P2. The curve labels read as three unrelated captions (lines 28, 30–31).** "with
   agents: the ends" sits over the left hump and "get heavier" 420px away over the right
   one, so readers see two fragments, and neither says which line is which. Label each
   line directly:
   ```html
   <text class="d-edge" x="350" y="58" text-anchor="middle">before agents</text>
   <text class="d-edge" x="140" y="108" text-anchor="middle">with agents</text>
   <text class="d-edge" x="560" y="108" text-anchor="middle">with agents</text>
   ```
   The thick curve peaks near y≈121 at x≈150 and x≈550, so the labels sit about 13px
   above it; the thin curve is near y≈190 at those x values. "with agents" is 11
   characters, about 73px (104–177 and 524–597).
2. **P2. No axis says what is being plotted.** The x labels name phases, but nothing says
   the height is effort. Add a rotated y label left of the curves (they start at x=40):
   ```html
   <text class="d-text-sm" x="24" y="160" text-anchor="middle" transform="rotate(-90 24 160)">effort</text>
   ```
3. **P3. "agent does this" box is tight under the trough (lines 32–33).** The box top
   (y=200) sits about 8px under the thick curve's lowest point. Move it down 6px:
   `y="206"` on the rect and `y="224"` on the text; it still clears the axis at y=240.
4. **P3. The +1x section is the only one without a visual or a lead-in sentence.** Five
   bullets right after the H2. One sentence first ("The fix is mostly writing, and it's
   all on the left of the curve:") ties it back to the diagram.

The compare block is the strongest thing on the page: the concrete EUR example against
three quoted one-liners makes the point without prose. Opening is above the fold on
desktop (first line at y=618).

## Delight ideas (cheap, crash-test)

- **Owners under the ends.** Under the phase labels add who pays:
  `<text class="d-text-sm" x="140" y="282" text-anchor="middle">owner: product owner</text>`
  and `<text class="d-text-sm" x="560" y="282" text-anchor="middle">owner: QA + product</text>`
  (viewBox height is 300, labels at y=265 above). The PO sees their name on the heavy end.
- **The refund example as a ledger strip.** In the compare block, set the example as
  inline code so the numbers line up: `captured 100.00 EUR → refund 30.00 → refund 70.00 → refund 0.01 ✗`.

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
