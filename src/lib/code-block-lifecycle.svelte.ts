export default function codeBlockLifeCycle(trigger?: () => unknown) {
  let codeTabs: Element[] = []

  $effect(() => {
    trigger?.()
    codeTabs = [...document.querySelectorAll(".code-group-tab")]
    codeTabs.forEach((pre) => pre.addEventListener("click", codeTabClick))
    return () => {
      codeTabs.forEach((pre) => pre.removeEventListener("click", codeTabClick))
    }
  })

  function codeTabClick(e: Event) {
    if (e.target instanceof HTMLElement) {
      const target = e.target
      if (target.classList.contains("active")) {
        return
      }
      const id = target.getAttribute("data-id")
      const code = document.querySelector(`.code-group-code[data-id="${id}"]`)
      const group = code?.parentElement
      if (code instanceof HTMLElement && group) {
        const currentVisible = group.querySelector(
          `.code-group-code:not([hidden])`,
        )
        const currentActive = group.querySelector(`.code-group-tab.active`)

        code.removeAttribute("hidden")
        target.classList.add("active")

        currentVisible?.setAttribute("hidden", "")
        currentActive?.classList.remove("active")
      }
    }
  }
}
