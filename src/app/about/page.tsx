/**
 * About Page — The "who is this person" page.
 *
 * Intentionally written in first person and kept short.
 * Nobody reads a 2000-word about page. If they want the
 * full story, that's what the CV page is for.
 *
 * Content is driven by content.json — single source of truth.
 * Update copy in one place (or the admin panel) and the page
 * stays in sync automatically.
 *
 * // If you've read this far into the source code of someone's
 * // about page, we should probably be friends. chad@chadmoore.info
 */
import type { Metadata } from "next";
import Image from "next/image";
import { content } from "@/lib/content";
import SkillsGrid from "@/components/SkillsGrid";

export const metadata: Metadata = {
  title: `${content.about.heading} | ${content.site.name}`,
  description:
    `About ${content.site.name} — ${content.site.tagline}`,
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <div className="mb-12">
        <Image
          src="/avatar.png"
          alt={content.site.name}
          width={160}
          height={160}
          priority
          className="rounded-full w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6"
        />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
          {content.about.heading}
        </h1>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-muted leading-relaxed">
        {content.about.intro.map((paragraph, index) => (
          <p key={index} className={index === 0 ? "text-lg" : undefined}>
            {paragraph}
          </p>
        ))}

        <h2 className="text-xl font-semibold text-foreground mt-12 mb-4">
          {content.about.skillsHeading}
        </h2>

        <SkillsGrid skills={content.cv.skills} showIcons />

        <h2 className="text-xl font-semibold text-foreground mt-12 mb-4">
          {content.about.contactHeading}
        </h2>
        <p>
          The best way to reach me is by{" "}
          <a
            href={`mailto:${content.site.links.email}`}
            className="text-accent hover:text-accent-hover transition-colors underline underline-offset-4"
          >
            email
          </a>
          {" "}or on{" "}
          <a
            href={content.site.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition-colors underline underline-offset-4"
          >
            LinkedIn
          </a>
          . {content.about.contactText}
        </p>
      </div>
    </div>
  );
}
