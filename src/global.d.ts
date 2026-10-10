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
  /** Google tag (gtag.js), loaded from app.html */
  function gtag(...args: unknown[]): void
}
