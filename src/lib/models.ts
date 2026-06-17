export interface TOC {
  description: string;
  level: number;
  slug: string;
}

export interface PostLink {
  slug: string;
  title: string;
}

export interface PostTranslation {
  url: string;
  author: string;
  profile: string;
  language: string;
}

export interface PostMetadata {
  title: string;
  slug: string;
  description: string;
  date: string;
  modified: string | null;
  publishedAt: string;
  modifiedAt: string;
  tags: string[];
  canonical: string;
  banner: string;
  author: string;
  outgoingLinks: PostLink[];
  incomingLinks: PostLink[];
  translations: PostTranslation[];
  toc: TOC[];
  outgoingSlugs?: string[];
}

export interface Post {
  html: string;
  tldr: string | null;
  metadata: PostMetadata;
}
