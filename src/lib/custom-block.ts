import type {
  RendererExtension,
  Token,
  TokenizerExtension,
  Tokens,
} from "marked"

const admonitionTypes = [
  "danger",
  "warning",
  "info",
  "success",
  "note",
  "ai",
  "tip",
] as const
type AdmonitionType = (typeof admonitionTypes)[number]

interface CustomBlockToken extends Tokens.Generic {
  type: "customBlock"
  icon: AdmonitionType
  text: string
  tokens: Token[]
}

const startReg = new RegExp(`^:::(${admonitionTypes.join("|")})$`)
const endReg = /^:::$/

const admonitions: Record<AdmonitionType, [clazz: string, title: string]> = {
  danger: ["danger", "Alert"],
  warning: ["warning", "Warning"],
  info: ["info", "Note"],
  note: ["info", "Note"],
  ai: ["info-ai", "AI Note"],
  success: ["success", "Congratulations"],
  tip: ["tip", "Tip"],
}

export const customBlock: TokenizerExtension & RendererExtension = {
  name: "customBlock",
  level: "block",
  start(src) {
    const index = src.match(
      new RegExp(`(^|[\\r\\n]):::(${admonitionTypes.join("|")})`),
    )?.index
    return index
  },
  tokenizer(src): CustomBlockToken | undefined {
    const lines = src.split(/\n/)
    if (startReg.test(lines[0])) {
      const section = { x: -1, y: -1 }
      const sections: { x: number; y: number }[] = []
      for (let i = 0, k = lines.length; i < k; i++) {
        if (startReg.test(lines[i])) {
          section.x = i
        } else if (endReg.test(lines[i])) {
          section.y = i
          if (section.x >= 0) {
            sections.push({ ...section })
            section.x = -1
            section.y = -1
          }
        }
      }

      if (sections.length) {
        const section = sections[0]
        const [, icon] = startReg.exec(lines[section.x]) || []
        const text = lines.slice(section.x + 1, section.y).join("\n")
        const raw = lines.slice(section.x, section.y + 1).join("\n")
        const token: CustomBlockToken = {
          type: "customBlock",
          raw,
          icon: icon as AdmonitionType,
          text,
          tokens: [],
          childTokens: ["title", "text"],
        }

        this.lexer.blockTokens(token.text, token.tokens)
        return token
      }
    }
  },
  renderer(generic) {
    const token = generic as CustomBlockToken
    const [clazz, title] = admonitions[token.icon]
    return `<div class="custom-block ${clazz}">
			<div class="custom-block-title">${title}</div>
			${this.parser.parse(token.tokens)}
		</div>`
  },
}
