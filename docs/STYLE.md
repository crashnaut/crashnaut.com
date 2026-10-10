# crashnaut house style

How posts on crashnaut.com sound and look. Agents: read this before writing or editing
any post. It sits alongside [`EDITORIAL-PLAYBOOK.md`](EDITORIAL-PLAYBOOK.md) (process and
slots) and [`../AGENTS.md`](../AGENTS.md) (repo rules).

## 1. Voice

Mike writes like his working notes: short, practical, first person, a bit dry.

- **Plain words and short sentences.** Say the thing, then show it. "Staging doesn't
  return the same response as prod" beats "Environment parity issues can introduce subtle
  discrepancies".
- **Honest asides in brackets.** "(This comes from experienced automators, not from a best
  practice guide.)" "(Solves the problem for now.)" Admit trade-offs and hacks.
- **First person, from real work.** "I", "my team", "the suite I inherited". Never invent
  an anecdote, client, number or result. If an example is illustrative, say so ("say a
  checkout service with…").
- **Dry humour, used sparingly.** One good line per section at most. Never at a named
  person's expense.
- **Opinions with reasons.** "I don't use BasePage, because…" and not "Some teams prefer…".
- **US spelling, contractions are fine.** Product names exactly as their vendors write
  them: Playwright, GitHub Actions, pytest, PostgreSQL, Stripe.
- **Tables and lists when the content is a list.** Prose when it's an argument.

## 2. Banned: the tells of generated text

Rewrite any sentence that does one of these.

**Punctuation**

- Em dashes (—) and spaced hyphens used as dashes (" - "). Use a full stop, comma, colon
  or brackets instead. En dashes in number ranges (3–5, 2025–2026) are fine.
- Exclamation marks for emphasis. Interrobangs. Emoji in prose or headings.

**Sentence shapes**

- "It's not X, it's Y." "X isn't just A, it's B." "This isn't about A. It's about B."
  "Not only… but also…". State the positive claim directly.
- "Here's the thing", "Here's the part…", "Here's why", "The truth is", "Let's be honest".
- Rhetorical question followed by its own answer ("Why does this matter? Because…").
- Dramatic fragments ("Three flags. Three!", "Every. Single. Time.").
- Reflexive groups of three ("fast, reliable, and maintainable") used for rhythm rather
  than because there really are three things.
- Mirror-image sentence pairs and tidy aphorism endings ("Test the boundary, trust the
  core.") unless it really is the takeaway, and then only once, in the `:::tip`.
- Openers that restate the title, and closers like "In conclusion", "The bottom line",
  "At the end of the day", "Happy testing".

**Vocabulary**

delve, leverage (as a verb), robust, seamless(ly), crucial, pivotal, landscape, realm,
ecosystem (unless literal), tapestry, journey, elevate, unlock, empower, harness (unless
the test harness), navigate (unless UI navigation), game-changer, supercharge, streamline,
cutting-edge, best-in-class, myriad, plethora, utilize, foster, bustling, testament,
"in today's fast-paced world", "it's worth noting that", "when it comes to".

**Formatting**

- Bold scattered through paragraphs. Bold at most one phrase per section, for the claim.
- Headings that are all questions, or all "The X of Y".
- Bullet lists of one-word items with colons ("**Speed:** faster").

## 3. Diagrams

Diagrams are the house signature: the trees, flowcharts and charts in
[the feature-flag post](../blog/the-feature-flag-nightmare/index.md) are the reference.
Every post gets at least two visuals. At least one must be an SVG diagram, and the other
can be a bar chart or a compare block.

**Make them explain something.** A diagram earns its place by showing a mechanism the
prose can't: a call path with the mock boundary drawn on it, a timeline of a transaction
rolling back, a matrix of what runs where, a before/after of a pipeline. Don't draw a box
with the post title in it.

**Crash-test flavour where it fits:** impact zones, a test as a crash run (setup → impact
→ inspect), PASS/FAIL marks, a "flight recorder" log, hazard bands for risky areas,
swim-lanes for CI jobs, a dial or gauge for a threshold. Be inventive, but never at the
cost of clarity.

**Markup** (inline SVG, styled by `src/routes/layout.css`, works in both themes):

```html
<figure class="diagram">
  <svg
    viewBox="0 0 700 300"
    role="img"
    aria-label="One sentence describing what the diagram shows"
  >
    ...
  </svg>
  <figcaption>One or two sentences: what to notice.</figcaption>
</figure>
```

- Use only these classes and never hard-code colours. That's what keeps dark mode working.
  - Boxes: `d-box`, `d-box-green`, `d-box-red`, `d-box-amber`, and `d-panel` (an
    outline-only region).
  - Nodes: `d-node`, `d-node-green`, `d-node-red`.
  - Lines and arrows: `d-line` (thin connector), `d-flow` (thick main path), `d-arrow` and
    `d-flow-head` (arrowhead fills).
  - Text: `d-title` (18px bold), `d-text` (13px), `d-text-sm` (11px), `d-edge` (11px mono
    label on an edge), and `d-on-fill` (white text on a `d-fill` or `d-node-*` shape).
  - Fills: `d-fill` (green solid).
- `viewBox` width 600–720. Use `rx="4"`–`"6"` on boxes. Leave at least 12px padding
  inside boxes. Text is about 7px per character at 13px and 6px per character at 11px,
  so make boxes wide enough. Use `text-anchor="middle"` for centred labels.
- Arrowheads: draw a small `<path class="d-arrow" d="M x,y l -8,-4 l 0,8 z"/>` at the end
  of a line rather than `<marker>`, which doesn't pick up theme colours.
- No `<style>`, `<script>`, `<foreignObject>`, external images or fonts inside the SVG.
- The SVG must be valid XML. Check it with `python3 -c "import xml.dom.minidom,sys;
xml.dom.minidom.parseString(open(sys.argv[1]).read())" file.svg` on the extracted block.

**Other visual blocks**

```md
:::bar-chart[Title stating what's measured and in what unit]
Label | 42 | good
Label | 17 | bad
:::
```

Tones: `good`, `bad`, `amber`, `info`, `neutral`, `accent`. Add `log` after `bar-chart`
for a log scale. Numbers must be real and sourced, or clearly labelled as an example.

```md
:::compare
::do[Mock the HTTP boundary]
...markdown...
::dont[Patch your own repository class]
...markdown...
:::
```

Callouts: `:::tip`, `:::note`, `:::warning`, `:::danger`, `:::success`, each closed with `:::`.

**Computed visuals (no authoring needed)**

These are drawn from each post at build time by `src/lib/post-signals.ts`. They're
deterministic: the same post always gives the same output. They add no client-side
logic. You don't write them, but your structure feeds them, so headings and blocks
should be real ones.

- `CrashReport.svelte`: the flight-recorder strip in the post header, e.g. "Run 006 · 6
  zones · 9 samples (ts 6, py 2) · 3 diagrams · 1 compare". Zones are H2s, samples are
  fenced code blocks by language, diagrams are `figure.diagram` plus bar charts, compares
  are `:::compare` blocks.
- `brand/Sigil.svelte`: a per-post variant of the crash-test mark, seeded by an FNV-1a
  hash of the slug. Rings = H2 count (1–5). The wedge pattern depends on the seed and
  tags. One red impact dot per H2, at an angle set by that section's share of the words.
  It's shown in post rows (30px) and the post header (48px). `scripts/og.mjs` imports the
  same module for share cards.
- `PostRibbon.svelte`: the 6px strip in each post row, with one segment per top-level
  block (consecutive prose merges). Widths follow the estimated rendered height. Colours
  are prose = muted ink, code = `--info`, diagram = `--signal`, callout = `--warn`,
  compare = `--pass`.
- `ImpactMap.svelte`: "Map of the crash log" on `/blog`. Posts are dots sized by reading
  time and grouped by first tag around a ring. Lines are internal links. Every label is
  radial and owns one slot, so labels can't overlap; titles are cut at 28 characters.
  Below 600px it becomes a grouped list.
- `ReadingGauge.svelte`: the coverage dial from
  [the coverage post](../blog/coverage-is-a-health-signal/index.md), shrunk to sit by the
  byline. The needle shows reading minutes on a 0–20 scale.

Components follow the same colour rule as diagrams: CSS variables from
`src/routes/layout.css` only. The share cards in `scripts/og.mjs` are the one place
hex values are allowed.

## 4. Facts and code

- Fetch the official docs for every API, flag, config key and version you mention, and
  check it today. If you can't verify it, cut it or mark it `<!-- TODO(mike): verify … -->`.
- Mike's primary language is **TypeScript** (Playwright, Node services). Write new
  examples in TypeScript by default. **Python + pytest**, **GraphQL** and **Neo4j** are
  trends worth covering: use them when the topic is about them, and add a short
  TypeScript equivalent where it helps. Don't recommend BDD/Gherkin as a default;
  mention it only for teams that need it.
- Keep the stack the draft was written in (it reflects real work), and name it in the
  opening paragraph. Don't switch languages unless asked.
- Code blocks have a language and, where useful, a file name: ` ```ts:tests/checkout.spec.ts `.
