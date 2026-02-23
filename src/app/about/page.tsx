/**
 * About Page — The "who is this person" page.
 *
 * Intentionally written in first person and kept short.
 * Nobody reads a 2000-word about page. If they want the
 * full story, that's what the CV page is for.
 *
 * The skills grid is driven by cv.json — single source of truth.
 * Update your skills in one place and both the About and CV
 * pages stay in sync automatically.
 *
 * // If you've read this far into the source code of someone's
 * // about page, we should probably be friends. chad@chadmoore.info
 */
import type { Metadata } from "next";
import cvData from "@/../content/cv.json";

export const metadata: Metadata = {
  title: "About | Chad Moore",
  description: "About Chad Moore — Creative Data Driven Full Stack Software",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
        About Me
      </h1>

      <div className="prose prose-invert max-w-none space-y-6 text-muted leading-relaxed">
        <p className="text-lg">
          I&apos;m Chad Moore — a full-stack software developer who loves building
          creative, data-driven solutions. I enjoy working across the entire
          stack, from crafting intuitive front-end experiences to designing
          robust back-end systems.
        </p>

        <p>
          My work spans web applications, data pipelines, APIs, and everything
          in between. I believe great software comes from curiosity, clear
          thinking, and a willingness to iterate.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-12 mb-4">
          What I Work With
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(cvData.skills).map(([category, skills]) => (
            <div key={category} className="space-y-3">
              {/* Category header: icon + title side by side */}
              <div className="flex items-center gap-2">
                <SkillIcon category={category} />
                <h3 className="text-sm font-semibold text-foreground">{category}</h3>
              </div>
              {/* Skill pills */}
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs hover:border-accent/50 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-foreground mt-12 mb-4">
          Get In Touch
        </h2>
        <p>
          The best way to reach me is by{" "}
          <a
            href="mailto:chad@chadmoore.info"
            className="text-accent hover:text-accent-hover transition-colors underline underline-offset-4"
          >
            email
          </a>
          {" "}or on{" "}
          <a
            href="https://www.linkedin.com/in/chad-moore-info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition-colors underline underline-offset-4"
          >
            LinkedIn
          </a>
          . I&apos;m always open to interesting conversations and collaborations.
        </p>
      </div>
    </div>
  );
}

/** Maps a cv.json skill category name to a small SVG icon. */
function SkillIcon({ category }: { category: string }) {
  const cls = "w-4 h-4 text-accent shrink-0";

  switch (category) {
    case "Frontend":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case "Backend":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
          <circle cx="6" cy="6" r="1" fill="currentColor" /><circle cx="6" cy="18" r="1" fill="currentColor" />
        </svg>
      );
    case "Cloud & Infrastructure":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
      );
    case "Identity & Security":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "Data":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case "AI & Tooling":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
          <path d="M16 14H8l-2 8h12l-2-8z" /><line x1="12" y1="8" x2="12" y2="14" />
        </svg>
      );
    default:
      // Fallback: generic cube icon for any new category
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
  }
}
