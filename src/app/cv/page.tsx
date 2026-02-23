import type { Metadata } from "next";
import cvData from "@/../content/cv.json";

export const metadata: Metadata = {
  title: "CV | Chad Moore",
  description: cvData.headline,
};

function formatDateRange(start: string, end: string | null): string {
  const fmt = (d: string) => {
    const [year, month] = d.split("-");
    if (!month) return year;
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  return `${fmt(start)} — ${end ? fmt(end) : "Present"}`;
}

export default function CVPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          {cvData.name}
        </h1>
        <p className="text-lg text-accent mb-1">{cvData.headline}</p>
        <p className="text-sm text-muted">{cvData.location}</p>
        <div className="flex gap-4 mt-4 text-sm">
          {cvData.links.email && (
            <a
              href={`mailto:${cvData.links.email}`}
              className="text-muted hover:text-accent transition-colors"
            >
              Email
            </a>
          )}
          {cvData.links.linkedin && (
            <a
              href={cvData.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors"
            >
              LinkedIn
            </a>
          )}
          {cvData.links.github && (
            <a
              href={cvData.links.github}
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
            {cvData.specialties.map((s) => (
              <span
                key={s}
                className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full"
              >
                {s}
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
          <div className="space-y-8">
            {cvData.experience.map((job, i) => (
              <div
                key={i}
                className="relative pl-6 border-l-2 border-border hover:border-accent/50 transition-colors"
              >
                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-surface border-2 border-border" />
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-1">
                  <h3 className="font-semibold">{job.title}</h3>
                  <span className="text-xs text-muted font-mono shrink-0">
                    {formatDateRange(job.startDate, job.endDate)}
                  </span>
                </div>
                <p className="text-sm text-accent mb-2">
                  {job.company}
                  {job.location && (
                    <span className="text-muted"> · {job.location}</span>
                  )}
                </p>
                {job.description && (
                  <p className="text-sm text-muted mb-2">{job.description}</p>
                )}
                {job.highlights.length > 0 && (
                  <ul className="space-y-1">
                    {job.highlights.map((h, j) => (
                      <li key={j} className="text-sm text-muted flex gap-2">
                        <span className="text-accent mt-1 shrink-0">•</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
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
                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-surface border-2 border-border" />
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

      {/* Skills */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-6">
          Skills
        </h2>
        <div className="space-y-4">
          {Object.entries(cvData.skills).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-foreground mb-2">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-surface border border-border px-3 py-1.5 rounded-lg hover:border-accent/50 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

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
