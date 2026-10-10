import { error } from "@sveltejs/kit"
import { readPosts } from "../_posts"

export async function load({ params }) {
  const posts = await readPosts()
  const index = posts.findIndex((p) => p.metadata.slug === params.slug)
  if (index === -1) {
    error(404, `Blog ${params.slug} Not found`)
  }
  const post = posts[index]

  // posts are newest first; "run" numbers count up from the first post
  const run = posts.length - index
  const related = posts
    .filter((p) => p !== post)
    .map((p) => ({
      slug: p.metadata.slug,
      title: p.metadata.title,
      date: p.metadata.date,
      score: p.metadata.tags.filter((t) => post.metadata.tags.includes(t))
        .length,
    }))
    .sort((a, b) => b.score - a.score || (a.date < b.date ? 1 : -1))
    .slice(0, 3)

  return {
    post: {
      ...post,
      metadata: {
        ...post.metadata,
        toc: post.metadata.toc.filter(
          ({ level, description }) =>
            level < 4 && !description.includes("omit from toc"),
        ),
        edit: `https://github.com/crashnaut/crashnaut.com/blob/main/blog/${post.metadata.slug}/index.md`,
      },
    },
    run,
    related,
  }
}
