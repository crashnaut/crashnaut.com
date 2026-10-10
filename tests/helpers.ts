import type { APIRequestContext } from "@playwright/test"

/** Every page path listed in the sitemap, as site-relative paths. */
export async function sitemapPaths(request: APIRequestContext) {
  const xml = await (await request.get("/sitemap.xml")).text()
  return [...xml.matchAll(/<loc>(.+?)<\/loc>/g)].map(
    ([, url]) => new URL(url).pathname,
  )
}

/** Production URLs (https://crashnaut.com/...) mapped onto the test server. */
export const toLocal = (url: string) => new URL(url).pathname
