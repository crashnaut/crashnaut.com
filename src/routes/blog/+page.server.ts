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
    })),
    tags: orderTags(posts.flatMap((m) => m.metadata.tags)),
  }
}
