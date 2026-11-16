import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/ar/admin", "/en/admin", "/ar/account", "/en/account", "/ar/bag", "/en/bag", "/ar/checkout", "/en/checkout", "/ar/search", "/en/search"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
