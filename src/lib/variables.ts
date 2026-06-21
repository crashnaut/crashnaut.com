export const variables = {
  gtag_id: import.meta.env.VITE_PUBLIC_GA_TRACKING_ID,
  hash: import.meta.env.VITE_PUBLIC_HASH,
  twitterBearerToken: import.meta.env.VITE_PUBLIC_TWITTER_BEARER_TOKEN,
  basePath: import.meta.env.VITE_PUBLIC_BASE_PATH || "https://crashnaut.com",
  timestamp: new Date(),
}
