import type { PostSignals } from "./post-signals.ts"

export interface TOC {
  description: string
  level: number
  slug: string
}

export interface PostLink {
  slug: string
  title: string
}

export interface PostMetadata {
  title: string
  slug: string
  description: string
  date: string
  modified: string | null
  publishedAt: string
  modifiedAt: string
  tags: string[]
  canonical: string
  banner: string
  readingMinutes: number
  author: string
  outgoingLinks: PostLink[]
  incomingLinks: PostLink[]
  toc: TOC[]
  outgoingSlugs?: string[]
  /** Build-time counts and shapes behind the crash report, sigil, ribbon and gauge. */
  signals: PostSignals
}

export interface Post {
  html: string
  tldr: string | null
  metadata: PostMetadata
}
