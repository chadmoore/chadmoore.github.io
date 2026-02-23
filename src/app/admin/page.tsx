/**
 * Admin Page — Local development skill & CV management.
 *
 * Client component that talks to /api/admin/cv to read and write
 * cv.json. Only functional when running `next dev` — the API
 * routes don't exist in the static export.
 *
 * This is intentionally no-frills. It's a dev tool, not a product.
 * KISS: one page, one fetch, one save button.
 *
 * // If you're reading this code and thinking "this should use
 * // a form library" — you're probably right, but it ships today.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Skill, Proficiency, Preference, Status } from "@/lib/skills";

// ─── Types ──────────────────────────────────────────────────────────

interface CvData {
  name: string;
  headline: string;
  location: string;
  summary: string;
  specialties: string[];
  experience: Record<string, unknown>[];
  education: Record<string, unknown>[];
  skills: Record<string, Skill[]>;
  certifications: Record<string, unknown>[];
  links: Record<string, string>;
}

// ─── Constants ──────────────────────────────────────────────────────

const PROFICIENCY_OPTIONS: Proficiency[] = ["expert", "proficient", "familiar"];
const PREFERENCE_OPTIONS: Preference[] = ["preferred", "neutral"];
const STATUS_OPTIONS: Status[] = ["active", "legacy"];

// ─── Component ──────────────────────────────────────────────────────

export default function AdminPage() {
  const [data, setData] = useState<CvData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch cv data on mount
  useEffect(() => {
    fetch("/api/admin/cv")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setMessage("Failed to load CV data. Is the dev server running?"));
  }, []);

  // ─── Skill Mutations ─────────────────────────────────────────────

  const updateSkill = useCallback(
    (category: string, index: number, field: keyof Skill, value: string) => {
      if (!data) return;
      setData((prev) => {
        if (!prev) return prev;
        const skills = { ...prev.skills };
        const list = [...skills[category]];
        list[index] = { ...list[index], [field]: value };
        skills[category] = list;
        return { ...prev, skills };
      });
    },
    [data]
  );

  const removeSkill = useCallback(
    (category: string, index: number) => {
      if (!data) return;
      setData((prev) => {
        if (!prev) return prev;
        const skills = { ...prev.skills };
        const list = [...skills[category]];
        list.splice(index, 1);
        skills[category] = list;
        return { ...prev, skills };
      });
    },
    [data]
  );

  const addSkill = useCallback(
    (category: string) => {
      if (!data) return;
      setData((prev) => {
        if (!prev) return prev;
        const skills = { ...prev.skills };
        const list = [...skills[category]];
        list.push({ name: "", proficiency: "proficient" });
        skills[category] = list;
        return { ...prev, skills };
      });
    },
    [data]
  );

  const addCategory = useCallback(() => {
    const name = prompt("New category name:");
    if (!name || !data) return;
    setData((prev) => {
      if (!prev) return prev;
      const skills = { ...prev.skills };
      skills[name] = [{ name: "", proficiency: "proficient" }];
      return { ...prev, skills };
    });
  }, [data]);

  const removeCategory = useCallback(
    (category: string) => {
      if (!data) return;
      if (!confirm(`Remove "${category}" and all its skills?`)) return;
      setData((prev) => {
        if (!prev) return prev;
        const skills = { ...prev.skills };
        delete skills[category];
        return { ...prev, skills };
      });
    },
    [data]
  );

  // ─── Save ─────────────────────────────────────────────────────────

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    setMessage("");
    try {
      // Strip empty skill names before saving
      const cleaned = {
        ...data,
        skills: Object.fromEntries(
          Object.entries(data.skills).map(([cat, skills]) => [
            cat,
            skills.filter((s) => s.name.trim() !== ""),
          ])
        ),
      };
      const res = await fetch("/api/admin/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      if (res.ok) {
        setMessage("Saved!");
        setData(cleaned);
      } else {
        setMessage("Save failed.");
      }
    } catch {
      setMessage("Save failed — is the dev server running?");
    } finally {
      setSaving(false);
    }
  }, [data]);

  // ─── Render ───────────────────────────────────────────────────────

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin — CV Editor</h1>
          <p className="text-sm text-muted mt-1">
            Development only — edits cv.json on disk
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {message && (
        <p
          className={`mb-6 text-sm ${
            message.includes("Saved") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}

      {/* ─── Skills Editor ─────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Skills</h2>
          <button
            onClick={addCategory}
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            + Add Category
          </button>
        </div>

        <div className="space-y-8">
          {Object.entries(data.skills).map(([category, skills]) => (
            <div
              key={category}
              className="bg-surface border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{category}</h3>
                <button
                  onClick={() => removeCategory(category)}
                  className="text-xs text-red-400 hover:text-red-300"
                  title="Remove category"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {skills.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 flex-wrap"
                  >
                    {/* Name */}
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) =>
                        updateSkill(category, i, "name", e.target.value)
                      }
                      placeholder="Skill name"
                      className="flex-1 min-w-[140px] bg-background border border-border rounded px-2 py-1 text-sm"
                    />

                    {/* Proficiency */}
                    <select
                      value={skill.proficiency}
                      onChange={(e) =>
                        updateSkill(category, i, "proficiency", e.target.value)
                      }
                      className="bg-background border border-border rounded px-2 py-1 text-sm"
                    >
                      {PROFICIENCY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {/* Preference */}
                    <select
                      value={skill.preference ?? "neutral"}
                      onChange={(e) =>
                        updateSkill(category, i, "preference", e.target.value)
                      }
                      className="bg-background border border-border rounded px-2 py-1 text-sm"
                    >
                      {PREFERENCE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {/* Status */}
                    <select
                      value={skill.status ?? "active"}
                      onChange={(e) =>
                        updateSkill(category, i, "status", e.target.value)
                      }
                      className="bg-background border border-border rounded px-2 py-1 text-sm"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {/* Remove */}
                    <button
                      onClick={() => removeSkill(category, i)}
                      className="text-red-400 hover:text-red-300 text-sm px-1"
                      title="Remove skill"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addSkill(category)}
                className="mt-2 text-xs text-accent hover:text-accent-hover transition-colors"
              >
                + Add Skill
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
