import { ISODate } from "$lib/formatters"
import { variables } from "../../lib/variables"
import { readPosts } from "../blog/_posts"

export const prerender = true

export async function GET() {
  const posts = await readPosts()
  return new Response(generate(posts), {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}

function generate(posts: Awaited<ReturnType<typeof readPosts>>) {
  const nodes = [
    {
      loc: variables.basePath,
      lastmod: ISODate(new Date()),
    },
    {
      loc: `${variables.basePath}/blog`,
      lastmod: posts[0]
        ? posts[0].metadata.modifiedAt.split("T")[0]
        : ISODate(new Date()),
    },
    {
      loc: `${variables.basePath}/contact`,
      lastmod: ISODate(new Date()),
    },
    ...posts.map((post) => ({
      loc: `${variables.basePath}/blog/${post.metadata.slug}`,
      lastmod: ISODate(post.metadata.modified || post.metadata.date),
    })),
  ]

  const urlNodes = nodes
    .map((node) => {
      return `
				<url>
					<loc>${node.loc}</loc>
					<lastmod>${node.lastmod}</lastmod>
				</url>
			`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
		${urlNodes}
		</urlset>`
  return xml.trim()
}
