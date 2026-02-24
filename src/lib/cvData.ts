/**
 * CvData types — Single source of truth for cv.json shape.
 *
 * Every file that reads or writes cv.json imports from here.
 * DRY: change the shape in one place, fix it everywhere.
 */
import type { Skill } from "@/lib/skills";

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

/** The full shape of content/cv.json. */
export interface CvData {
  name: string;
  headline: string;
  location: string;
  summary: string;
  specialties: string[];
  links: { email: string; github: string; linkedin: string };
  experience: Experience[];
  education: Education[];
  skills: Record<string, Skill[]>;
  certifications: string[];
}
