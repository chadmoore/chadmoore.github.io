/**
 * Sitemap — Auto-generated at build time.
 *
 * Next.js reads this file and serves it at /sitemap.xml.
 * All static section pages + every blog post are included.
 * Disabled sections are excluded so Google doesn't crawl ghost pages.
 *
 * Priority scale:
 *   1.0 — Homepage (most important)
 *   0.9 — Blog index (frequently updated)
 *   0.8 — Static section pages
 *   0.7 — Individual blog posts
 */
import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { siteConfig, cvSlug } from "@/lib/siteConfig";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  if (siteConfig.sections.about) {
    staticPages.push({
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  if (siteConfig.sections.blog) {
    staticPages.push({
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  if (siteConfig.sections.cv) {
    staticPages.push({
      url: `${base}/${cvSlug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  if (siteConfig.sections.projects) {
    staticPages.push({
      url: `${base}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  const posts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
