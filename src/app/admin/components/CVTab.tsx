/**
 * CVTab — headline, location, summary, specialties, and experience.
 *
 * Experience entries are collapsible accordion cards. Each entry
 * supports editing title, company, location, date range, description,
 * and highlights (with per-highlight skill tags).
 */
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import type { ContentData, Experience, Highlight } from "@/lib/contentData";
import { Field, inputClass } from "./Field";

interface CVTabProps {
  data: ContentData;
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Update a single experience entry by index. */
function updateExperience(
  updateField: CVTabProps["updateField"],
  index: number,
  updater: (exp: Experience) => Experience,
) {
  updateField("cv", (cv) => {
    const experience = cv.experience.map((e, i) => (i === index ? updater(e) : e));
    return { ...cv, experience };
  });
}

/** Update a single highlight within an experience entry. */
function updateHighlight(
  updateField: CVTabProps["updateField"],
  expIndex: number,
  hlIndex: number,
  updater: (hl: Highlight) => Highlight,
) {
  updateExperience(updateField, expIndex, (exp) => ({
    ...exp,
    highlights: exp.highlights.map((h, j) => (j === hlIndex ? updater(h) : h)),
  }));
}

const BLANK_EXPERIENCE: Experience = {
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
  highlights: [],
};

// ─── Component ──────────────────────────────────────────────────────

export function CVTab({ data, updateField }: CVTabProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const moveExperience = (from: number, to: number) => {
    if (to < 0 || to >= data.cv.experience.length) return;
    updateField("cv", (cv) => {
      const experience = [...cv.experience];
      const [moved] = experience.splice(from, 1);
      experience.splice(to, 0, moved);
      return { ...cv, experience };
    });
    // Update expanded set to follow the moved item
    setExpanded((prev) => {
      const next = new Set<number>();
      for (const idx of prev) {
        if (idx === from) next.add(to);
        else if (from < to && idx > from && idx <= to) next.add(idx - 1);
        else if (from > to && idx >= to && idx < from) next.add(idx + 1);
        else next.add(idx);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">CV / Resume</h2>

      {/* ── Top-level fields ─────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <Field label="Headline">
          <input
            type="text"
            value={data.cv.headline}
            onChange={(e) => updateField("cv", (cv) => ({ ...cv, headline: e.target.value }))}
            aria-label="Headline"
            className={inputClass}
          />
        </Field>
        <Field label="Location">
          <input
            type="text"
            value={data.cv.location}
            onChange={(e) => updateField("cv", (cv) => ({ ...cv, location: e.target.value }))}
            aria-label="Location"
            className={inputClass}
          />
        </Field>
        <Field label="Summary">
          <textarea
            value={data.cv.summary}
            onChange={(e) => updateField("cv", (cv) => ({ ...cv, summary: e.target.value }))}
            rows={6}
            aria-label="Summary"
            className={inputClass + " resize-y"}
          />
        </Field>
      </div>

      {/* ── Specialties ──────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Specialties</h3>
        {data.cv.specialties.map((specialty, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={specialty}
              onChange={(e) =>
                updateField("cv", (cv) => {
                  const specialties = [...cv.specialties];
                  specialties[index] = e.target.value;
                  return { ...cv, specialties };
                })
              }
              aria-label={`Specialty ${index + 1}`}
              className={inputClass}
            />
            <button
              onClick={() =>
                updateField("cv", (cv) => ({
                  ...cv,
                  specialties: cv.specialties.filter((_, i) => i !== index),
                }))
              }
              className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 text-sm px-1"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            updateField("cv", (cv) => ({
              ...cv,
              specialties: [...cv.specialties, ""],
            }))
          }
          className="text-xs text-accent hover:text-accent-hover transition-colors"
        >
          + Add Specialty
        </button>
      </div>

      {/* ── Experience ───────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Experience</h3>
          <span className="text-xs text-muted">{data.cv.experience.length} entries</span>
        </div>

        {data.cv.experience.map((exp, expIndex) => {
          const isOpen = expanded.has(expIndex);
          return (
            <div
              key={expIndex}
              className="bg-surface border border-border rounded-lg overflow-hidden"
            >
              {/* ── Collapsed header ───────────────────────── */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleExpanded(expIndex)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpanded(expIndex); } }}
                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-surface-hover transition-colors cursor-pointer"
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">
                    {exp.title || "Untitled Position"}
                  </span>
                  <span className="text-xs text-muted truncate block">
                    {exp.company}
                    {exp.startDate && ` · ${exp.startDate}`}
                    {exp.endDate && ` – ${exp.endDate}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveExperience(expIndex, expIndex - 1); }}
                    disabled={expIndex === 0}
                    title="Move up"
                    className="p-1 text-muted hover:text-foreground disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveExperience(expIndex, expIndex + 1); }}
                    disabled={expIndex === data.cv.experience.length - 1}
                    title="Move down"
                    className="p-1 text-muted hover:text-foreground disabled:opacity-30"
                  >
                    ▼
                  </button>
                  <GripVertical className="w-4 h-4 text-muted/40" />
                </div>
              </div>

              {/* ── Expanded body ──────────────────────────── */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Title">
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) =>
                          updateExperience(updateField, expIndex, (ex) => ({ ...ex, title: e.target.value }))
                        }
                        aria-label="Title"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Company">
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(updateField, expIndex, (ex) => ({ ...ex, company: e.target.value }))
                        }
                        aria-label="Company"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Location">
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) =>
                          updateExperience(updateField, expIndex, (ex) => ({ ...ex, location: e.target.value }))
                        }
                        aria-label="Experience Location"
                        className={inputClass}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Start Date">
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) =>
                            updateExperience(updateField, expIndex, (ex) => ({ ...ex, startDate: e.target.value }))
                          }
                          placeholder="YYYY-MM"
                          aria-label="Start Date"
                          className={inputClass}
                        />
                      </Field>
                      <Field label="End Date">
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) =>
                            updateExperience(updateField, expIndex, (ex) => ({ ...ex, endDate: e.target.value }))
                          }
                          placeholder="YYYY-MM or Present"
                          aria-label="End Date"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>

                  <Field label="Description">
                    <textarea
                      value={exp.description}
                      onChange={(e) =>
                        updateExperience(updateField, expIndex, (ex) => ({ ...ex, description: e.target.value }))
                      }
                      rows={3}
                      aria-label="Experience Description"
                      className={inputClass + " resize-y"}
                    />
                  </Field>

                  {/* ── Highlights ──────────────────────────── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-muted uppercase tracking-wider">
                        Highlights ({exp.highlights.length})
                      </h4>
                    </div>

                    {exp.highlights.map((hl, hlIndex) => (
                      <div
                        key={hlIndex}
                        className="border border-border rounded-lg p-3 space-y-2 bg-background"
                      >
                        <div className="flex gap-2">
                          <textarea
                            value={hl.text}
                            onChange={(e) =>
                              updateHighlight(updateField, expIndex, hlIndex, (h) => ({
                                ...h,
                                text: e.target.value,
                              }))
                            }
                            rows={2}
                            aria-label={`Highlight ${hlIndex + 1}`}
                            className={inputClass + " resize-y flex-1"}
                          />
                          <button
                            onClick={() =>
                              updateExperience(updateField, expIndex, (ex) => ({
                                ...ex,
                                highlights: ex.highlights.filter((_, j) => j !== hlIndex),
                              }))
                            }
                            className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 text-sm px-1 self-start"
                            title="Remove highlight"
                          >
                            ✕
                          </button>
                        </div>
                        {/* Skill tags */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {hl.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1 text-[10px] text-accent bg-accent/5 border border-accent/20 px-2 py-0.5 rounded-full"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() =>
                                  updateHighlight(updateField, expIndex, hlIndex, (h) => ({
                                    ...h,
                                    skills: h.skills.filter((_, k) => k !== sIdx),
                                  }))
                                }
                                className="text-accent/60 hover:text-red-500 ml-0.5"
                                title={`Remove ${skill}`}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                          <SkillAdder
                            onAdd={(skill) =>
                              updateHighlight(updateField, expIndex, hlIndex, (h) => ({
                                ...h,
                                skills: [...h.skills, skill],
                              }))
                            }
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() =>
                        updateExperience(updateField, expIndex, (ex) => ({
                          ...ex,
                          highlights: [...ex.highlights, { text: "", skills: [] }],
                        }))
                      }
                      className="text-xs text-accent hover:text-accent-hover transition-colors"
                    >
                      + Add Highlight
                    </button>
                  </div>

                  {/* ── Delete entry ────────────────────────── */}
                  <div className="pt-2 border-t border-border">
                    <button
                      onClick={() =>
                        updateField("cv", (cv) => ({
                          ...cv,
                          experience: cv.experience.filter((_, i) => i !== expIndex),
                        }))
                      }
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                    >
                      Delete this position
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={() =>
            updateField("cv", (cv) => ({
              ...cv,
              experience: [...cv.experience, { ...BLANK_EXPERIENCE }],
            }))
          }
          className="text-xs text-accent hover:text-accent-hover transition-colors"
        >
          + Add Position
        </button>
      </div>
    </div>
  );
}

// ─── SkillAdder ─────────────────────────────────────────────────────

/** Tiny inline input that appears when "+ Skill" is clicked. */
function SkillAdder({ onAdd }: { onAdd: (skill: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed) onAdd(trimmed);
    setValue("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="text-[10px] text-accent hover:text-accent-hover transition-colors"
      >
        + Skill
      </button>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setValue(""); setAdding(false); }
      }}
      autoFocus
      placeholder="Skill name"
      aria-label="Add skill tag"
      className="text-[10px] w-24 bg-background border border-accent/30 rounded-full px-2 py-0.5 outline-none focus:border-accent"
    />
  );
}
