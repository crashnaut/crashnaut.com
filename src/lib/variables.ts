export const variables = {
  /** GA4 measurement ID (G-XXXXXXX). Public, not a secret: set in CI as a repo variable. */
  gtag_id: import.meta.env.VITE_PUBLIC_GA_TRACKING_ID as string | undefined,
  hash: import.meta.env.VITE_PUBLIC_HASH as string | undefined,
  basePath: import.meta.env.VITE_PUBLIC_BASE_PATH || "https://crashnaut.com",
  timestamp: new Date(),
}
