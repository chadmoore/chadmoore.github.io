/**
 * CVExperience — filterable, sortable work history for the CV page.
 *
 * The filter toggles (proficiency / preference / status) control which
 * highlight bullets are visible by cross-referencing the skill tags on
 * each bullet against the full skills dictionary. A highlight with no
 * skill tags is always shown. A highlight with skill tags is shown only
 * when at least one of its skills passes all three active filters.
 *
 * Entries whose every highlight is filtered out are dimmed rather than
 * removed — the job title and company always remain visible so the
 * timeline reads coherently even in a narrow filter state.
 *
 * Sort modes:
 *   date       — reverse-chronological order (default, matches JSON order)
 *   relevance  — entries with the highest skill-weight density per bullet
 *                float to the top (quality over quantity)
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { formatDateRange } from "@/lib/dates";
import TogglePill from "@/components/TogglePill";
import {
  resolveSkill,
  filterSkills,
  toggleInSet,
  type ResolvedSkill,
  type Skill,
  type SkillFilters,
  type Proficiency,
  type Preference,
  type Status,
} from "@/lib/skills";
import type { Experience, Highlight } from "@/lib/contentData";

interface CVExperienceProps {
  experience: Experience[];
  skills: Record<string, Skill[]>;
}

type SortMode = "date" | "relevance";

// ─── Relevance scoring ──────────────────────────────────────────────

// Weight tables — module-level constants to avoid re-creation on every render.
const PROF_SCORE: Record<Proficiency, number> = { expert: 3, proficient: 2, familiar: 1 };
const PREF_SCORE: Record<Preference, number> = { preferred: 2, neutral: 1 };
const STAT_SCORE: Record<Status, number> = { active: 2, legacy: 1 };

/**
 * Compute skill-density score: total weight of visible skills divided by the
 * number of highlights that carry at least one skill tag.
 *
 * Using a density (average per tagged highlight) rather than a raw sum means
 * entries with fewer but richer bullets beat entries that simply have more
 * bullets — producing a meaningfully different order from date sort.
 *
 * Expert + preferred + active  → per-skill weight 12
 * Familiar + neutral + legacy  → per-skill weight  1
 * Entry with no tagged highlights → 0 (sinks to bottom)
 */
function computeRelevanceScore(
  highlights: Highlight[],
  visibleSkillNames: Set<string>,
  skillMap: Map<string, ResolvedSkill>,
): number {
  let total = 0;
  let taggedCount = 0;

  for (const h of highlights) {
    if (h.skills.length === 0) continue;
    taggedCount++;
    for (const sName of h.skills) {
      if (!visibleSkillNames.has(sName)) continue;
      const r = skillMap.get(sName);
      if (r) total += PROF_SCORE[r.proficiency] * PREF_SCORE[r.preference] * STAT_SCORE[r.status];
    }
  }

  return taggedCount === 0 ? 0 : total / taggedCount;
}

// ─── Component ───────────────────────────────────────────────────────

export default function CVExperience({ experience, skills }: CVExperienceProps) {
  // ── Filter state ─────────────────────────────────────────────────
  const [proficiency, setProficiency] = useState<Set<Proficiency>>(
    new Set(["expert", "proficient", "familiar"]),
  );
  const [preference, setPreference] = useState<Set<Preference>>(
    new Set(["preferred", "neutral"]),
  );
  const [status, setStatus] = useState<Set<Status>>(
    new Set(["active", "legacy"]),
  );
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [collapsedJobs, setCollapsedJobs] = useState<Set<string>>(new Set());

  const toggleCollapsed = useCallback((key: string) => {
    setCollapsedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  }, []);

  const filters: SkillFilters = useMemo(
    () => ({ proficiency, preference, status }),
    [proficiency, preference, status],
  );

  // Build a Set of skill names that survive the current filters
  const visibleSkillNames = useMemo(() => {
    const allSkills = Object.values(skills).flat().map(resolveSkill);
    return new Set(filterSkills(allSkills, filters).map((s) => s.name));
  }, [skills, filters]);

  // Build a name→ResolvedSkill lookup once per skills-prop change
  const skillMap = useMemo(
    () => new Map(Object.values(skills).flat().map((s) => [s.name, resolveSkill(s)])),
    [skills],
  );

  // Process experience: attach visible highlights, match count, and relevance score
  const processed = useMemo(() => {
    const entries = experience.map((job) => {
      const visibleHighlights = job.highlights.filter(
        (h) =>
          h.skills.length === 0 || h.skills.some((s) => visibleSkillNames.has(s)),
      );
      const relevanceScore = computeRelevanceScore(
        job.highlights,
        visibleSkillNames,
        skillMap,
      );
      return { job, visibleHighlights, matchCount: visibleHighlights.length, relevanceScore };
    });

    if (sortMode === "relevance") {
      entries.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    return entries;
  }, [experience, visibleSkillNames, skillMap, sortMode]);

  // ── Toggle handlers ──────────────────────────────────────────────
  const toggleProficiency = useCallback(
    (v: Proficiency) => setProficiency((s) => toggleInSet(s, v)),
    [],
  );
  const togglePreference = useCallback(
    (v: Preference) => setPreference((s) => toggleInSet(s, v)),
    [],
  );
  const toggleStatus = useCallback(
    (v: Status) => setStatus((s) => toggleInSet(s, v)),
    [],
  );

  return (
    <div className="space-y-6">
      {/* ── Filter + sort bar ──────────────────────────────────── */}
      <div className="sticky top-14 z-10 bg-surface space-y-2 pt-3 pb-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
          <span className="text-muted font-medium uppercase tracking-wider text-[10px]">
            Show
          </span>
          <TogglePill label="Expert" active={proficiency.has("expert")} onClick={() => toggleProficiency("expert")} />
          <TogglePill label="Proficient" active={proficiency.has("proficient")} onClick={() => toggleProficiency("proficient")} />
          <TogglePill label="Familiar" active={proficiency.has("familiar")} onClick={() => toggleProficiency("familiar")} />
          <span className="w-px h-3.5 bg-border" />
          <TogglePill label="Preferred" active={preference.has("preferred")} onClick={() => togglePreference("preferred")} />
          <TogglePill label="Neutral" active={preference.has("neutral")} onClick={() => togglePreference("neutral")} />
          <span className="w-px h-3.5 bg-border" />
          <TogglePill label="Active" active={status.has("active")} onClick={() => toggleStatus("active")} />
          <TogglePill label="Legacy" active={status.has("legacy")} onClick={() => toggleStatus("legacy")} />
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="text-muted font-medium uppercase tracking-wider text-[10px]">
            Sort
          </span>
          {(["date", "relevance"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSortMode(mode)}
              className={`px-2.5 py-0.5 rounded-full border text-xs transition-colors capitalize ${
                sortMode === mode
                  ? "border-accent/60 text-accent bg-accent/10"
                  : "border-border text-muted bg-surface hover:border-accent/30"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ── Experience entries ──────────────────────────────────── */}
      <div className="space-y-8">
        {processed.map(({ job, visibleHighlights, matchCount }) => {
          const jobKey = `${job.company}-${job.startDate}`;
          const isCollapsed = collapsedJobs.has(jobKey);
          // Dim entries where all highlights were filtered out (but some exist)
          const fullyFiltered = job.highlights.length > 0 && matchCount === 0;
          return (
            <div
              key={jobKey}
              className={`relative pl-6 border-l-2 transition-colors ${
                fullyFiltered
                  ? "border-border/30 opacity-40"
                  : "border-border hover:border-accent/50"
              }`}
            >
              {/* Collapse toggle — full-height strip covering the bar + dot */}
              <button
                type="button"
                aria-label={isCollapsed ? "Expand job details" : "Collapse job details"}
                aria-expanded={!isCollapsed}
                onClick={() => toggleCollapsed(jobKey)}
                className="absolute -left-2 inset-y-0 w-4 flex items-start pt-0.5 cursor-pointer group"
              >
                <span className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  isCollapsed
                    ? "bg-accent/40 border-accent"
                    : "bg-surface border-border group-hover:border-accent group-hover:bg-accent/10"
                }`} />
              </button>
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-1">
                <h3 className="font-semibold">{job.title}</h3>
                <span className="text-xs text-muted font-mono shrink-0">
                  {formatDateRange(job.startDate, job.endDate)}
                </span>
              </div>
              <p className={`text-sm text-accent ${isCollapsed ? "" : "mb-2"}`}>
                {job.company}
                {job.location && (
                  <span className="text-muted"> · {job.location}</span>
                )}
              </p>
              {!isCollapsed && (
                <>
                  {job.description && (
                    <p className="text-sm text-muted mb-2">{job.description}</p>
                  )}
                  {visibleHighlights.length > 0 && (
                    <ul className="space-y-3">
                      {visibleHighlights.map((highlight, j) => (
                        <li key={j} className="text-sm text-muted">
                          <div className="flex gap-2">
                            <span className="text-accent mt-1 shrink-0">•</span>
                            <span>{highlight.text}</span>
                          </div>
                          {highlight.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5 ml-5">
                              {highlight.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[10px] text-accent/80 bg-accent/5 border border-accent/20 px-2 py-0.5 rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
