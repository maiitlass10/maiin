/** Public address of the site. Set NEXT_PUBLIC_SITE_URL once a domain is connected; Vercel's own URL is used until then. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Search engines may index the site only when NEXT_PUBLIC_ALLOW_INDEXING is "true".
 * Leave it unset on previews and until the real launch, so test deployments
 * never show up in Google.
 */
export const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
