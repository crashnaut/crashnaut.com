# crashnaut house style

How posts on crashnaut.com sound and look. Agents: read this before writing or editing
any post. It sits alongside [`EDITORIAL-PLAYBOOK.md`](EDITORIAL-PLAYBOOK.md) (process and
slots) and [`../AGENTS.md`](../AGENTS.md) (repo rules).

## 1. Voice

This section is drawn from Mike's pre-AI writing in `~/Projects/writing-archive`: a
physics final-year report on magnetic bearings (DCU, 2012), an MBA dissertation
backtesting the Coppock Indicator on the Bovespa (2017), MBA reports, and his study notes.
That's about 52,000 words. The quotes below are verbatim. When in doubt, read
`DCU/Final Year Report/Final Year Report.tex` and `MBA/Dissertation/Dissertation.tex`.
His own notes on style and his raw article ideas are in his private notes (`~/logseq`),
outside this repo.

Mike writes like an engineer reporting on an experiment: define the thing, lay out the
options, measure, say what went wrong, then give a verdict. The writers he wants to sound
like are Richard Feynman for humour and wit, Scott Adams for sentences (§2), and
Alejandro Jodorowsky and Moebius for the size of the ideas.

- **Define before you use.** A term gets one plain sentence before anything is built on
  it. The bearing report opens "A bearing is a device to allow constrained relative motion
  between two or more parts", then lists the types. Do the same for idempotency, a
  fixture or a flaky test.
- **Lay out the options, then pick for this case.** List the kinds (bearing types,
  leadership styles, the three forms of market efficiency), give each its trade-off, then
  narrow with "In the case of…" to the one that fits. Give advantages and disadvantages
  their own sentences. A table of adjectives explains nothing.
- **Ground the abstract in something ordinary.** "For some applications this would not
  matter, taking a hand held screwdriver as an example, which only operates for a few
  seconds at a time." One concrete example per idea beats three abstract ones.
- **Put a number on it, then say what it shows.** Real figures with units and a period:
  87% over 1921–2001, 3000 rpm, 13 months. Follow the number with what it illustrates:
  "This illustrates that the sell signal using the Coppock Indicator alone can cause for
  missed opportunities."
- **Cost it with a counterfactual.** "Had the purchase been in January 2009, the ROI
  would have been 55.05%." Show the price of a choice by working out the other branch:
  the bug that would have shipped, the minutes a parallel run would have saved.
- **Report failures plainly.** "This is the first false buy signal produced by the
  Coppock Indicator." "This data was not used and the experiment was ran a second time."
  "The team at that stage then began to slowly die." Say what broke without softening it,
  and don't hide a bad run.
- **State assumptions, rank the causes.** Name what the model assumes (the bearing
  simulation assumed the rotor never tilts), then rank the explanations: "The most
  plausible cause for this early response is the combination of causes mentioned above".
  "Likely" and "most plausible" are honest hedges. "Arguably" and "it could be said"
  dodge the question.
- **Weigh the evidence, cite by number.** Set the findings against each other and say
  what survives: the efficient market hypothesis "is a half truth" because it explains
  most behavior but not the crashes. One source rarely settles a question. Mike hates
  author names and links in the middle of prose ("it makes them unreadable"), so the
  claim carries a number like [2] and the source goes in the list at the end (§5). Name
  a person only when they are the subject, such as Earnshaw's theorem or Hyrum's law.
- **End with a verdict and what to test next.** The reports close on a decision (don't
  outsource Tesla's information systems; Dublin over Kerry) and a "Suggestions for Future
  Research" list. A post ends on what to do and what's still open. Skip the recap.
- **Rules of thumb, with the threshold and the reason.** His working notes read: "Selling
  gets cash immediately, but there is no going back." "Keep a cash balance safety margin
  of 5% of net revenue projection." "Low price alone won't attract consumers." Use that
  register for checklists and `:::tip` lines.
- **Simple frameworks over clever ones.** The HR report's fix is a regular check-in on
  "what has improved or helped them, what has slowed them down, and what has stopped them
  entirely", called "a simple framework to implement". Prefer the plain mechanism.
- **Credit people specifically.** "I doubt it would have been possible to have done any
  experiments without his help." Name the help and what it made possible. Criticism stays
  anonymous ("one of the group members"), never at a named person's expense.
- **Feynman's wit: see the thing plainly, then say it plainly.** Mike loved the
  introduction to the Feynman Lectures, which opens on a thought experiment: "If, in some
  cataclysm, all of scientific knowledge were to be destroyed, and only one sentence
  passed on to the next generations of creatures, what statement would contain the most
  information in the fewest words?" Later he calls a person "a great glob of these atoms
  in a very complex arrangement". The humour comes from describing something exactly,
  in homely words, with obvious delight. A real thought experiment can open a post. The
  throwaway "Why does it matter? Because…" stays banned (§3).
- **Humour comes from real material.** An apt quote, a heading like "Dart-Throwing
  Monkeys", the bank robber who thought lemon juice made him invisible to cameras. It's
  found, never a forced wisecrack. When it lands, the word choice does the work:
  "swill", not "drink" (see §2).
- **Blunt, irreverent labels.** His raw article ideas read: the "4 Horsemen" of bad
  meetings, "Good bye defect reports. Good bye reproduction steps", the CFC underwriters
  who "replied via email (like normal human beings)". Give the enemy a memorable name
  and list its symptoms. That bluntness belongs in posts, aimed at practices, never at
  named people. Posts stay clean: "bad meetings" makes the point.
- **Go for the large idea.** Mike wants the scope he loves in Jodorowsky and Moebius:
  beauty, depth, big ideas and real psychology. Testing has big ideas underneath it, such
  as risk, trust, loss aversion, overconfidence and the division of labor. The
  dissertation tied a trading indicator to the timescale of grief. Where it's honest, tie
  the test-suite problem to how people think and decide. Don't inflate a small tip. Their
  mature themes stay in the book and graphic novel reviews, never in testing posts.
- **First person, from real work.** "I", "my team", "the suite I inherited". Never invent
  an anecdote, client, number or result. If an example is illustrative, say so ("say a
  checkout service with…").
- **Plain connectives.** He links ideas with "However", "So", "Looking at…", "This
  means…", never with a run of fragments.
- **Brackets clarify.** They hold an example or a definition: "(such as the steel balls
  in the ball bearing)", "(The load is carried by a gas or liquid)". Semicolons are rare
  and em dashes almost absent: 3 in 52,000 words.
- **US spelling, contractions in moderation.** The archive is British because Irish and
  UK universities required it. The blog uses US spelling. Product names exactly as their
  vendors write them: Playwright, GitHub Actions, pytest, PostgreSQL, Stripe.
- **Tables and lists when the content is a list.** Prose when it's an argument.

**Don't carry over from the archive.** It's academic writing, and some habits don't
belong on a blog:

- Signposting: "This section will explore…", "will be elaborated on within the
  methodology section", "Please see page…". Just start.
- Passive voice and "the author": "it was decided", "a protocol of meetings was
  established". Say who did it, usually "I" or "we".
- Filler intensifiers: essential, imperative, key, crucial, vital. Show why it matters
  instead.
- Cover-letter register: "swift learner", "add great value", "bring a fresh perspective".
- Typos and agreement slips ("it's" for "its", "was ran"). Quote them as written, but
  never write them.
- Long sentences. The archive's median sentence is about 20 words, and the quotes above
  run longer. They show what to say. §2 says how to say it.

## 2. Sentences: Scott Adams's rules

The model for sentences is Scott Adams, whose writing Mike admires. His short post on
business writing boils it down to: "Business writing is about clarity and persuasion. The
main technique is keeping things simple." The archive (§1) decides what a post argues.
These rules decide how each sentence reads.

- **Simple persuades.** "A good argument in five sentences will sway more people than a
  brilliant argument in a hundred sentences." If a section makes its point in five
  sentences, stop at five.
- **Prune.** "Don't write, 'He was very happy' when you can write 'He was happy.'" Cut
  very, really, quite, actually, basically, simply, in order to, the fact that. Cut any
  word whose removal doesn't change the meaning.
- **Short sentences, one thought each.** Aim for 8–18 words. If a sentence has an "and"
  or a "which" joining two ideas, split it. A sentence over 25 words needs a reason.
- **Subject, then action.** "Readers comprehend 'the boy hit the ball' quicker than 'the
  ball was hit by the boy.'" Put the actor first: "The retry hid the race", not "The
  race was hidden by the retry." This rules out most passive voice.
- **The first sentence makes the reader curious.** Adams rewrote his "a dozen times".
  Open on the surprising fact, the cost or the failure. Context can wait. Rewrite it until
  someone who doesn't care about the topic would read the second sentence.
- **Pick the vivid word.** "For humor, don't say 'drink' when you can say 'swill.'" Use
  the concrete, physical verb when there is one: a flaky test "flaps", a slow suite
  "crawls". Don't force it into every sentence.
- **Assume a busy reader.** "Readers aren't as smart as you'd think." Adams means busy,
  not stupid. Spell out the step you'd skip for a colleague.

When a sentence passes the §1 test (defined, measured, honest) but fails these, keep the
argument and rewrite the sentence.

## 3. Banned: the tells of generated text

Rewrite any sentence that does one of these.

**Punctuation**

- Em dashes (—) and spaced hyphens used as dashes (" - "). Use a full stop, comma, colon
  or brackets instead. En dashes in number ranges (3–5, 2025–2026) are fine.
- Exclamation marks for emphasis. Interrobangs. Emoji in prose or headings.

**Sentence shapes**

- "It's not X, it's Y." "X isn't just A, it's B." "This isn't about A. It's about B."
  "Not only… but also…". State the positive claim directly.
- The reverse frame, "It's Y, not X" and "Y, not X" tacked onto a sentence, used for
  rhythm. Mike's notes single out both shapes, with the dash, as what makes a LinkedIn
  article "a pain to read". A do/don't pair in a `:::compare` block is fine.
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

- Links in body prose, internal or external, and "As Jane Doe argues…". Cite with [n]
  (§5).
- Bold scattered through paragraphs. Bold at most one phrase per section, for the claim.
- Headings that are all questions, or all "The X of Y".
- Bullet lists of one-word items with colons ("**Speed:** faster").

## 4. Diagrams

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

## 5. Facts and code

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

**Citations and links (DCU style).** Mike's DCU reports cite with numbers and keep every
source in a list at the end. New posts do the same. Published posts keep their inline
links until they are refreshed (playbook prompt D), so don't convert them unasked:

- Mark the claim with a bracketed number after the sentence's full stop or at the end of
  the clause: `…in 13 months [2].` Number sources in order of first use, and reuse a
  number when you cite the same source again.
- Keep author names, publication names and URLs out of the prose. The claim stands on
  its own; the number points to who said it.
- End the post with `## Sources`, an ordered list in the same order:
  `1. Organization or author, "Title", Site, date. <URL>`. This is the only place a URL
  appears.
- Write `[2]` (or `[1, 3]` for several) as plain text. The site renders it as a
  superscript link to the source, and the source links back to its first citation
  (`src/lib/citation.ts`). Never add a `[2]: https://…` reference definition, because
  marked would turn the number into an ordinary link.
- Sources must be an ordered list (`1.`, `2.`, …) so the numbers line up. `npm run
lint:posts` fails a post that cites a number with no matching source or puts links in
  the body, and warns about unused sources or numbers out of first-use order.
- Internal links go in the closing "Related" line, just above Sources. Don't put them in
  the middle of a paragraph. The site adds related posts and the hire-me CTA on its own.
- Code, commands and file names stay in backticks in the prose. They aren't citations.
