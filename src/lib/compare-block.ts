// Stacked "do / don't" comparison block (green above red by default when both are used).
//
// Usage in markdown — one column, two columns, or either colour alone:
//
//   :::compare
//   ::do[Pull a real record]
//   ```python
//   entity = find_random_entity(session)
//   ```
//   ::dont[Hardcode a UUID]
//   ```python
//   data["uuid"] = "487f-..."
//   ```
//   :::
//
//   :::compare
//   ::do[Good path only]
//   - step one
//   :::
//
//   :::compare
//   ::dont[Anti-pattern only]
//   - what not to do
//   :::
//
// Section order in the file is render order (top to bottom). The optional [title]
// overrides the default "Do this" / "Don't do this". Each column is full markdown.

// Allow leading whitespace so authors can indent ::dont / ::: to match list nesting in editors.
const startReg = /^\s*:::compare\s*$/
const endReg = /^\s*:::\s*$/
const sectionReg = /^\s*::(do|dont)(?:\[(.*?)\])?\s*$/

export const compareBlock = {
  name: "compareBlock",
  level: "block",
  start(this, src: string) {
    return src.match(/(^|[\r\n]):::compare/)?.index
  },
  tokenizer(this, src: string, _tokens) {
    const lines = src.split(/\n/)
    if (!startReg.test(lines[0])) return

    let end = -1
    for (let i = 1; i < lines.length; i++) {
      if (endReg.test(lines[i])) {
        end = i
        break
      }
    }
    if (end === -1) return

    const body = lines.slice(1, end)
    const raw = lines.slice(0, end + 1).join("\n")

    const cols: {
      kind: string
      title: string
      text: string[]
      tokens: unknown[]
    }[] = []
    let cur: (typeof cols)[number] | null = null
    for (const line of body) {
      const m = sectionReg.exec(line)
      if (m) {
        cur = {
          kind: m[1],
          title: m[2] || (m[1] === "do" ? "Do this" : "Don't do this"),
          text: [],
          tokens: [],
        }
        cols.push(cur)
      } else if (cur) {
        cur.text.push(line)
      }
    }

    const token = {
      type: "compareBlock",
      raw,
      cols: cols.map((c) => ({
        kind: c.kind,
        title: c.title,
        text: c.text.join("\n"),
        tokens: [],
      })),
    }

    for (const c of token.cols) {
      this.lexer.blockTokens(c.text, c.tokens)
    }
    return token
  },
  renderer(this, token) {
    const cols = token.cols
      .map(
        (c) =>
          `<div class="compare-col ${c.kind}"><div class="compare-title">${c.title}</div>${this.parser.parse(
            c.tokens,
          )}</div>`,
      )
      .join("")
    return `<div class="compare-block">${cols}</div>`
  },
}
