/**
 * ContentData types — Single source of truth for content.json shape.
 *
 * Every file that reads or writes content.json imports from here.
 * DRY: change the shape in one place, fix it everywhere.
 *
 * Structure:
 *  - site: global identity, section toggles, contact links
 *  - home: homepage-specific content (greeting, feature cards)
 *  - about: about page copy and section headings
 *  - blog: blog index heading and description
 *  - cv: resume data (experience, education, skills, etc.)
 */
import type { Skill } from "@/lib/skills";

// ─── Shared sub-types ───────────────────────────────────────────────

/** A highlight bullet within an experience entry. */
export interface Highlight {
  text: string;
  skills: string[];
}

/** A single work experience entry. */
export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: Highlight[];
}

/** An education entry (may be empty array in the JSON). */
export interface Education {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

/** Section visibility flags. */
export type SectionKey = "about" | "projects" | "blog" | "cv";

// ─── Section types ──────────────────────────────────────────────────

/** Global site identity and configuration. */
export interface SiteSection {
  name: string;
  tagline: string;
  sections: Record<SectionKey, boolean>;
  links: { email: string; github: string; linkedin: string };
  navOrder: string[];
}

/** A homepage feature card. */
export interface FeatureCard {
  title: string;
  description: string;
  icon: string;
}

/** Homepage-specific content. */
export interface HomeSection {
  greeting: string;
  featureCards: FeatureCard[];
}

/** About page content. */
export interface AboutSection {
  heading: string;
  intro: string[];
  skillsHeading: string;
  contactHeading: string;
  contactText: string;
}

/** Projects page content. */
export interface ProjectsSection {
  heading: string;
  description: string;
}

/** Blog index content. */
export interface BlogSection {
  heading: string;
  description: string;
}

/** CV / resume data. */
export interface CvSection {
  headline: string;
  location: string;
  summary: string;
  specialties: string[];
  experience: Experience[];
  education: Education[];
  skills: Record<string, Skill[]>;
  certifications: string[];
}

// ─── Root type ──────────────────────────────────────────────────────

/** The full shape of content/content.json. */
export interface ContentData {
  site: SiteSection;
  home: HomeSection;
  about: AboutSection;
  projects: ProjectsSection;
  blog: BlogSection;
  cv: CvSection;
}
