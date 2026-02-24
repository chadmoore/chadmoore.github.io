/**
 * Skill types and helpers — single source of truth for skill tagging.
 *
 * Three dimensions let you slice your skills any way you want:
 *   • proficiency — how deep you go (expert / proficient / familiar)
 *   • preference  — what you *want* to work with (preferred / neutral)
 *   • status      — are you actively using it? (active / legacy)
 *
 * DRY: cv.json stores the raw data, this module normalises and sorts it,
 * and both the CV and About pages import from here.
 */

// ─── Types ──────────────────────────────────────────────────────────

export type Proficiency = "expert" | "proficient" | "familiar";
export type Preference = "preferred" | "neutral";
export type Status = "active" | "legacy";

/** What lives in cv.json — preference & status are optional (sane defaults). */
export interface Skill {
  name: string;
  proficiency: Proficiency;
  preference?: Preference;
  status?: Status;
}

/** After resolveSkill — every field is guaranteed present. */
export interface ResolvedSkill {
  name: string;
  proficiency: Proficiency;
  preference: Preference;
  status: Status;
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Fill in optional fields with sensible defaults.  KISS. */
export function resolveSkill(skill: Skill): ResolvedSkill {
  return {
    name: skill.name,
    proficiency: skill.proficiency,
    preference: skill.preference ?? "neutral",
    status: skill.status ?? "active",
  };
}

/**
 * Sort skills: preferred first, then by proficiency depth, legacy last.
 *
 * Numeric weights keep it dead simple — lower = higher in the list.
 */
const PREFERENCE_WEIGHT: Record<Preference, number> = {
  preferred: 0,
  neutral: 1,
};

const PROFICIENCY_WEIGHT: Record<Proficiency, number> = {
  expert: 0,
  proficient: 1,
  familiar: 2,
};

const STATUS_WEIGHT: Record<Status, number> = {
  active: 0,
  legacy: 1,
};

export function sortSkills(skills: Skill[]): ResolvedSkill[] {
  return skills.map(resolveSkill).sort((a, b) => {
    // 1. Active before legacy
    const statusDiff = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
    if (statusDiff !== 0) return statusDiff;

    // 2. Preferred before neutral
    const prefDiff =
      PREFERENCE_WEIGHT[a.preference] - PREFERENCE_WEIGHT[b.preference];
    if (prefDiff !== 0) return prefDiff;

    // 3. Expert → proficient → familiar
    return (
      PROFICIENCY_WEIGHT[a.proficiency] - PROFICIENCY_WEIGHT[b.proficiency]
    );
  });
}

/**
 * Return Tailwind classes for a skill pill based on its tags.
 *
 * Base pill styles live in the component — this only adds the
 * *differentiating* classes so nothing is duplicated.
 */
export function getSkillClasses(skill: ResolvedSkill): string {
  const classes: string[] = [];

  // Proficiency → weight
  if (skill.proficiency === "expert") {
    classes.push("font-semibold");
  }

  // Status → opacity
  if (skill.status === "legacy") {
    classes.push("opacity-60");
  }

  // Preference → border highlight  (applied last so it layers on top)
  if (skill.preference === "preferred") {
    classes.push("border-accent/60");
  } else {
    classes.push("border-border");
  }

  return classes.join(" ");
}

// ─── Sort Modes ─────────────────────────────────────────────────────

/**
 * Sort modes for the interactive skill grid.
 *
 *   default     — status → preference → proficiency (the original sort)
 *   proficiency — expert → proficient → familiar
 *   preference  — preferred → neutral
 *   status      — active → legacy
 */
export type SortMode = "default" | "proficiency" | "preference" | "status";

export function sortSkillsBy(
  skills: Skill[],
  mode: SortMode,
): ResolvedSkill[] {
  const resolved = skills.map(resolveSkill);

  if (mode === "default") {
    // Reuse the existing multi-key sort
    return sortSkills(skills);
  }

  return resolved.sort((a, b) => {
    switch (mode) {
      case "proficiency":
        return (
          PROFICIENCY_WEIGHT[a.proficiency] -
          PROFICIENCY_WEIGHT[b.proficiency]
        );
      case "preference":
        return (
          PREFERENCE_WEIGHT[a.preference] - PREFERENCE_WEIGHT[b.preference]
        );
      case "status":
        return STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
    }
  });
}

// ─── Filtering ──────────────────────────────────────────────────────

export interface SkillFilters {
  proficiency: Set<Proficiency>;
  preference: Set<Preference>;
  status: Set<Status>;
}

/** Default: everything visible. */
export const DEFAULT_FILTERS: SkillFilters = {
  proficiency: new Set<Proficiency>(["expert", "proficient", "familiar"]),
  preference: new Set<Preference>(["preferred", "neutral"]),
  status: new Set<Status>(["active", "legacy"]),
};

/**
 * Filter resolved skills by the active toggles.
 * Returns only skills whose tags are in every active set.
 */
export function filterSkills(
  skills: ResolvedSkill[],
  filters: SkillFilters,
): ResolvedSkill[] {
  return skills.filter(
    (skill) =>
      filters.proficiency.has(skill.proficiency) &&
      filters.preference.has(skill.preference) &&
      filters.status.has(skill.status),
  );
}
