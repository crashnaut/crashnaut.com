/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_PUBLIC_BASE_PATH: string
  VITE_PUBLIC_GA_TRACKING_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}

declare global {
  /** Google tag (gtag.js) — loaded from app.html / GTM snippet */
  function gtag(...args: unknown[]): void

  /** Ko-fi floating widget — external script on blog (may be absent) */
  // eslint-disable-next-line no-var -- optional global injected by Ko-fi script
  var kofiWidgetOverlay:
    | {
        draw: (name: string, config: Record<string, string>) => void
      }
    | undefined
}
