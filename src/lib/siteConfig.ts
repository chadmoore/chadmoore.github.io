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
import rawContent from "@/../content/content.json";
import type { ContentData, SectionKey } from "@/lib/contentData";

const content = rawContent as unknown as ContentData;

export const siteConfig = {
  name: content.site.name,
  tagline: content.site.tagline,
  sections: content.site.sections,
};

export type { SectionKey };
