// Numbered citations, DCU style (docs/STYLE.md §5).
//
// In a post, cite with a plain bracketed number after the claim:
//
//   …fix time barely grew before release [2].
//   …two studies disagree [1, 3].
//
// Each number renders as a superscript link to the matching item in the post's
// `## Sources` ordered list, and that item gets a link back to where it was
// first cited. `[2](url)`, `[2][ref]` and `[2]: url` are left to marked, and
// anything inside code is never touched.

import type { RendererExtension, TokenizerExtension, Tokens } from "marked"

interface CitationToken extends Tokens.Generic {
  type: "citation"
  numbers: number[]
}

const citeReg = /^\[(\d{1,3}(?:\s*,\s*\d{1,3})*)\](?![([:])/

// First-citation ids are tracked per document so each source can link back.
let firstCited = new Set<number>()

export function resetCitations() {
  firstCited = new Set()
}

export const citation: TokenizerExtension & RendererExtension = {
  name: "citation",
  level: "inline",
  start(src) {
    return src.match(/\[\d/)?.index
  },
  tokenizer(src): CitationToken | undefined {
    const match = citeReg.exec(src)
    if (!match) return
    return {
      type: "citation",
      raw: match[0],
      numbers: match[1].split(",").map((n) => Number(n.trim())),
    }
  },
  renderer(token) {
    const links = (token as CitationToken).numbers.map((n) => {
      const id = firstCited.has(n) ? "" : ` id="cite-${n}"`
      firstCited.add(n)
      return `<a href="#source-${n}"${id} aria-label="Source ${n}">${n}</a>`
    })
    return `<sup class="cite">[${links.join(", ")}]</sup>`
  },
}

/**
 * Gives each item of the ordered list under `## Sources` an anchor
 * (`source-1`, `source-2`, …) and, when the post cited it, a link back to the
 * first citation.
 */
export function anchorSources(html: string): string {
  const heading = html.search(/<h2 id="sources"/)
  if (heading === -1) return html
  const listStart = html.indexOf("<ol", heading)
  if (listStart === -1) return html
  const listEnd = html.indexOf("</ol>", listStart)
  if (listEnd === -1) return html

  let n = 0
  const list = html
    .slice(listStart, listEnd)
    .replace(/<li>([\s\S]*?)<\/li>/g, (_, body: string) => {
      n++
      const back = firstCited.has(n)
        ? ` <a href="#cite-${n}" class="cite-back" aria-label="Back to citation ${n}">↩</a>`
        : ""
      return `<li id="source-${n}">${body.trimEnd()}${back}</li>`
    })
  return html.slice(0, listStart) + list + html.slice(listEnd)
}
