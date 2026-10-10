import { impactMap } from "#lib/post-signals.ts"
import { orderTags, readPosts } from "./_posts"

export async function load() {
  const posts = await readPosts()
  return {
    posts: posts.map((p, i) => ({
      run: posts.length - i,
      title: p.metadata.title,
      tldr: Boolean(p.tldr),
      description: p.metadata.description,
      slug: p.metadata.slug,
      date: p.metadata.date,
      tags: p.metadata.tags,
      readingMinutes: p.metadata.readingMinutes,
      sigil: p.metadata.signals.sigil,
      ribbon: p.metadata.signals.ribbon,
      ribbonLabel: p.metadata.signals.ribbonLabel,
    })),
    tags: orderTags(posts.flatMap((m) => m.metadata.tags)),
    map: impactMap(
      posts.map((p) => ({
        slug: p.metadata.slug,
        title: p.metadata.title,
        date: p.metadata.publishedAt,
        tags: p.metadata.tags,
        readingMinutes: p.metadata.readingMinutes,
        outgoing: [
          ...p.metadata.outgoingLinks.map((l) => l.slug),
          ...p.metadata.incomingLinks.map((l) => l.slug),
        ],
      })),
    ),
  }
}
