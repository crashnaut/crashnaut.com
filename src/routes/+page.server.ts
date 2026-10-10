import { readPosts } from "./blog/_posts"

export async function load() {
  const posts = await readPosts()
  return {
    total: posts.length,
    recent: posts.slice(0, 4).map((p, i) => ({
      run: posts.length - i,
      slug: p.metadata.slug,
      title: p.metadata.title,
      description: p.metadata.description,
      date: p.metadata.date,
      tags: p.metadata.tags,
      readingMinutes: p.metadata.readingMinutes,
      sigil: p.metadata.signals.sigil,
      ribbon: p.metadata.signals.ribbon,
      ribbonLabel: p.metadata.signals.ribbonLabel,
    })),
  }
}
