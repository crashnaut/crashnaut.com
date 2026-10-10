// Renders share cards (static/og/<slug>.png, static/og/default.png) and the
// favicon set from the crash-test mark. Run with `npm run og`; commit the output.
//   --force   regenerate cards that already exist
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import frontmatter from "front-matter"
import { chromium } from "@playwright/test"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const force = process.argv.includes("--force")
// inline as data URIs: pages loaded via setContent can't read file:// URLs
const font = (pkg, file) =>
  `data:font/woff2;base64,${fs
    .readFileSync(path.join(root, "node_modules", pkg, "files", file))
    .toString("base64")}`

const MARK = `<svg viewBox="0 0 32 32" width="__S__" height="__S__"><circle cx="16" cy="16" r="15" fill="#f8c400"/><path d="M16 16 L16 1 A15 15 0 0 0 1 16 Z" fill="#141414"/><path d="M16 16 L16 31 A15 15 0 0 0 31 16 Z" fill="#141414"/><circle cx="16" cy="16" r="15" fill="none" stroke="#141414" stroke-width="1.5"/></svg>`
const mark = (size) => MARK.replaceAll("__S__", String(size))

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const css = `
@font-face { font-family: Archivo; src: url(${font("@fontsource-variable/archivo", "archivo-latin-wdth-normal.woff2")}); font-weight: 100 900; font-stretch: 62% 125%; }
@font-face { font-family: Plex Mono; src: url(${font("@fontsource/ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff2")}); }
@font-face { font-family: Plex Sans; src: url(${font("@fontsource/ibm-plex-sans", "ibm-plex-sans-latin-400-normal.woff2")}); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #0f1012; color: #ececE8; font-family: Plex Sans; position: relative; overflow: hidden; }
.grid { position: absolute; inset: 0; background-image: linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px); background-size: 40px 40px; }
.wrap { position: absolute; inset: 64px 72px 78px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 16px; font-family: Archivo; font-weight: 850; font-size: 34px; letter-spacing: -0.03em; font-variation-settings: "wdth" 125; }
.tele { margin-top: auto; font-family: Plex Mono; font-size: 22px; letter-spacing: .06em; text-transform: uppercase; color: #8a8a83; display: flex; gap: 22px; align-items: center; }
.tele b { color: #f8c400; font-weight: 500; }
.dot { width: 14px; height: 14px; border-radius: 50%; background: #1f9d55; box-shadow: 0 0 0 6px #1f9d5530; }
h1 { margin-top: 22px; font-family: Archivo; font-weight: 800; font-variation-settings: "wdth" 112; letter-spacing: -0.03em; line-height: 1.04; text-wrap: balance; }
.foot { margin-top: 30px; font-family: Plex Mono; font-size: 22px; color: #b9b9b2; }
.hazard { position: absolute; left: 0; right: 0; bottom: 0; height: 26px; background: repeating-linear-gradient(-45deg, #f8c400 0 22px, #141414 22px 44px); }
.big-mark { position: absolute; right: -150px; top: 60px; opacity: .07; }
`

function card({ telemetry, title, foot, size }) {
  return `<!doctype html><html><head><style>${css} h1 { font-size: ${size}px; }</style></head><body>
<div class="grid"></div><div class="big-mark">${mark(460)}</div>
<div class="wrap">
  <div class="brand">${mark(48)}<span>crashnaut</span></div>
  <div class="tele"><span class="dot"></span>${telemetry}</div>
  <h1>${esc(title)}</h1>
  <div class="foot">${esc(foot)}</div>
</div>
<div class="hazard"></div></body></html>`
}

const titleSize = (t) => (t.length > 70 ? 58 : t.length > 45 ? 68 : 80)

const posts = fs
  .readdirSync(path.join(root, "blog"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => {
    const file = path.join(root, "blog", d.name, "index.md")
    const { attributes, body } = frontmatter(fs.readFileSync(file, "utf8"))
    const tags = Array.isArray(attributes.tags)
      ? attributes.tags
      : String(attributes.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
    const minutes = Math.max(1, Math.round(body.split(/\s+/).length / 230))
    return {
      slug: attributes.slug,
      title: attributes.title,
      date: new Date(attributes.date),
      tags,
      minutes,
    }
  })
  .sort((a, b) => a.date - b.date)
  .map((p, i) => ({ ...p, run: i + 1 }))

const outDir = path.join(root, "static", "og")
fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })

async function shoot(html, file) {
  await page.setContent(html, { waitUntil: "load" })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: file, type: "png" })
  console.log(`[og] ${path.relative(root, file)}`)
}

await shoot(
  card({
    telemetry: `<b>Senior SDET contractor</b><span>Remote · US hours</span>`,
    title: "I crash-test FinTech software before your customers do.",
    foot: "Mike Sell · crashnaut.com",
    size: 76,
  }),
  path.join(outDir, "default.png"),
)

for (const p of posts) {
  const file = path.join(outDir, `${p.slug}.png`)
  if (fs.existsSync(file) && !force) continue
  await shoot(
    card({
      telemetry: `<b>Run ${String(p.run).padStart(3, "0")}</b>${p.tags
        .slice(0, 2)
        .map((t) => `<span>${esc(t)}</span>`)
        .join("")}<span>${p.minutes} min read</span>`,
      title: p.title,
      foot: `crashnaut.com/blog · Mike Sell`,
      size: titleSize(p.title),
    }),
    file,
  )
}

// favicons from the mark
const favDir = path.join(root, "static", "favicons")
for (const [name, size, pad] of [
  ["favicon-32x32.png", 32, 0],
  ["apple-touch-icon.png", 180, 18],
  ["android-chrome-192x192.png", 192, 20],
  ["android-chrome-512x512.png", 512, 52],
]) {
  await page.setViewportSize({ width: size, height: size })
  const bg = pad ? "#f4f4f1" : "transparent"
  await page.setContent(
    `<body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${bg}">${mark(size - pad * 2)}</body>`,
  )
  await page.screenshot({ path: path.join(favDir, name), omitBackground: !pad })
}
// favicon.ico wrapping a 32px PNG (ICO files may embed PNG data directly).
// It lives at the site root because browsers request /favicon.ico by default.
const png = fs.readFileSync(path.join(favDir, "favicon-32x32.png"))
const header = Buffer.alloc(22)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)
header.writeUInt8(32, 6)
header.writeUInt8(32, 7)
header.writeUInt16LE(1, 10)
header.writeUInt16LE(32, 12)
header.writeUInt32LE(png.length, 14)
header.writeUInt32LE(22, 18)
fs.writeFileSync(
  path.join(root, "static", "favicon.ico"),
  Buffer.concat([header, png]),
)
console.log("[og] favicons")

await browser.close()
