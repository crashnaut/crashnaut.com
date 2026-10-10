import { UTCDate } from "#lib/formatters.ts"
import { site } from "#lib/seo.ts"
import { variables } from "#lib/variables.ts"
import { readPosts } from "../_posts"

export const prerender = true

export async function GET() {
  const posts = await readPosts()
  return new Response(generate(posts), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}

const base = variables.basePath

/** Feed readers have no base URL, so make site-relative links absolute. */
function absolutize(html: string) {
  return html.replace(/(href|src)="\/(?!\/)/g, `$1="${base}/`)
}

function cdata(value: string) {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`
}

function generate(posts: Awaited<ReturnType<typeof readPosts>>) {
  const items = posts
    .map((post) => {
      const link = `${base}/blog/${post.metadata.slug}`
      const content =
        `<p><img src="${post.metadata.banner}" alt="" /></p>` +
        absolutize(post.html) +
        `<p><a href="${site.calendly}">Need this kind of testing on your team? Book a call.</a></p>`
      return `
    <item>
      <title>${cdata(post.metadata.title)}</title>
      <description>${cdata(post.metadata.description)}</description>
      <content:encoded>${cdata(content)}</content:encoded>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${UTCDate(post.metadata.date)}</pubDate>
      <dc:creator>${cdata(site.author)}</dc:creator>
      ${post.metadata.tags.map((t) => `<category>${cdata(t)}</category>`).join("")}
    </item>`
    })
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Crashnaut · the crash log</title>
    <description>${cdata("Field notes on test automation, CI/CD and testing software that moves money, by senior SDET Mike Sell.")}</description>
    <link>${base}/blog</link>
    <atom:link href="${base}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${UTCDate(variables.timestamp)}</lastBuildDate>
    <image>
      <url>${base}/favicons/android-chrome-192x192.png</url>
      <title>Crashnaut · the crash log</title>
      <link>${base}/blog</link>
    </image>${items}
  </channel>
</rss>`
}
