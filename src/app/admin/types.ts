/**
 * Admin page types — shared across all admin sub-modules.
 */
import { cvDisplayLabel } from "@/lib/siteConfig";

// ─── Blog Types ─────────────────────────────────────────────────────

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

export interface BlogPostFull extends BlogPostMeta {
  content: string;
}

// ─── Tab Types ──────────────────────────────────────────────────────

export type Tab = "site" | "home" | "about" | "projects" | "cv" | "skills" | "blog" | "import" | "lighthouse";

export const TAB_LABELS: Record<Tab, string> = {
  site: "Site",
  home: "Home",
  about: "About",
  projects: "Projects",
  cv: cvDisplayLabel,
  skills: "Skills",
  blog: "Blog",
  import: "Import",
  lighthouse: "Lighthouse",
};
