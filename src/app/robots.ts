import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
] as const;

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/veta-app", "/callback"],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
