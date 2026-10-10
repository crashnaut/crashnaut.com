import { describe, expect, it } from "vitest"
import {
  MAP,
  codeSamples,
  gaugeNeedle,
  hashString,
  impactMap,
  minLabelGap,
  ribbonLabel,
  ribbonSegments,
  sectionWordCounts,
  shortenTitle,
  sigilModel,
  sigilSvg,
  topLevelBlocks,
  type MapPostInput,
} from "./post-signals.ts"

describe("hashString", () => {
  it("is FNV-1a 32-bit", () => {
    expect(hashString("")).toBe(0x811c9dc5)
    expect(hashString("a")).toBe(0xe40c292c)
  })
})

describe("sigil", () => {
  const sections = [120, 340, 80, 400]

  it("gives the same SVG for the same slug, every time", () => {
    const a = sigilSvg(sigilModel("cross-repo-playwright-ci", ["CI"], sections))
    const b = sigilSvg(sigilModel("cross-repo-playwright-ci", ["CI"], sections))
    expect(a).toBe(b)
    expect(a).toMatchSnapshot()
  })

  it("changes with the slug", () => {
    const models = ["a", "b", "c", "d", "e", "f"].map((slug) =>
      sigilSvg(sigilModel(slug, ["Playwright"], sections)),
    )
    expect(new Set(models).size).toBeGreaterThan(1)
  })

  it("ignores tag order and case", () => {
    expect(sigilModel("x", ["CI", "Playwright"], sections)).toEqual(
      sigilModel("x", ["playwright", "ci"], sections),
    )
  })

  it("has one ring per H2, clamped to 1–5, and one impact dot per H2", () => {
    expect(sigilModel("x", [], []).rings).toBe(1)
    expect(sigilModel("x", [], [10, 10, 10]).rings).toBe(3)
    const many = sigilModel("x", [], Array(9).fill(10))
    expect(many.rings).toBe(5)
    expect(many.dots).toHaveLength(9)
  })

  it("places dots at each section's share of the words", () => {
    const { dots } = sigilModel("x", [], [100, 300])
    expect(dots.map((d) => d.angle)).toEqual([45, 225])
  })

  it("uses only CSS variables by default", () => {
    const svg = sigilSvg(sigilModel("x", ["AI"], sections))
    expect(svg).not.toMatch(/#[0-9a-f]{3,6}|rgb|hsl/i)
    expect(svg).toContain("var(--signal)")
  })
})

describe("sectionWordCounts", () => {
  it("splits on H2 and skips code, HTML and fences", () => {
    const md = [
      "Intro words that don't count.",
      "## One",
      "alpha beta gamma",
      "```python",
      "## not a heading",
      "x = 1",
      "```",
      "### Sub still counts here",
      "## Two",
      '<figure class="diagram"><svg><text>skip me</text></svg>',
      "<figcaption>and this caption</figcaption></figure>",
      ":::bar-chart[Runs needed]",
      "4 flags | 16 | bad",
      ":::",
      ":::tip",
      "delta",
      ":::",
    ].join("\n")
    expect(sectionWordCounts(md)).toEqual([7, 1])
  })
})

describe("ribbon", () => {
  const html = [
    "<p>one</p>",
    '\n\t\t<h2 id="a">\n\t\t  <a href="#a" class="anchor">A</a>\n\t\t</h2>',
    "<ul><li>two</li></ul>",
    '<pre id="1"><code class="ts "><div class="line"><span>x</span></div></code></pre>',
    '<figure class="diagram"><svg viewBox="0 0 700 300"><path d="M0 0"/></svg><figcaption>c</figcaption></figure>',
    '<div class="custom-block tip"><div class="custom-block-title">Tip</div><p>t</p></div>',
    '<div class="compare-block"><div class="compare-col bad">b</div></div>',
    "<!-- TODO(mike) -->",
    "<p>end</p>",
  ].join("\n")

  it("finds top-level blocks only", () => {
    expect(topLevelBlocks(html)).toHaveLength(8)
  })

  it("merges consecutive prose and keeps everything else in order", () => {
    expect(ribbonSegments(html).map((s) => s.kind)).toEqual([
      "prose",
      "code",
      "diagram",
      "callout",
      "compare",
      "prose",
    ])
  })

  it("weights by estimated rendered height", () => {
    const [, code, diagram] = ribbonSegments(html)
    expect(diagram.weight).toBeGreaterThan(code.weight)
  })

  it("summarises the outline for screen readers", () => {
    expect(ribbonLabel(ribbonSegments(html))).toBe(
      "Post outline: 2 prose sections, 1 code block, 1 diagram, 1 callout, 1 comparison",
    )
  })
})

describe("codeSamples", () => {
  it("counts fenced blocks by short language name, most first", () => {
    const pre = (lang: string) => `<pre id="x"><code class="${lang} ">`
    const html = ["typescript", "ts", "python", "yml", "ts"].map(pre).join("")
    expect(codeSamples(html)).toEqual([
      { lang: "ts", count: 3 },
      { lang: "py", count: 1 },
      { lang: "yaml", count: 1 },
    ])
  })
})

describe("gaugeNeedle", () => {
  it("maps 0–20 minutes onto the coverage dial's half circle", () => {
    expect(gaugeNeedle(0)).toMatchObject({ x: 75, y: 190 })
    expect(gaugeNeedle(10)).toMatchObject({ x: 175, y: 90 })
    expect(gaugeNeedle(20)).toMatchObject({ x: 275, y: 190 })
    expect(gaugeNeedle(45)).toEqual(gaugeNeedle(20))
  })
})

describe("impactMap", () => {
  const post = (i: number, tag: string, outgoing: string[] = []) => ({
    slug: `post-${i}`,
    title: `A fairly long post title number ${i} about testing things`,
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    tags: [tag],
    readingMinutes: (i % 12) + 1,
    outgoing,
  })
  const tags = ["Playwright", "Testing Strategy", "AI", "BDD", "CI", "Nix"]
  const posts: MapPostInput[] = Array.from({ length: 15 }, (_, i) =>
    post(i, tags[i % tags.length], i ? [`post-${i - 1}`] : []),
  )

  it("is deterministic and ignores input order", () => {
    expect(impactMap(posts)).toEqual(impactMap([...posts].reverse()))
  })

  it("draws each link once", () => {
    const linked = [post(0, "AI", ["post-1"]), post(1, "AI", ["post-0"])]
    expect(impactMap(linked).edges).toHaveLength(1)
  })

  // Rendered text boxes are checked in tests/browser.test.ts.
  it("keeps neighbouring labels at least a line apart", () => {
    for (const n of [15, 40]) {
      const many = Array.from({ length: n }, (_, i) =>
        post(i, tags[i % tags.length]),
      )
      expect(minLabelGap(impactMap(many))).toBeGreaterThan(MAP.fontPx + 2)
    }
  })

  it("shortens long titles at a word boundary", () => {
    expect(shortenTitle("Short")).toBe("Short")
    const short = shortenTitle(
      "How to Run Preview Environments per PR With a Fixed Pool of Slots",
    )
    expect(short.length).toBeLessThanOrEqual(MAP.labelChars)
    expect(short).toBe("How to Run Preview…")
  })
})
