// Deterministic, build-time "signals" derived from a post's source and HTML.
// Shared by the site (src/routes/blog/_posts.ts) and the share cards
// (scripts/og.mjs, which imports this file directly), so keep it free of
// runtime dependencies and of non-erasable TypeScript syntax.

export type BlockKind = "prose" | "code" | "diagram" | "callout" | "compare"

export interface RibbonSegment {
  kind: BlockKind
  /** Estimated rendered height in px at the desktop text column. */
  weight: number
}

export interface SampleCount {
  lang: string
  count: number
}

export interface PostSignals {
  zones: number
  samples: SampleCount[]
  sampleTotal: number
  diagrams: number
  compares: number
  /** Word count of each H2 section, in order. */
  sectionWords: number[]
  ribbon: RibbonSegment[]
  ribbonLabel: string
  /** Sigil SVG drawn with CSS variables; size it from the outside. */
  sigil: string
  gauge: GaugeNeedle
}

/** FNV-1a, 32-bit. Stable across runs, platforms and Node versions. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export const slugSeed = (slug: string) => hashString(slug)

const round = (n: number) => Math.round(n * 100) / 100

// ── Markdown: H2 sections ──────────────────────────────────────────

/**
 * Words per H2 section, read from the markdown body. Fenced code, diagrams
 * (whole figures, captions included), bar charts, HTML and block fences don't
 * count, so adding a visual never moves a post's sigil.
 */
export function sectionWordCounts(markdown: string): number[] {
  const lines = markdown.split("\n")
  const sections: string[][] = []
  let fence: string | null = null
  for (const line of lines) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line)
    if (fence) {
      if (
        fenceMatch &&
        fenceMatch[1][0] === fence[0] &&
        fenceMatch[1].length >= fence.length
      ) {
        fence = null
      }
      continue
    }
    if (fenceMatch) {
      fence = fenceMatch[1]
      continue
    }
    if (/^##\s/.test(line)) {
      sections.push([])
      continue
    }
    sections.at(-1)?.push(line)
  }
  return sections.map((body) => countWords(body.join("\n")))
}

function countWords(markdown: string) {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<figure[\s\S]*?<\/figure>/g, " ")
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/^:::bar-chart[\s\S]*?^:::\s*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^:::.*$/gm, " ")
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length
}

// ── HTML: top-level blocks ─────────────────────────────────────────

const VOID = new Set([
  "area",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
])

/** Splits rendered post HTML into its top-level elements, in order. */
export function topLevelBlocks(html: string): string[] {
  const blocks: string[] = []
  const tag = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g
  let depth = 0
  let start = -1
  let match: RegExpExecArray | null
  while ((match = tag.exec(html))) {
    const [whole, closing, name, selfClosing] = match
    if (whole.startsWith("<!--")) continue
    const isVoid = selfClosing === "/" || VOID.has(name.toLowerCase())
    if (closing) {
      depth--
      if (depth === 0 && start !== -1) {
        blocks.push(html.slice(start, match.index + whole.length))
        start = -1
      }
    } else if (isVoid) {
      if (depth === 0) blocks.push(whole)
    } else {
      if (depth === 0) start = match.index
      depth++
    }
  }
  return blocks
}

export function classifyBlock(block: string): BlockKind {
  if (/^<pre[\s>]/.test(block) || /^<div class="code-group"/.test(block)) {
    return "code"
  }
  if (/^<figure class="(diagram|bar-chart)"/.test(block)) return "diagram"
  if (/^<div class="custom-block/.test(block)) return "callout"
  if (/^<div class="compare-block"/.test(block)) return "compare"
  return "prose"
}

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, "x")
    .replace(/\s+/g, " ")
    .trim()

/**
 * Rough rendered height in px of one block in the ~680px desktop column.
 * Only the ratios matter: the ribbon is drawn proportionally.
 */
export function blockWeight(block: string, kind: BlockKind): number {
  const chars = textOf(block).length
  const lines = (perLine: number) => Math.max(1, Math.ceil(chars / perLine))
  switch (kind) {
    case "code": {
      const visible = block.includes('class="code-group"')
        ? (block.split(/class="code-group-code"/)[1] ?? block)
        : block
      return (visible.match(/class="line\b/g)?.length ?? 1) * 23 + 56
    }
    case "diagram": {
      const rows = block.match(/class="bar-row"/g)?.length
      if (rows) return rows * 34 + 60
      const box = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/.exec(block)
      const [w, h] = box ? [Number(box[1]), Number(box[2])] : [700, 300]
      const caption = /<figcaption>([\s\S]*?)<\/figcaption>/.exec(block)?.[1]
      const captionLines = caption ? Math.ceil(textOf(caption).length / 80) : 0
      return Math.round(h * Math.min(1, 650 / w)) + 40 + captionLines * 22
    }
    case "callout":
      return lines(75) * 27 + 60
    case "compare":
      return lines(70) * 26 + 80
    default:
      if (/^<h[1-6][\s>]/.test(block)) return 60
      if (/^<table[\s>]/.test(block)) {
        return (block.match(/<tr[\s>]/g)?.length ?? 1) * 40 + 24
      }
      if (/^<figure[\s>]/.test(block)) return 320
      return lines(85) * 29 + 24
  }
}

/** One segment per top-level block; consecutive prose merges into one. */
export function ribbonSegments(html: string): RibbonSegment[] {
  const segments: RibbonSegment[] = []
  for (const block of topLevelBlocks(html)) {
    const kind = classifyBlock(block)
    const weight = blockWeight(block, kind)
    const last = segments.at(-1)
    if (kind === "prose" && last?.kind === "prose") last.weight += weight
    else segments.push({ kind, weight })
  }
  return segments
}

const KIND_NAMES: Record<BlockKind, [string, string]> = {
  prose: ["prose section", "prose sections"],
  code: ["code block", "code blocks"],
  diagram: ["diagram", "diagrams"],
  callout: ["callout", "callouts"],
  compare: ["comparison", "comparisons"],
}

export function ribbonLabel(segments: RibbonSegment[]): string {
  const counts = new Map<BlockKind, number>()
  for (const s of segments) counts.set(s.kind, (counts.get(s.kind) ?? 0) + 1)
  const parts = (Object.keys(KIND_NAMES) as BlockKind[])
    .filter((k) => counts.get(k))
    .map((k) => {
      const n = counts.get(k) ?? 0
      return `${n} ${KIND_NAMES[k][n === 1 ? 0 : 1]}`
    })
  return `Post outline: ${parts.join(", ")}`
}

// ── Flight-recorder counts ─────────────────────────────────────────

const LANG_ALIASES: Record<string, string> = {
  typescript: "ts",
  javascript: "js",
  python: "py",
  yml: "yaml",
  bash: "sh",
  shell: "sh",
  zsh: "sh",
  text: "txt",
  markdown: "md",
}

export function codeSamples(html: string): SampleCount[] {
  const counts = new Map<string, number>()
  for (const [, raw] of html.matchAll(
    /<pre id="[^"]*">[\s\S]*?<code class="([^ "]*)/g,
  )) {
    const lang = LANG_ALIASES[raw] ?? (raw || "txt")
    counts.set(lang, (counts.get(lang) ?? 0) + 1)
  }
  return [...counts]
    .map(([lang, count]) => ({ lang, count }))
    .sort((a, b) => b.count - a.count || a.lang.localeCompare(b.lang))
}

export const countMatches = (html: string, pattern: RegExp) =>
  html.match(new RegExp(pattern.source, "g"))?.length ?? 0

// ── Sigil ──────────────────────────────────────────────────────────

export interface SigilPalette {
  face: string
  ink: string
  ring: string
  impact: string
}

export const CSS_PALETTE: SigilPalette = {
  face: "var(--signal)",
  ink: "var(--logo-ink)",
  ring: "var(--bg)",
  impact: "var(--fail)",
}

export interface SigilModel {
  sectors: number
  rotation: number
  parity: number
  rings: number
  /** Impact dots: which ring (1-based) and angle in degrees (0 = top). */
  dots: { ring: number; angle: number }[]
}

export function sigilModel(
  slug: string,
  tags: string[],
  sectionWords: number[],
): SigilModel {
  const seed = slugSeed(slug)
  const tagSeed = hashString(
    tags
      .map((t) => t.toLowerCase())
      .sort()
      .join("|"),
  )
  const sectors = [4, 6, 8][tagSeed % 3]
  const step = 360 / sectors
  const rotation = ((seed >>> 3) % 4) * (step / 4)
  const parity = (seed >>> 7) & 1
  const rings = Math.min(5, Math.max(1, sectionWords.length))

  const total = sectionWords.reduce((a, b) => a + b, 0)
  let cumulative = 0
  const dots = sectionWords.map((words, i) => {
    const share = total ? words / total : 1 / sectionWords.length
    const angle = round((cumulative + share / 2) * 360)
    cumulative += share
    return { ring: (i % rings) + 1, angle }
  })
  return { sectors, rotation, parity, rings, dots }
}

const polar = (r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return [round(16 + r * Math.cos(rad)), round(16 + r * Math.sin(rad))]
}

/** SVG in a 32×32 box, centred like brand/Mark.svelte. */
export function sigilSvg(
  model: SigilModel,
  palette: SigilPalette = CSS_PALETTE,
  size?: number,
): string {
  const R = 15
  const step = 360 / model.sectors
  const wedges: string[] = []
  for (let i = 0; i < model.sectors; i++) {
    if ((i + model.parity) % 2) continue
    const a = model.rotation + i * step
    const [x1, y1] = polar(R, a)
    const [x2, y2] = polar(R, a + step)
    wedges.push(
      `<path d="M16 16 L${x1} ${y1} A15 15 0 0 1 ${x2} ${y2} Z" fill="${palette.ink}"/>`,
    )
  }
  const ringRadius = (j: number) => round((R * (j + 1)) / (model.rings + 2))
  const rings = Array.from(
    { length: model.rings },
    (_, j) =>
      `<circle cx="16" cy="16" r="${ringRadius(j + 1)}" fill="none" stroke="${palette.ring}" stroke-width="0.75"/>`,
  )
  const dots = model.dots.map(({ ring, angle }) => {
    const [x, y] = polar(ringRadius(ring), angle)
    return `<circle cx="${x}" cy="${y}" r="1.7" fill="${palette.impact}" stroke="${palette.ring}" stroke-width="0.6"/>`
  })
  const dims = size ? ` width="${size}" height="${size}"` : ""
  return [
    `<svg viewBox="0 0 32 32"${dims} aria-hidden="true" focusable="false">`,
    `<circle cx="16" cy="16" r="15" fill="${palette.face}"/>`,
    ...wedges,
    ...rings,
    ...dots,
    `<circle cx="16" cy="16" r="15" fill="none" stroke="${palette.ink}" stroke-width="1.5"/>`,
    `</svg>`,
  ].join("")
}

// ── Reading-time gauge ─────────────────────────────────────────────

/** Same dial as the coverage gauges in blog/coverage-is-a-health-signal. */
export const GAUGE = {
  viewBox: "55 70 240 130",
  band: "M65,190 A110,110 0 0 1 285,190 L255,190 A80,80 0 0 0 95,190 Z",
  centre: [175, 190] as [number, number],
  needle: 100,
  max: 20,
}

export interface GaugeNeedle {
  x: number
  y: number
  /** The band from 0 up to the needle. */
  fill: string
}

export function gaugeNeedle(minutes: number): GaugeNeedle {
  const value = Math.min(GAUGE.max, Math.max(0, minutes))
  const theta = Math.PI * (1 - value / GAUGE.max)
  const [cx, cy] = GAUGE.centre
  const at = (r: number) =>
    `${round(cx + r * Math.cos(theta))},${round(cy - r * Math.sin(theta))}`
  return {
    x: round(cx + GAUGE.needle * Math.cos(theta)),
    y: round(cy - GAUGE.needle * Math.sin(theta)),
    fill: `M65,190 A110,110 0 0 1 ${at(110)} L${at(80)} A80,80 0 0 0 95,190 Z`,
  }
}

// ── Everything for one post ────────────────────────────────────────

export function postSignals(input: {
  slug: string
  tags: string[]
  html: string
  markdown: string
  readingMinutes: number
}): PostSignals {
  const { html } = input
  const samples = codeSamples(html)
  const sectionWords = sectionWordCounts(input.markdown)
  const ribbon = ribbonSegments(html)
  return {
    zones: countMatches(html, /<h2[\s>]/),
    samples,
    sampleTotal: samples.reduce((a, s) => a + s.count, 0),
    diagrams: countMatches(html, /<figure class="(?:diagram|bar-chart)"/),
    compares: countMatches(html, /<div class="compare-block"/),
    sectionWords,
    ribbon,
    ribbonLabel: ribbonLabel(ribbon),
    sigil: sigilSvg(sigilModel(input.slug, input.tags, sectionWords)),
    gauge: gaugeNeedle(input.readingMinutes),
  }
}

// ── Impact map ─────────────────────────────────────────────────────

export interface MapPostInput {
  slug: string
  title: string
  date: string
  tags: string[]
  readingMinutes: number
  outgoing: string[]
}

export interface MapNode {
  slug: string
  title: string
  label: string
  group: string
  x: number
  y: number
  r: number
  labelX: number
  labelY: number
  rotate: number
  anchor: "start" | "end"
}

export interface MapGroup {
  tag: string
  arc: string
  labelX: number
  labelY: number
  rotate: number
  anchor: "start" | "end"
}

export interface ImpactMap {
  size: number
  nodes: MapNode[]
  edges: { from: string; to: string; d: string }[]
  groups: MapGroup[]
}

export const MAP = {
  size: 660,
  ring: 135,
  labelChars: 28,
  fontPx: 11,
}

export function shortenTitle(title: string, max = MAP.labelChars): string {
  if (title.length <= max) return title
  const cut = title.slice(0, max - 1)
  const space = cut.lastIndexOf(" ")
  return `${(space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s,:;·-]+$/, "")}…`
}

export const nodeRadius = (minutes: number) =>
  round(4 + Math.min(20, Math.max(1, minutes)) * 0.5)

export function impactMap(posts: MapPostInput[]): ImpactMap {
  const { size, ring } = MAP
  const c = size / 2
  const byGroup = new Map<string, MapPostInput[]>()
  for (const p of [...posts].sort(
    (a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug),
  )) {
    const tag = p.tags[0] ?? "Untagged"
    byGroup.set(tag, [...(byGroup.get(tag) ?? []), p])
  }
  const groups = [...byGroup].sort(
    ([a, pa], [b, pb]) => pb.length - pa.length || a.localeCompare(b),
  )
  const slots = posts.length + groups.length
  const step = 360 / Math.max(1, slots)
  const xy = (r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return [round(c + r * Math.cos(rad)), round(c + r * Math.sin(rad))]
  }
  const maxNode = nodeRadius(20)

  // Every label (posts and group names) is radial and owns one slot, so
  // neighbouring labels are always a full slot apart.
  const radial = (angle: number) => {
    const [labelX, labelY] = xy(ring + maxNode + 6, angle)
    const right = angle < 180
    return {
      labelX,
      labelY,
      rotate: round(right ? angle - 90 : angle + 90),
      anchor: (right ? "start" : "end") as "start" | "end",
    }
  }

  const nodes: MapNode[] = []
  const mapGroups: MapGroup[] = []
  let slot = 0
  for (const [tag, members] of groups) {
    // On the left half the circle runs upwards, so the name goes after the
    // group's posts to stay above them on screen.
    const leftHalf = (slot + (members.length + 1) / 2) * step >= 180
    const labelSlot = leftHalf ? slot + members.length : slot++
    const first = slot * step
    for (const p of members) {
      const angle = slot * step
      const [x, y] = xy(ring, angle)
      nodes.push({
        slug: p.slug,
        title: p.title,
        label: shortenTitle(p.title),
        group: tag,
        x,
        y,
        r: nodeRadius(p.readingMinutes),
        ...radial(angle),
      })
      slot++
    }
    const last = (slot - 1) * step
    const arcR = ring - maxNode - 8
    const pad = step * 0.35
    const [ax, ay] = xy(arcR, first - pad)
    const [bx, by] = xy(arcR, last + pad)
    const large = last - first + 2 * pad > 180 ? 1 : 0
    if (leftHalf) slot++
    mapGroups.push({
      tag,
      arc: `M${ax},${ay} A${arcR},${arcR} 0 ${large} 1 ${bx},${by}`,
      ...radial(labelSlot * step),
    })
  }

  const position = new Map(nodes.map((n) => [n.slug, n]))
  const seen = new Set<string>()
  const edges: ImpactMap["edges"] = []
  for (const p of posts) {
    for (const target of p.outgoing) {
      const a = position.get(p.slug)
      const b = position.get(target)
      if (!a || !b || a === b) continue
      const key = [a.slug, b.slug].sort().join("→")
      if (seen.has(key)) continue
      seen.add(key)
      edges.push({
        from: a.slug,
        to: b.slug,
        d: `M${a.x},${a.y} Q${c},${c} ${b.x},${b.y}`,
      })
    }
  }
  edges.sort((e, f) => (e.from + e.to).localeCompare(f.from + f.to))
  return { size, nodes, edges, groups: mapGroups }
}

/**
 * Smallest gap in px between neighbouring node labels, measured where the
 * labels start. Radial labels can't overlap while this exceeds the font size.
 */
export function minLabelGap(map: ImpactMap): number {
  const r = MAP.ring + nodeRadius(20) + 6
  const c = map.size / 2
  const angles = [...map.nodes, ...map.groups]
    .map((l) => {
      const deg = (Math.atan2(l.labelY - c, l.labelX - c) * 180) / Math.PI
      return (deg + 450) % 360
    })
    .sort((a, b) => a - b)
  let gap = Infinity
  for (let i = 0; i < angles.length; i++) {
    const next = i + 1 < angles.length ? angles[i + 1] : angles[0] + 360
    gap = Math.min(gap, ((next - angles[i]) * Math.PI * r) / 180)
  }
  return round(gap)
}
