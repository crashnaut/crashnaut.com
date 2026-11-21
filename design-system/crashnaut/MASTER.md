# Crashnaut design system: MASTER

Step 1 of the redesign on `design/skills-redesign`. Generated with **UI UX Pro Max**
(`--design-system`, plus `landing`, `typography` and `color` searches) and adjusted to
Mike's brief (2026-11-20):

- **Keep the idea, change the look.** The crash-test concept and name stay. The current
  surface (hazard stripes, fake terminal hero, yellow-on-near-black) is the record of
  what to move away from.
- **Hiring managers and clients come first.** The home page is in _Persuade_ mode;
  the blog index and posts are in _Read_ mode and must not regress.

This file sets the **structure** (grid, spacing, type scale, token roles, rules).
Palette and font choices are deliberately left open; step 2 (Frontend design) fills them
in below under "Aesthetic direction". Page files in `pages/` override this file.

## What the database recommended, and what we kept

| Area            | Tool output                                                                                      | Decision                                         |
| --------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Style           | Swiss Modernism 2.0 (grid system, modular, asymmetric, rational spacing); a11y risk low          | **Kept** as the structural spine                 |
| Landing pattern | Trust & Authority + Conversion: Hero (credibility) > Proof > Solution > Clear CTA                | **Kept** for the home page                       |
| Color           | Editorial black + pink accent; or code-dark + endpoint green; or industrial grey + safety orange | **Rejected**: generic, off-brand. Left to step 2 |
| Type            | Libre Bodoni / Public Sans; JetBrains Mono / IBM Plex Sans; Archivo / Space Grotesk              | **Rejected** as defaults. Left to step 2         |
| Dials           | variance 7, motion 3, density 4                                                                  | **Kept**: bold layout, quiet motion, spacious    |

## Surfaces and modes

| Surface    | Route          | Mode     | Job                                                               |
| ---------- | -------------- | -------- | ----------------------------------------------------------------- |
| Home       | `/`            | Persuade | A FinTech hiring manager decides to book a call within one screen |
| Blog index | `/blog`        | Read     | Find a post                                                       |
| Post       | `/blog/[slug]` | Read     | Read 900–1,800 words comfortably; code, diagrams, sources         |
| Contact    | `/contact`     | Operate  | Reach Mike with no friction                                       |

### Home section order (Trust & Authority + Conversion)

1. **Hero:** the claim, who it's for, one primary CTA (book a call), one secondary.
2. **Proof:** real numbers and named outcomes, not a simulated terminal.
3. **Solution:** the three services, scannable.
4. **Writing:** latest posts, as evidence of expertise.
5. **Closing CTA:** repeats the primary action.

CTA placement: primary in the hero and the closing section; a quiet "Work with me" in the nav.

## Grid and layout

- 12-column grid, `--page: 72rem` max width, `clamp(1rem, 4vw, 2rem)` gutters; 16px
  minimum side gutter on phones.
- Asymmetric splits are allowed (7/5, 8/4); content never centres by default.
- Reading measure: 60–70ch for post body.
- Breakpoints checked: 320, 375, 768, 1024, 1440. No horizontal scroll at any of them.

## Spacing (density 4)

| Token         | Value   | Use                                    |
| ------------- | ------- | -------------------------------------- |
| `--space-xs`  | 0.25rem | Tight gaps                             |
| `--space-sm`  | 0.5rem  | Icon and inline gaps                   |
| `--space-md`  | 1rem    | Standard padding                       |
| `--space-lg`  | 1.5rem  | Block padding                          |
| `--space-xl`  | 2rem    | Large gaps                             |
| `--space-2xl` | 3rem    | Section margins                        |
| `--space-3xl` | 4rem    | Hero padding                           |
| `--space-4xl` | 6rem    | Persuade-mode section rhythm (desktop) |

## Type scale

A modular scale, fluid between 375px and 1440px. Body is never below 16px.

| Token       | Size             | Use                    |
| ----------- | ---------------- | ---------------------- |
| `--step--1` | ~0.875rem        | Meta, captions, labels |
| `--step-0`  | 1rem → 1.0625rem | Body                   |
| `--step-1`  | ~1.25rem         | Lede, H4               |
| `--step-2`  | ~1.563rem        | H3                     |
| `--step-3`  | ~1.953rem        | H2                     |
| `--step-4`  | ~2.441rem → 3rem | Post H1                |
| `--step-5`  | ~3rem → 4.5rem   | Home hero only         |

Body line height 1.6–1.7; headings 1.05–1.2. Numerals: tabular in data, proportional in prose.

## Token roles

Components use roles, never raw hex. Values are set in step 2.

`--bg`, `--surface`, `--surface-2`, `--ink`, `--ink-2`, `--ink-3`, `--line`,
`--accent` (brand), `--on-accent`, `--accent-text` (accent used as text, must pass 4.5:1),
`--pass`, `--fail`, `--warn`, `--info` (status semantics only: test results, callouts),
`--focus`.

Light and dark themes both ship; each pair of roles must pass WCAG AA in both.

## Motion (motion 3)

- Micro-interactions only: 150–250ms, ease-out; exits faster than entries.
- Animate `transform` and `opacity` only.
- No scroll-jacking or parallax. Everything renders in its final state under
  `prefers-reduced-motion`.

## Accessibility floor (priority 1–2, CRITICAL)

- Text contrast ≥ 4.5:1 (≥ 3:1 for ≥ 24px text and UI boundaries), light and dark.
- Visible focus ring on every interactive element; never removed.
- Touch targets ≥ 44×44px with ≥ 8px between them.
- One `h1` per page; headings in order; landmarks (`header`, `nav`, `main`, `footer`).
- Icons are SVG with labels or `aria-hidden`; no emoji as icons.

## Anti-patterns for this site

- Hazard-stripe dividers and fake terminal/test-runner UI as decoration.
- Pill/chip clusters as the main way to show tags.
- Status dots and "telemetry" micro-labels on every block.
- Yellow highlighter on headline words.
- Generic SaaS gradients, glassmorphism, card grids with identical drop shadows.

## Pre-delivery checklist

- [ ] No emoji as icons
- [ ] Hover and focus states on every interactive element (150–300ms)
- [ ] Light and dark: text contrast ≥ 4.5:1
- [ ] Keyboard: visible focus, logical order
- [ ] `prefers-reduced-motion` respected
- [ ] 320 / 375 / 768 / 1024 / 1440: no horizontal scroll

## Aesthetic direction

Step 2, **Frontend design**. Concept: **the test wall.** In a crash lab, the car hits in
front of a white wall with a measurement grid, and yellow-and-black quadrant targets
mark the points the high-speed cameras track. The site borrows the wall, not the
terminal: the hero is the grid, the headline is the subject, and the quadrant target
(already the logo) is the one bold graphic, cropped off the edge at the point of impact.

### Palette

| Name            | Light     | Dark      | Role                                          |
| --------------- | --------- | --------- | --------------------------------------------- |
| Test wall       | `#ECEEF0` | `#0F1E33` | Hero background (`--bg` in the hero)          |
| Paper           | `#FFFFFF` | `#14263F` | Page and card surface                         |
| Grid            | `#C7CDD3` | `#1F3352` | 20px measurement grid, hero only              |
| Instrument navy | `#0F1E33` | `#EEF1F4` | Ink: headings, body, rules                    |
| Target yellow   | `#FFC400` | `#FFC400` | The target mark and the primary CTA fill only |
| Impact red      | `#C8102E` | `#FF5A6E` | `--fail` only                                 |

The target mark is always yellow and navy in both themes: it's a real-world object.

### Type

| Face                                       | Role                             | Why                                                                                                    |
| ------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Barlow Condensed** 600/700               | Display: H1–H3, the wordmark     | Grotesk modelled on highway and industrial signage, the same lineage as the DIN lettering on test rigs |
| **Barlow** 500/600                         | UI: nav, buttons, labels, tables | Same family, so UI and display agree                                                                   |
| **Source Serif 4** 400/600 (optical sizes) | Body and lede                    | Long-form reading; a clear contrast with the condensed display                                         |
| **IBM Plex Mono** 400                      | Code blocks only                 | Kept from the current site; never used for labels                                                      |

All self-hosted with `@fontsource`. Headline: sentence case, no single-word accent,
line height 0.92, `text-wrap: balance`.

### Layout

```
DESKTOP HOME                                  MOBILE
┌ nav ─────────────────────────────────────┐  ┌ nav ────────────┐
│░░ grid wall ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  │░ grid wall ░░░░░│
│░ I crash-test FinTech         ◐ target ░│  │ I crash-test    │
│░ software before your         (cropped ░│  │ FinTech before  │
│░ customers do.                off edge)░│  │ your customers  │
│░ lede (6 cols)                         ░│  │ lede            │
│░ [Book a 30-min call] [Read the log]   ░│  │ [Book a call]   │
│▀▀▀▀▀▀▀▀▀▀▀▀ 3px navy impact line ▀▀▀▀▀▀▀▀│  │ [Read the log] ◐│
│ What I test  │ suite │ suite │ suite     │  │▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│
│ (4 cols)     │ (8 cols, ruled table)     │  │ What I test     │
│ Latest writing: plain list, no cards     │  │ suites stacked  │
│ closing CTA                              │  └─────────────────┘
└──────────────────────────────────────────┘
```

Left-aligned throughout. Blog and posts use Paper with no grid; the post title block
gets a narrow grid strip so the world carries through without hurting reading.

### Principles

1. **One bold thing:** the wall and its target. Everything else is quiet: paper, navy, serif.
2. **Structure is real:** rules separate real groups (suites, sources); there are no
   eyebrow labels, telemetry strings, status dots or arrows on links.
3. **Yellow means "act":** it's used only for the target and the primary CTA.
4. **Rendered, not simulated:** proof is real copy and real numbers, never a fake terminal.

### Checked against the generic defaults

- _Near-black with one bright accent_ is the current site. The new site defaults to
  light, and its dark theme is navy rather than black.
- _Mono micro-labels, middle-dot meta strings, arrows on links_: removed everywhere.
- _A broadsheet grid of hairlines_: the grid appears only in the hero and stands for a
  physical object, the test wall.
- _Pairing a serif and a sans_: kept, because the condensed display and the serif body
  have separate, clear jobs.

### Mock findings (fixed in the build)

- The lede has no background box or halo; it sits directly on the grid.
- On mobile, half the target sits on the right edge beside the CTAs.
- The 100px major grid lines are lighter than in the mock.
- The target keeps its yellow and navy in dark mode; a light ring (`--target-ring`)
  separates it from the navy wall.

## Decisions from step 3 (Impeccable critique and polish, 2026-11-20)

Critique: home 24/32, blog 27/40, post 28/40. Mike chose: use the blog as proof, remove
the post-header signals, and polish everything, including the minor findings.

- **Proof uses only figures quoted from published posts**, each linking to the post
  that sources it (TSB fines, 1,024 → 6 pairwise runs, five parts of an integration
  test). Replace them with Mike's own outcomes when he supplies them.
- **Post header:** breadcrumb, title, deck, byline, tags and the TL;DR toggle. The
  CrashReport strip, ReadingGauge and sigil card are gone from the header; the
  components remain in `src/lib/` unused, in case they come back on a colophon page.
- **One left edge per page.** `--measure` is in rem (40rem), so the post header and the
  prose line up even though they sit at different font sizes.
- **Pages that end on the wall** (home and 404) run straight into the footer.
- **Blog index:** 8-column list plus a Topics column (the top 8 tags, expandable),
  filtering in place. Post titles are h3 under a visually hidden h2.
- **Below 1100px**, the sticky contents become a collapsed "On this page" list.
- **Yellow:** list sigils are single-color, and map nodes are paper and navy. Yellow
  remains in the mark, the hero target, the primary CTA, the tip callout and code-line
  highlights.
- **No side bars:** callouts have a full border and a tint, and the contact steps are
  ruled columns rather than cards.
- **Intentional exception:** `.diagram .d-text-sm` stays at 11px (viewBox units). 12px
  made labels collide in four post diagrams, measured.
- `.telemetry` is renamed `.meta`. `.hazard` and `.status-dot` are deleted.
