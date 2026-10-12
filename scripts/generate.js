// `npm run g "Title"`: scaffolds drafts/<slug>/ with every slot from
// docs/EDITORIAL-PLAYBOOK.md §2 stubbed out. Each stub is a TODO( comment, so
// `npm run lint:posts` fails if one is published unfilled.
import { existsSync, mkdirSync, writeFileSync } from "fs"

const slugify = (string) => {
  const a = "àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœøṕŕßśșțùúüûǘẃẍÿź·/_,:;"
  const b = "aaaaaaaaceeeeghiiiimnnnooooooprssstuuuuuwxyz------"
  const p = new RegExp(a.split("").join("|"), "g")

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

const yamlString = (s) => JSON.stringify(s)

const indexTemplate = ({ title, slug, date }) => `---
title: ${yamlString(title)}
slug: ${slug}
# One sentence, 160 characters max. Shown in search results and share cards.
description: ""
date: ${date}
# 2–4 tags, reused from existing ones where possible (comma-separated).
tags:
---

<!-- TODO(write): Title check. A claim or a searchable how-to, never a topic:
"How to Test Idempotency in Payment APIs", not "Idempotency". -->

<!-- TODO(write): Opening, 2–4 sentences. The bug or cost, who hits it, and what
the reader leaves with. No throat-clearing. If the examples aren't TypeScript,
say which stack they use here. -->

## TODO(write): First section heading

<!-- TODO(write): One idea per H2; the H2s become the table of contents.
Every factual sentence needs a source fetched while writing (playbook §1). -->

## TODO(write): Second section heading

<!-- TODO(write): Proof. At least one of: runnable code copied from where it
ran, a real number (say what was measured, on what, how many runs), a diagram,
or a do/don't block like the one below. Delete whichever you don't use. -->

:::compare
::do[Do this]

- <!-- TODO(write): what good looks like -->

::dont[Not this]

- <!-- TODO(write): the common mistake -->

:::

## TODO(write): Third section heading

<!-- TODO(write): Body. 900–1,800 words for a tutorial, 700–1,200 for an
opinion piece. Cut copy to fit. -->

:::tip
<!-- TODO(write): The takeaway, one sentence. At most one :::tip per post. -->
:::

## Why it matters for your team

<!-- TODO(write): One sentence tying this to shipping software that moves money:
payments, ledgers, compliance or release speed. -->

Related: <!-- TODO(write): 2–3 internal links to related posts, e.g.
[Run Playwright Tests from a Separate Repository in CI](/blog/cross-repo-playwright-ci).
Links go here only, never mid-paragraph. The site adds the hire-me CTA and related
posts automatically. -->

## Sources

<!-- TODO(write): Cite claims in the prose as plain [1], [2], numbered by first
use, with no names or URLs in the prose (docs/STYLE.md §5). List them here in the
same order: 1. Organization or author, "Title", Site, date. <URL> -->
`

const tldrTemplate = () => `## TL;DR

<!-- TODO(write): Just the code and the steps, for readers who want the answer.
One line on what it solves, then the minimal runnable snippet and numbered steps. -->

\`\`\`ts
// TODO(write): the minimal snippet
\`\`\`

1. <!-- TODO(write): step one -->
2. <!-- TODO(write): step two -->
`

function createPost(title) {
  const slug = slugify(title)
  const path = `./drafts/${slug}`

  if (existsSync(path)) {
    console.error(`${path} already exists; pick another title or edit it.`)
    process.exit(1)
  }

  // en-CA formats as YYYY-MM-DD in the author's local time zone
  const date = new Date().toLocaleDateString("en-CA")
  mkdirSync(`${path}/images`, { recursive: true })
  writeFileSync(`${path}/index.md`, indexTemplate({ title, slug, date }))
  writeFileSync(`${path}/tldr.md`, tldrTemplate())

  console.log(`Draft created at ${path}/ (index.md, tldr.md, images/)
Fill every TODO(write) slot, then follow docs/EDITORIAL-PLAYBOOK.md §4.
To publish: move the folder to blog/, run \`npm run og\`, then \`npm run lint:posts\`.`)
}

const title = process.argv.slice(2).join(" ").trim()
if (!title) {
  console.error('Usage: npm run g "How to Test Idempotency in Payment APIs"')
  process.exit(1)
}
createPost(title)
