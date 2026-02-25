/**
 * Robots — Served at /robots.txt by Next.js.
 *
 * Replaces the static public/robots.txt so the sitemap URL stays
 * in sync with siteConfig automatically. All bots are welcome —
 * the site has nothing to hide (and plenty of easter eggs to find).
 */
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
