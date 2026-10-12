import { describe, expect, test, beforeEach } from "vitest"
import { Marked } from "marked"
import { anchorSources, citation, resetCitations } from "./citation"

const md = new Marked({ extensions: [citation] })

function render(src: string) {
  return anchorSources(md.parse(src) as string)
}

beforeEach(() => resetCitations())

describe("citations", () => {
  test("[n] becomes a superscript link to its source", () => {
    const html = render("Fix time barely grew [2].")
    expect(html).toContain(
      '<sup class="cite">[<a href="#source-2" id="cite-2" aria-label="Source 2">2</a>]</sup>',
    )
  })

  test("several numbers in one bracket", () => {
    const html = render("Two studies disagree [1, 3].")
    expect(html).toContain('href="#source-1"')
    expect(html).toContain('href="#source-3"')
    expect(html).toContain("</a>, <a")
  })

  test("only the first citation of a source gets the back-link id", () => {
    const html = render("One [1]. Again [1].")
    expect(html.match(/id="cite-1"/g)).toHaveLength(1)
    expect(html.match(/href="#source-1"/g)).toHaveLength(2)
  })

  test("links, references, definitions and code are left alone", () => {
    const html = render(
      "A [2](https://example.com) link, `items[0]` in code, and [3][ref].\n\n[ref]: https://example.com",
    )
    expect(html).not.toContain('class="cite"')
    expect(html).toContain("<code>items[0]</code>")
  })

  test("sources get anchors and back-links", () => {
    const md2 = new Marked({
      extensions: [citation],
      renderer: {
        heading({ text, depth }) {
          const id = text.toLowerCase()
          return `<h${depth} id="${id}">${text}</h${depth}>`
        },
      },
    })
    const html = anchorSources(
      md2.parse(
        "Claim [1].\n\n## Sources\n\n1. First, 2020.\n2. Second, 2021.\n",
      ) as string,
    )
    expect(html).toContain('<li id="source-1">First, 2020.')
    expect(html).toContain('href="#cite-1" class="cite-back"')
    expect(html).toContain('<li id="source-2">Second, 2021.</li>')
  })

  test("posts without a Sources list are untouched", () => {
    const src = "<p>No sources here.</p>"
    expect(anchorSources(src)).toBe(src)
  })
})
