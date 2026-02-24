/**
 * SkillIcon — maps a cv.json skill category to a Lucide icon.
 *
 * Extracted here so both the About page and the SkillsGrid
 * component can share it without duplicating SVG blobs.
 *
 * Uses Lucide React — the actively maintained fork of Feather Icons.
 * Same visual language, typed components, tree-shakeable.
 */
import type { LucideIcon } from "lucide-react";
import { Code2, Server, Cloud, Shield, Database, Bot, Box } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Frontend: Code2,
  Backend: Server,
  "Cloud & Infrastructure": Cloud,
  "Identity & Security": Shield,
  Data: Database,
  "AI & Tooling": Bot,
};

export default function SkillIcon({ category }: { category: string }) {
  const Icon: LucideIcon = CATEGORY_ICONS[category] ?? Box;
  return <Icon className="w-4 h-4 text-accent shrink-0" />;
}
