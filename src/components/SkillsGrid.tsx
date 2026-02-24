/**
 * SkillsGrid — interactive, filterable, sortable skill display.
 *
 * Shared by the CV and About pages. Client component because
 * filter/sort toggles require useState + event handlers.
 *
 * Props:
 *   skills    — { "Frontend": [...], "Backend": [...] } from cv.json
 *   showIcons — render category SVG icons (About page) or not (CV page)
 *
 * UX: every toggle pill = one value in one dimension.
 * Highlighted = that value is visible. Click to hide.
 * All values start ON so nothing is hidden by default.
 *
 * This gives a uniform mental model: "turn off what you don't want."
 *
 * // If you want to add a new filter dimension, add it to
 * // SkillFilters in skills.ts and wire up a button here. Easy.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import SkillIcon from "@/components/SkillIcon";
import TogglePill from "@/components/TogglePill";
import {
  sortSkillsBy,
  filterSkills,
  getSkillClasses,
  toggleInSet,
  type Skill,
  type SortMode,
  type SkillFilters,
  type Proficiency,
  type Preference,
  type Status,
} from "@/lib/skills";

interface SkillsGridProps {
  skills: Record<string, Skill[]>;
  showIcons?: boolean;
}

export default function SkillsGrid({ skills, showIcons = false }: SkillsGridProps) {
  // ── Filter state — all values ON by default ─────────────────────
  const [proficiency, setProficiency] = useState<Set<Proficiency>>(
    new Set(["expert", "proficient", "familiar"]),
  );
  const [preference, setPreference] = useState<Set<Preference>>(
    new Set(["preferred", "neutral"]),
  );
  const [status, setStatus] = useState<Set<Status>>(
    new Set(["active", "legacy"]),
  );
  const [sortMode, setSortMode] = useState<SortMode>("default");

  // Build the SkillFilters object from toggle state
  const filters: SkillFilters = useMemo(
    () => ({ proficiency, preference, status }),
    [proficiency, preference, status],
  );

  // ── Sort + filter each category ─────────────────────────────────
  const processed = useMemo(() => {
    const result: { category: string; skills: ReturnType<typeof sortSkillsBy> }[] = [];
    let totalVisible = 0;

    for (const [category, items] of Object.entries(skills)) {
      const sorted = sortSkillsBy(items, sortMode);
      const filtered = filterSkills(sorted, filters);
      if (filtered.length > 0) {
        result.push({ category, skills: filtered });
        totalVisible += filtered.length;
      }
    }

    return { categories: result, totalVisible };
  }, [skills, sortMode, filters]);

  // Total across all categories (for "X of Y")
  const totalSkills = useMemo(
    () => Object.values(skills).reduce((sum, arr) => sum + arr.length, 0),
    [skills],
  );

  // ── Toggle handlers ─────────────────────────────────────────────
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

  const sortModes: SortMode[] = ["default", "proficiency", "preference", "status"];

  return (
    <div className="space-y-4">
      {/* ── Toggle bar ─────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* ── Filter row ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
          <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Show</span>

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

        {/* ── Sort row ───────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Sort</span>
          {sortModes.map((mode) => (
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
              {mode === "default" ? "Default" : mode}
            </button>
          ))}

          <span className="w-px h-3.5 bg-border" />
          <span className="text-muted text-[10px]">
            {processed.totalVisible}{processed.totalVisible !== totalSkills ? ` of ${totalSkills}` : ""} skill{processed.totalVisible !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Skill categories + pills ──────────────────────────── */}
      <div className={showIcons ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
        {processed.categories.map(({ category, skills: filteredSkills }) => (
          <div key={category} className={showIcons ? "space-y-3" : ""}>
            {/* Category header */}
            <div className={showIcons ? "flex items-center gap-2" : ""}>
              {showIcons && <SkillIcon category={category} />}
              <h3 className={`text-sm font-${showIcons ? "semibold" : "medium"} text-foreground ${showIcons ? "" : "mb-2"}`}>
                {category}
              </h3>
            </div>
            {/* Skill pills */}
            <div className="flex flex-wrap gap-2">
              {filteredSkills.map((skill) => (
                <span
                  key={skill.name}
                  title={`${skill.proficiency}${skill.preference === "preferred" ? " · preferred" : ""}${skill.status === "legacy" ? " · legacy" : ""}`}
                  className={`text-xs bg-surface border px-3 py-1.5 rounded-lg hover:border-accent/50 transition-colors ${getSkillClasses(skill)}`}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

