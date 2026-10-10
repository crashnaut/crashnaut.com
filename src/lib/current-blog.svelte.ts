import { goto } from "$app/navigation"

interface Blog {
  title: string
  state: "tldr" | "detailed" | "single"
}

function createBlog() {
  let blog = $state<Blog | null>(null)

  return {
    get blog() {
      return blog
    },
    loadBlog: (title: string, state: "tldr" | "detailed" | "single") => {
      blog = {
        state,
        title,
      }
    },
    toggleTldr: () => {
      const current = blog
      if (!current) return
      current.state = current.state === "tldr" ? "detailed" : "tldr"

      const queryParams = new URLSearchParams(location.search)
      if (current.state === "tldr") {
        queryParams.set("tldr", "true")
      } else {
        queryParams.delete("tldr")
      }
      const queryParamsString = queryParams.size
        ? `?${queryParams.toString()}`
        : "?"
      goto(queryParamsString, {
        reset: false,
        replace: true,
      })
    },
    reset: () => {
      blog = null
    },
  }
}

export const blog = createBlog()
