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
import rawCvData from "@/../content/cv.json";
import type { CvData } from "@/lib/cvData";
import SkillsGrid from "@/components/SkillsGrid";

const cvData = rawCvData as unknown as CvData;

export const metadata: Metadata = {
  title: "About | Chad Moore",
  description:
    "About Chad Moore — Full-stack engineer building enterprise systems from cloud to UI.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
        About Me
      </h1>

      <div className="prose prose-invert max-w-none space-y-6 text-muted leading-relaxed">
        <p className="text-lg">
          I&apos;m Chad Moore — a senior full-stack engineer with nearly three decades
          of experience designing and delivering complex enterprise systems. I&apos;ve
          worked across financial services, telecommunications, government, healthcare,
          and manufacturing — from Fortune 50 organizations to federal agencies.
        </p>

        <p>
          My work centers on enterprise integration, secure identity systems, and
          API architecture. I frequently operate in an architectural capacity —
          owning system design, integration strategy, and technical direction.
          More recently, I&apos;ve been leveraging agentic AI and MCP-based tooling
          to accelerate development while raising the bar on testing and code
          consistency.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-12 mb-4">
          What I Work With
        </h2>

        <SkillsGrid skills={cvData.skills} showIcons />

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
