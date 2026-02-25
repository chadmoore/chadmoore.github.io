/**
 * CV Page — Professional timeline, powered by JSON.
 *
 * All CV data lives in /content/cv.json, which was originally
 * generated from a LinkedIn CSV export and then hand-polished.
 * This means updating the CV is a JSON edit, not a code change.
 *
 * Sections rendered (in order):
 *  1. Summary — one-paragraph elevator pitch
 *  2. Experience — reverse-chronological work history with skill filters
 *  3. Education — degrees and institutions
 *  4. Certifications — if any exist in the JSON
 *
 * The CVExperience component handles date formatting and
 * skill-based filtering of the work history.
 *
 * // If you're reading this because you're hiring:
 * // yes, the CV data is structured and machine-parseable.
 * // You're welcome, ATS robots.
 */
import type { Metadata } from "next";
import { content } from "@/lib/content";
import CVExperience from "@/components/CVExperience";
const cvData = content.cv;
const siteData = content.site;

export const metadata: Metadata = {
  title: `CV | ${siteData.name}`,
  description: cvData.headline,
};

export default function CVPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          {siteData.name}
        </h1>
        <p className="text-lg text-accent mb-1">{cvData.headline}</p>
        <p className="text-sm text-muted">{cvData.location}</p>
        <div className="flex gap-4 mt-4 text-sm">
          {siteData.links.email && (
            <a
              href={`mailto:${siteData.links.email}`}
              className="text-muted hover:text-accent transition-colors"
            >
              Email
            </a>
          )}
          {siteData.links.linkedin && (
            <a
              href={siteData.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors"
            >
              LinkedIn
            </a>
          )}
          {siteData.links.github && (
            <a
              href={siteData.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors"
            >
              GitHub
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
          Summary
        </h2>
        <p className="text-muted leading-relaxed">{cvData.summary}</p>
        {cvData.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {cvData.specialties.map((specialty) => (
              <span
                key={specialty}
                className="text-xs bg-accent/8 text-accent px-3 py-1 rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Experience */}
      {cvData.experience.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-6">
            Experience
          </h2>
          <CVExperience experience={cvData.experience} skills={cvData.skills} />
        </section>
      )}

      {/* Education */}
      {cvData.education.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-6">
            Education
          </h2>
          <div className="space-y-6">
            {cvData.education.map((edu, i) => (
              <div
                key={i}
                className="relative pl-6 border-l-2 border-border"
              >
                <div className="absolute -left-1.75 top-1 w-3 h-3 rounded-full bg-surface border-2 border-border" />
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-sm text-accent">
                  {edu.institution}
                  {edu.location && (
                    <span className="text-muted"> · {edu.location}</span>
                  )}
                </p>
                {edu.startDate && (
                  <p className="text-xs text-muted font-mono mt-1">
                    {edu.startDate} — {edu.endDate || "Present"}
                  </p>
                )}
                {edu.description && (
                  <p className="text-sm text-muted mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {cvData.certifications.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-6">
            Certifications
          </h2>
          <ul className="space-y-2">
            {cvData.certifications.map((cert, i) => (
              <li key={i} className="text-sm text-muted flex gap-2">
                <span className="text-accent">•</span>
                {cert}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
