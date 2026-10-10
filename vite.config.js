import path from "path"
import { sveltekit } from "@sveltejs/kit/vite"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import adapter from "@sveltejs/adapter-static"
import { defineConfig } from "vitest/config"

const blogDir = path.resolve("blog")

/**
 * Posts are parsed once and cached (src/routes/blog/_posts.ts), so restart the
 * dev server when anything under blog/ changes.
 * @type {import("vite").Plugin}
 */
const restartOnPostChange = {
  name: "restart-on-post-change",
  apply: "serve",
  configureServer(server) {
    server.watcher.add(blogDir)
    const restart = (/** @type {string} */ file) => {
      if (file.startsWith(blogDir) && !file.endsWith(".webp")) server.restart()
    }
    server.watcher.on("add", restart)
    server.watcher.on("change", restart)
    server.watcher.on("unlink", restart)
  },
}

export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter({
        fallback: "404.html",
      }),
    }),
    restartOnPostChange,
  ],
  server: {
    fs: {
      allow: [".."],
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
})
