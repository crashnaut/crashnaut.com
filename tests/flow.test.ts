import { test, expect } from "@playwright/test"

test("blog discovery flow from homepage to article details is deterministic", async ({
  request,
}) => {
  const blogResponse = await request.get("/blog")
  expect(blogResponse.ok()).toBeTruthy()
  const blogHtml = await blogResponse.text()

  const firstPostMatch = blogHtml.match(/href="(\/blog\/[a-z0-9-]+)"/)
  expect(firstPostMatch).not.toBeNull()
  const postPath = firstPostMatch?.[1]
  expect(postPath).toBeTruthy()
  const postResponse = await request.get(postPath as string)
  expect(postResponse.ok()).toBeTruthy()

  const postHtml = await postResponse.text()
  expect(postHtml).toContain("<h1")
  expect(postHtml).toContain("<h2")
})
