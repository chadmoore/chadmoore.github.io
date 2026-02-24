/**
 * LinkedIn data import — pure parsing and transformation functions.
 *
 * Converts a LinkedIn data export (zip archive containing CSV files) into
 * the ContentData shape used by content.json. No I/O happens here — all
 * filesystem and zip handling lives in the API route.
 *
 * LinkedIn exports the following files we care about:
 *   Profile.csv     — name, headline, summary, location
 *   Positions.csv   — work experience
 *   Education.csv   — education history
 *   Skills.csv      — skill list (names only, no proficiency metadata)
 *
 * // Note: LinkedIn date strings look like "Mar 2020" or just "2020".
 * // Empty "Finished On" means currently employed there.
 */
import type { ContentData } from "@/lib/contentData";
import type { Skill } from "@/lib/skills";

// ─── LinkedIn raw data types ────────────────────────────────────────

/** Raw parsed rows from each LinkedIn CSV file. */
export interface LinkedInData {
  /** Single row from Profile.csv */
  profile: Record<string, string>;
  /** Rows from Positions.csv */
  positions: Record<string, string>[];
  /** Rows from Education.csv */
  education: Record<string, string>[];
  /** Rows from Skills.csv */
  skills: Record<string, string>[];
}

// ─── CSV Parser ─────────────────────────────────────────────────────

// ─── CSV Parser ───────────────────────────────────────────────────────

/**
 * Internal mutable state threaded through the CSV character-by-character loop.
 * Using an explicit object instead of closures keeps each processor function
 * independently testable and reduces cognitive complexity of the main loop.
 */
interface CSVState {
  field: string;
  row: string[];
  headers: string[];
  rows: Record<string, string>[];
  inQuote: boolean;
}

/** Commit the current row into state (either as headers or as a data row). */
function commitCSVRow(state: CSVState): void {
  state.row.push(state.field);
  state.field = "";

  if (state.headers.length === 0) {
    state.headers = state.row.map((h) => h.trim());
  } else if (state.row.some((f) => f !== "")) {
    const obj: Record<string, string> = {};
    state.headers.forEach((h, i) => { obj[h] = state.row[i] ?? ""; });
    state.rows.push(obj);
  }
  state.row = [];
}

/**
 * Process one character while inside a quoted field.
 * Returns `true` if the next character should be skipped (escaped quote `""`).
 */
function processQuotedChar(
  ch: string,
  nextCh: string | undefined,
  state: CSVState,
): boolean {
  if (ch !== '"') { state.field += ch; return false; }
  if (nextCh === '"') { state.field += '"'; return true; } // "" → escaped quote
  state.inQuote = false; // closing quote
  return false;
}

/** Process one character while outside a quoted field. */
function processUnquotedChar(ch: string, state: CSVState): void {
  if (ch === '"') { state.inQuote = true; return; }
  if (ch === ",") { state.row.push(state.field); state.field = ""; return; }
  if (ch === "\r") return; // CR in CRLF — the \n branch handles the row commit
  if (ch === "\n") { commitCSVRow(state); return; }
  state.field += ch;
}

/**
 * Parse RFC 4180 CSV text into an array of objects keyed by the header row.
 *
 * Handles:
 *  - UTF-8 BOM (stripped automatically)
 *  - Quoted fields containing commas, newlines, and escaped double-quotes ("")
 *  - Both CRLF and LF line endings
 *  - Trailing newlines
 */
export function parseCSVText(text: string): Record<string, string>[] {
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const state: CSVState = { field: "", row: [], headers: [], rows: [], inQuote: false };

  for (let i = 0; i < clean.length; i++) {
    if (state.inQuote) {
      if (processQuotedChar(clean[i], clean[i + 1], state)) i++;
    } else {
      processUnquotedChar(clean[i], state);
    }
  }

  // Flush any trailing content not followed by a newline
  if (state.field !== "" || state.row.length > 0) commitCSVRow(state);

  return state.rows;
}

// ─── Date Parser ────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/**
 * Convert a LinkedIn date string to ISO "YYYY-MM" or "YYYY" format.
 *
 * "Mar 2020" → "2020-03"
 * "2015"     → "2015"
 * ""         → ""
 * "Present"  → "" (treated as current/open-ended)
 */
export function parseLinkedInDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === "" || dateStr.trim().toLowerCase() === "present") {
    return "";
  }
  const trimmed = dateStr.trim();
  const parts = trimmed.split(" ");
  if (parts.length === 2) {
    const month = MONTH_MAP[parts[0]];
    if (month) return `${parts[1]}-${month}`;
  }
  // Year-only or unrecognized — pass through as-is
  return trimmed;
}

// ─── Content Builder ────────────────────────────────────────────────

/**
 * Transform parsed LinkedIn data into a ContentData object.
 *
 * If existing ContentData is provided, the non-CV sections (site links,
 * home content, about copy, etc.) are preserved. Only the CV section is
 * replaced by the LinkedIn data. The name in `site.name` is updated from
 * the LinkedIn profile.
 *
 * When no existing content is provided (fresh fork / bootstrap), all
 * sections are populated from getDefaultContent() with blanks for anything
 * LinkedIn doesn't supply.
 */
export function buildContentFromLinkedIn(
  li: LinkedInData,
  existing?: ContentData,
): ContentData {
  const profile = li.profile;
  const firstName = (profile["First Name"] ?? "").trim();
  const lastName = (profile["Last Name"] ?? "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const headline = (profile["Headline"] ?? "").trim();
  const summary = (profile["Summary"] ?? "").trim();
  const location = (profile["Geo Location"] ?? "").trim();

  const experience = li.positions.map((pos) => ({
    title: (pos["Title"] ?? "").trim(),
    company: (pos["Company Name"] ?? "").trim(),
    location: (pos["Location"] ?? "").trim(),
    startDate: parseLinkedInDate(pos["Started On"] ?? ""),
    endDate: parseLinkedInDate(pos["Finished On"] ?? ""),
    description: (pos["Description"] ?? "").trim(),
    highlights: [],
  }));

  const education = li.education.map((ed) => ({
    degree: (ed["Degree Name"] ?? "").trim(),
    institution: (ed["School Name"] ?? "").trim(),
    location: "",
    startDate: (ed["Start Date"] ?? "").trim(),
    endDate: (ed["End Date"] ?? "").trim(),
    description: (ed["Notes"] ?? "").trim(),
  }));

  const skillNames = li.skills
    .map((s) => (s["Name"] ?? "").trim())
    .filter(Boolean);

  const skillsCategories: Record<string, Skill[]> =
    skillNames.length > 0
      ? {
          Skills: skillNames.map((name) => ({
            name,
            proficiency: "familiar" as const,
          })),
        }
      : {};

  const base: ContentData = existing ?? getDefaultContent();

  return {
    ...base,
    site: {
      ...base.site,
      name: fullName || base.site.name,
    },
    cv: {
      ...base.cv,
      headline: headline || base.cv.headline,
      location: location || base.cv.location,
      summary: summary || base.cv.summary,
      experience,
      education,
      skills: skillsCategories,
    },
  };
}

// ─── Default Content ─────────────────────────────────────────────────

/**
 * Return a blank-slate ContentData for bootstrapping a new fork.
 *
 * All strings are empty; section flags default to enabled.
 * Override specific fields after import to personalise.
 */
export function getDefaultContent(): ContentData {
  return {
    site: {
      name: "",
      tagline: "",
      sections: { about: true, projects: true, blog: true, cv: true },
      links: { email: "", github: "", linkedin: "" },
      navOrder: ["home", "about", "cv", "blog", "projects"],
    },
    home: {
      greeting: "Hi, I'm",
      featureCards: [],
    },
    about: {
      heading: "About Me",
      intro: [],
      skillsHeading: "What I Work With",
      contactHeading: "Get In Touch",
      contactText: "",
    },
    projects: {
      heading: "Projects",
      description: "",
    },
    blog: {
      heading: "Blog",
      description: "",
    },
    cv: {
      headline: "",
      location: "",
      summary: "",
      specialties: [],
      experience: [],
      education: [],
      skills: {},
      certifications: [],
    },
  };
}
