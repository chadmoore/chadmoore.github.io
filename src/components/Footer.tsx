/**
 * Footer — The bottom of the page, the end of the scroll.
 *
 * Minimal by design: copyright, a few links, nothing more.
 * Links come from cv.json (single source of truth — DRY).
 * The year auto-updates via Date() so this never goes stale.
 *
 * If you're reading this in 2030 and the site still says the
 * right year, you're welcome.
 */
import rawCvData from "@/../content/cv.json";
import type { CvData } from "@/lib/cvData";

const cvData = rawCvData as unknown as CvData;

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-16">
      {/* Centered container matching the site's max-width */}
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} Chad Moore. All rights reserved.</p>
        <div className="flex gap-6">
          <a
            href={`mailto:${cvData.links.email}`}
            className="hover:text-accent transition-colors"
          >
            Email
          </a>
          <a
            href={cvData.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={cvData.links.github}
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
