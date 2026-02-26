/**
 * Site Configuration — Thin re-export from content.json.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All site-level config (name, tagline, section toggles) now
 * lives in content/content.json so it can be edited from the
 * admin panel alongside everything else. This module re-exports
 * it under the same `siteConfig` name so existing consumers
 * don't need to change.
 *
 * Toggle any section on/off and the entire site adapts:
 * navigation links, homepage hero buttons, and recent-posts
 * section all respect these flags.
 *
 * // TODO: add a "uses" page for the /uses crowd
 * // TODO: add dark/light theme toggle (currently dark-only because taste)
 */
import { content } from "@/lib/content";
import type { SectionKey } from "@/lib/contentData";

const DEFAULT_NAV_ORDER = ["home", "about", "projects", "blog", "cv"];

/** URL slug for the CV/Resume route: "resume" (default) or "cv". */
export const cvSlug = content.site.cvLabel === "cv" ? "cv" : "resume";

/** Human-readable label: "Resume" (default) or "CV". */
export const cvDisplayLabel = content.site.cvLabel === "cv" ? "CV" : "Resume";

export const siteConfig = {
  name: content.site.name,
  tagline: content.site.tagline,
  siteUrl: content.site.siteUrl ?? "https://chadmoore.info",
  cloudflareAnalyticsToken: content.site.cloudflareAnalyticsToken,
  sections: content.site.sections,
  navOrder: content.site.navOrder ?? DEFAULT_NAV_ORDER,
};

export type { SectionKey };
