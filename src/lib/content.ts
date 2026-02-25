/**
 * Typed content import — single source of truth for content.json access.
 *
 * Import `content` from here instead of directly importing content.json
 * and performing the `as unknown as ContentData` cast at each call site.
 * This keeps the cast in exactly one place and every consumer just uses
 * the properly-typed value.
 */
import rawContent from "@/../content/content.json";
import type { ContentData } from "@/lib/contentData";

export const content = rawContent as unknown as ContentData;
