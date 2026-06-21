import * as path from "path"
import { ISODate } from "$lib/formatters"
import { variables } from "$lib/variables"
import {
  parseFileToHtmlAndMeta,
  sortByDate,
  traverseFolder,
} from "$lib/markdown"
import { execSync } from "child_process"
import { dev } from "$app/environment"
import type { Post, PostMetadata } from "$lib/models"

const blogPath = "blog"

const posts: Post[] = []

export async function readPosts(): Promise<Post[]> {
  if (posts.length) {
    return posts
  }
  console.log("\x1b[35m[posts] generate\x1b[0m")

  try {
    const folderContent = [...traverseFolder(blogPath, ".md")]
    const directories = folderContent.reduce(
      (dirs, file) => {
        dirs[file.folder] = [
          ...(dirs[file.folder] || []),
          { path: file.path, file: file.file },
        ]
        return dirs
      },
      {} as Record<string, { file: string; path: string }[]>,
    )

    const postsSorted = Object.values(directories)
      .map((files) => {
        const postPath = files.find((f) => f.file === "index.md").path
        const tldrPath = files.find((f) => f.file === "tldr.md")?.path

        const { html, metadata } = parseFileToHtmlAndMeta(postPath)
        const { html: tldr } = tldrPath
          ? parseFileToHtmlAndMeta(tldrPath)
          : { html: null }
        const tags = metadata.tags
        const banner = path
          .normalize(
            path.join(
              variables.basePath,
              "blog",
              metadata.slug,
              "images",
              "banner.png",
            ),
          )
          .replace(/\\/g, "/")
          .replace("/", "//")

        const canonical = path
          .normalize(path.join(variables.basePath, "blog", metadata.slug))
          .replace(/\\/g, "/")
          .replace("/", "//")

        const modified = getLastModifiedDate(metadata.slug)
        const publishedAt = toISO(metadata.date)
        const modifiedAt = modified ? toISO(modified) : publishedAt
        const postMetadata: PostMetadata = {
          title: metadata.title as string,
          slug: metadata.slug as string,
          description: (metadata.description as string) ?? "",
          author: (metadata.author as string) ?? "Mike Sell",
          date: ISODate(metadata.date as string),
          modified: modified ? ISODate(modified) : null,
          publishedAt,
          modifiedAt,
          tags,
          banner,
          canonical,
          outgoingLinks: [],
          incomingLinks: [],
          translations:
            (metadata.translations as PostMetadata["translations"]) ?? [],
          toc: metadata.toc,
          outgoingSlugs: metadata.outgoingSlugs,
        }

        return {
          html,
          tldr,
          metadata: postMetadata,
        }
      })
      .sort(sortByDate)

    for (const post of postsSorted) {
      const incomingLinks = new Set([
        ...postsSorted
          .filter((p) => p.metadata.outgoingSlugs?.includes(post.metadata.slug))
          .map((p) => ({
            slug: p.metadata.slug,
            title: p.metadata.title,
          })),
      ])

      const outgoingLinks = new Set([
        ...postsSorted
          .filter((p) => post.metadata.outgoingSlugs?.includes(p.metadata.slug))
          .map((p) => ({
            slug: p.metadata.slug,
            title: p.metadata.title,
          })),
      ])

      post.metadata.incomingLinks.push(...incomingLinks)
      post.metadata.outgoingLinks.push(...outgoingLinks)
    }

    posts.push(...postsSorted)
    return postsSorted
  } catch (error) {
    console.error("\x1b[31m[posts] ERROR loading posts:\x1b[0m", error)
    throw error
  }
}

function toISO(date: string | Date) {
  return typeof date === "string"
    ? new Date(date).toISOString()
    : date.toISOString()
}

function getLastModifiedDate(slug: string) {
  if (dev) {
    return null
  }
  const buffer = execSync(`git log -1 --format=%ci ./blog/${slug}/index.md`)
  if (!buffer) {
    return null
  }

  return buffer.toString().trim()
}

export function orderTags(tags: string[]) {
  return Object.entries<number>(
    tags
      .map((tag) => (tag.toLowerCase() === "dotnet" ? ".NET" : tag))
      .reduce(
        (acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
  )
    .sort(([v1, c1], [v2, c2]) => c2 - c1 || v2.localeCompare(v1))
    .slice(0, 15)
    .map(([v]) => v)
}

export const TAG_COLORS: Record<string, string> = {
  playwright: "playwright",
  nix: "nix",
  devops: "devops",
  bdd: "bdd",
  ai: "ai",
  "ai / ml": "ai",
  ml: "ai",
  "machine learning": "ai",
  web3: "ethereum",
  blockchain: "bitcoin",
  defi: "solana",
  cypress: "cypress",
  javascript: "javascript",
  svelte: "svelte",
  monorepo: "devops",
  ci: "devops",
  iframes: "javascript",
}
