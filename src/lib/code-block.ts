import type {
  RendererExtension,
  Token,
  TokenizerExtension,
  Tokens,
} from "marked"

interface CodeGroupBlock {
  formatted: string
  title: string
  id: number
}

interface CodeGroupToken extends Tokens.Generic {
  type: "codeGroup"
  text: string
  tokens: Token[]
  codeblocks: CodeGroupBlock[]
}

let codeBlockId = 0
export const codeGroup: TokenizerExtension & RendererExtension = {
  name: "codeGroup",
  level: "block",
  start(src) {
    return src.match(/^:::code-group$/)?.index
  },
  tokenizer(src): CodeGroupToken | undefined {
    const lines = src.split(/\n/)
    if (/^:::code-group$/.test(lines[0])) {
      const section = { x: -1, y: -1 }
      const sections: { x: number; y: number }[] = []
      for (let i = 0, k = lines.length; i < k; i++) {
        if (/^:::code-group$/.test(lines[i])) {
          section.x = i
        } else if (/^:::$/.test(lines[i])) {
          section.y = i
          if (section.x >= 0) {
            sections.push({ ...section })
            section.x = -1
            section.y = -1
          }
        }
      }

      const renderer = this.lexer.options.renderer
      if (sections.length && renderer) {
        const section = sections[0]
        const text = lines.slice(section.x + 1, section.y).join("\n")
        const raw = lines.slice(section.x, section.y + 1).join("\n")

        const codeblocks = text.trim().match(/```.*?```$/gms) ?? []
        const token: CodeGroupToken = {
          type: "codeGroup",
          raw,
          text: text.trim(),
          tokens: [],
          codeblocks: codeblocks.map((c) => {
            const codeLines = c.split("\n")
            const first = (codeLines.shift() ?? "").replace(/```/, "")
            const lang = first.substr(0, first.indexOf("["))
            const title = first.substring(
              first.indexOf("[title=") + 7,
              first.indexOf("]"),
            )
            const _last = codeLines.pop()
            const text = codeLines.join("\n")
            return {
              formatted: renderer.code({
                type: "code",
                raw: c,
                text,
                lang,
              }),
              title,
              id: codeBlockId++,
            }
          }),
        }
        this.lexer.inline(token.text, token.tokens)
        return token
      }
    }
  },
  renderer(generic) {
    const token = generic as CodeGroupToken
    return `
        <div class="code-group">
            <div class="code-group-tabs"> ${token.codeblocks
              .map(
                (c, i) =>
                  `<button data-id="${c.id}" class="code-group-tab ${i === 0 ? "active" : ""}">${
                    c.title
                  }</button>`,
              )
              .join("")}</div>
            ${token.codeblocks
              .map(
                (c, i) =>
                  `<div data-id="${c.id}" class="code-group-code" ${i === 0 ? "" : "hidden"}>${
                    c.formatted
                  }</div>`,
              )
              .join("")}
        </div>`
  },
}
