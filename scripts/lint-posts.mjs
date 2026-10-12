// Fit check for published posts (blog/*/index.md). Run with `npm run lint:posts`.
// Exits 1 if any post has an error; warnings are printed but don't fail.
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import frontmatter from "front-matter"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const MAX_DESCRIPTION = 160

// Published posts with known TODO(mike) notes (see MIKE-TODO.md). Remove a slug
// once its TODO is resolved so the check guards it again.
const TODO_ALLOWLIST = new Set([
  "playwright-bdd",
  "vanilla-playwright-pom-setup",
  "nix-flakes-for-sdet-setup",
])

const blogDir = path.join(root, "blog")
const folders = fs
  .readdirSync(blogDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => fs.existsSync(path.join(blogDir, name, "index.md")))
  .sort()

const posts = folders.map((folder) => {
  const file = path.join(blogDir, folder, "index.md")
  const { attributes, body, bodyBegin } = frontmatter(
    fs.readFileSync(file, "utf8"),
  )
  return {
    folder,
    file: path.relative(root, file),
    attributes,
    body,
    bodyBegin,
  }
})
const knownSlugs = new Set(posts.map((p) => p.attributes.slug ?? p.folder))

function parseTags(tags) {
  const list = Array.isArray(tags) ? tags : String(tags ?? "").split(",")
  return list.map((t) => String(t).trim()).filter(Boolean)
}

// Code samples may legitimately contain example /blog/ paths.
const stripCode = (md) =>
  md.replace(/^(```|~~~)[\s\S]*?^\1/gm, "").replace(/`[^`\n]*`/g, "")

function internalBlogLinks(md) {
  const targets = new Set()
  const patterns = [
    /\]\(\s*<?([^)\s>]+)/g, // [text](href)
    /href="([^"]+)"/g, // raw HTML
  ]
  for (const pattern of patterns) {
    for (const [, href] of stripCode(md).matchAll(pattern)) {
      // ../<slug>/index.md is rewritten to /blog/<slug> by src/lib/markdown.ts
      const link = href
        .replace(/^https?:\/\/(www\.)?crashnaut\.com/, "")
        .replace(/^\.\.\//, "/blog/")
        .replace(/\/index\.md$/, "")
      const match = link.match(/^\/blog\/([^/?#]+)\/?(?:[?#].*)?$/)
      if (match && match[1] !== "rss.xml") targets.add(match[1])
    }
  }
  return [...targets]
}

function lintPost({ folder, attributes, body, bodyBegin }) {
  const errors = []
  const warnings = []
  const slug = attributes.slug

  const description = String(attributes.description ?? "").trim()
  if (!description) {
    errors.push("description is missing")
  } else if (description.length > MAX_DESCRIPTION) {
    errors.push(
      `description is ${description.length} characters (max ${MAX_DESCRIPTION})`,
    )
  }

  if (parseTags(attributes.tags).length === 0) {
    errors.push("no tags")
  }

  if (!slug) {
    errors.push("slug is missing")
  } else if (slug !== folder) {
    errors.push(`slug "${slug}" doesn't match folder name "${folder}"`)
  }

  const ogSlug = slug ?? folder
  if (!fs.existsSync(path.join(root, "static", "og", `${ogSlug}.png`))) {
    errors.push(`share card static/og/${ogSlug}.png is missing (npm run og)`)
  }

  const todoLines = body
    .split("\n")
    .map((line, i) => ({ line, number: bodyBegin + i }))
    .filter(({ line }) => line.includes("TODO("))
  if (todoLines.length) {
    const lines = todoLines.map(({ number }) => number).join(", ")
    const message = `contains "TODO(" (line${todoLines.length > 1 ? "s" : ""} ${lines})`
    if (TODO_ALLOWLIST.has(folder)) {
      warnings.push(`${message}, allowlisted`)
    } else {
      errors.push(message)
    }
  }
  if (TODO_ALLOWLIST.has(folder) && todoLines.length === 0) {
    warnings.push("allowlisted for TODO( but has none: remove it from the list")
  }

  for (const target of internalBlogLinks(body)) {
    if (!knownSlugs.has(target)) {
      errors.push(`links to /blog/${target}, which isn't a published post`)
    }
  }

  lintCitations(body, errors, warnings)

  return { errors, warnings }
}

// Posts that cite with [n] follow docs/STYLE.md §5: every number has an entry in
// an ordered `## Sources` list, numbers follow first use, and links stay out of
// the body (only the closing "Related:" line and Sources may link). Older posts
// that still use inline links have no [n] and are skipped until refreshed.
const CITE = /\[(\d{1,3}(?:\s*,\s*\d{1,3})*)\](?![([:])/g

function lintCitations(body, errors, warnings) {
  const [prose, sources] = body.split(/^## Sources\s*$/m)
  const cited = []
  for (const [, group] of stripCode(prose).matchAll(CITE)) {
    for (const n of group.split(",")) cited.push(Number(n.trim()))
  }
  if (cited.length === 0) return

  if (sources === undefined) {
    errors.push("cites [n] but has no ## Sources section")
    return
  }
  const count = (sources.split(/^## /m)[0].match(/^\s*\d+\.\s/gm) ?? []).length
  if (count === 0) {
    errors.push("## Sources needs an ordered list (1. 2. 3.) to match the [n]")
  }
  for (const n of new Set(cited)) {
    if (n < 1 || n > count) {
      errors.push(
        `cites [${n}] but Sources has ${count} entr${count === 1 ? "y" : "ies"}`,
      )
    }
  }
  for (let n = 1; n <= count; n++) {
    if (!cited.includes(n)) warnings.push(`source ${n} is never cited`)
  }
  const firstUse = [...new Set(cited)]
  if (firstUse.some((n, i) => i > 0 && n < firstUse[i - 1])) {
    warnings.push(
      `sources aren't numbered in order of first use (first cited: ${firstUse.join(", ")})`,
    )
  }

  const bodyLinks = stripCode(prose)
    .split("\n")
    .filter((line) => !/^\s*Related:/.test(line))
    .join("\n")
    .match(/\]\(\s*<?(?:https?:|\/|\.\.\/)[^)]*\)|<a\s[^>]*href=/g)
  if (bodyLinks?.length) {
    errors.push(
      `${bodyLinks.length} link${bodyLinks.length > 1 ? "s" : ""} in the body: cite with [n], or move internal links to the "Related:" line`,
    )
  }
}

const color = process.stdout.isTTY
const paint = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s)
const PASS = paint("32", "PASS")
const FAIL = paint("31", "FAIL")
const WARN = paint("33", "WARN")

let failed = 0
let warned = 0
for (const post of posts) {
  const { errors, warnings } = lintPost(post)
  const status = errors.length ? FAIL : warnings.length ? WARN : PASS
  console.log(`${status} ${post.file}`)
  for (const e of errors) console.log(`     ${paint("31", "✕")} ${e}`)
  for (const w of warnings) console.log(`     ${paint("33", "!")} ${w}`)
  if (errors.length) failed++
  if (warnings.length) warned++
}

console.log(
  `\n${posts.length} posts checked: ${posts.length - failed} passed, ${failed} failed, ${warned} with warnings`,
)
process.exit(failed ? 1 : 0)
