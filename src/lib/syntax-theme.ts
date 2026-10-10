// Crashnaut syntax themes: one scope table, two palettes.
//
// markdown.ts maps every highlighted token back to a CSS variable by matching
// the token colour against the dark palette, so each group's dark colour must
// be unique. The light palette can repeat colours freely.

interface Group {
  scope: string[]
  dark: string
  light: string
}
interface TokenColor {
  scope?: string[]
  settings: { foreground: string }
}

const groups: Group[] = [
  {
    scope: ["comment", "punctuation.definition.comment", "string.comment"],
    dark: "#8b9099",
    light: "#686b71",
  },
  {
    scope: [
      "keyword",
      "storage",
      "storage.type",
      "storage.modifier",
      "keyword.operator.new",
      "keyword.control",
      "variable.language.this",
    ],
    dark: "#f8c400",
    light: "#8a6400",
  },
  {
    scope: [
      "string",
      "string.quoted",
      "string.template",
      "punctuation.definition.string",
      "markup.inline.raw",
    ],
    dark: "#9bd88f",
    light: "#2d7a2f",
  },
  {
    scope: [
      "constant",
      "constant.numeric",
      "constant.language",
      "constant.character",
      "support.constant",
    ],
    dark: "#ff9f6b",
    light: "#b44a12",
  },
  {
    scope: [
      "entity.name.function",
      "support.function",
      "meta.function-call",
      "variable.function",
    ],
    dark: "#7cc4ff",
    light: "#1f5fa8",
  },
  {
    scope: [
      "entity.name.type",
      "entity.name.class",
      "support.type",
      "support.class",
      "entity.other.inherited-class",
      "entity.name.namespace",
    ],
    dark: "#d9a6ff",
    light: "#7a3aa6",
  },
  {
    scope: ["entity.name.tag", "meta.tag.sgml", "markup.heading"],
    dark: "#ff7a85",
    light: "#b3261e",
  },
  {
    scope: [
      "entity.other.attribute-name",
      "meta.object-literal.key",
      "support.type.property-name",
      "variable.other.property",
      "variable.other.object.property",
    ],
    dark: "#8fe3d3",
    light: "#0f7466",
  },
  {
    scope: [
      "variable",
      "variable.other",
      "variable.parameter",
      "meta.definition.variable",
    ],
    dark: "#efefea",
    light: "#232321",
  },
  {
    scope: [
      "punctuation",
      "meta.brace",
      "keyword.operator",
      "punctuation.separator",
      "punctuation.accessor",
    ],
    dark: "#9a9da3",
    light: "#62656b",
  },
  {
    scope: ["markup.inserted", "markup.inserted.diff"],
    dark: "#6fd08c",
    light: "#1f7a3a",
  },
  {
    scope: ["markup.deleted", "markup.deleted.diff", "invalid"],
    dark: "#ff6b6b",
    light: "#b3261e",
  },
]

function build(name: string, type: "dark" | "light") {
  const fg = type === "dark" ? "#d9d9d4" : "#2b2b29"
  return {
    name,
    type,
    colors: {
      "editor.background": type === "dark" ? "#141518" : "#ffffff",
      "editor.foreground": fg,
      "tab.activeBackground": type === "dark" ? "#1c1d21" : "#f0f0ec",
    },
    tokenColors: [
      { settings: { foreground: fg } },
      ...groups.map((g) => ({
        scope: g.scope,
        settings: { foreground: type === "dark" ? g.dark : g.light },
      })),
    ] as TokenColor[],
  }
}

export const crashnautDark = build("crashnaut-dark", "dark")
export const crashnautLight = build("crashnaut-light", "light")
