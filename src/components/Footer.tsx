/**
 * Footer — The bottom of the page, the end of the scroll.
 *
 * Minimal by design: copyright, a few links, nothing more.
 * Links and name come from content.json (single source of truth — DRY).
 * The year auto-updates via Date() so this never goes stale.
 *
 * If you're reading this in 2030 and the site still says the
 * right year, you're welcome.
 */
import rawContent from "@/../content/content.json";
import type { ContentData } from "@/lib/contentData";

const content = rawContent as unknown as ContentData;

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-16">
      {/* Centered container matching the site's max-width */}
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} {content.site.name}. All rights reserved.</p>
        <div className="flex gap-6">
          <a
            href={`mailto:${content.site.links.email}`}
            className="hover:text-accent transition-colors"
          >
            Email
          </a>
          <a
            href={content.site.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={content.site.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
