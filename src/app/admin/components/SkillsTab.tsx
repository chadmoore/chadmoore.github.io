/**
 * SkillsTab — skill categories with proficiency/preference/status dropdowns.
 */
import type { ContentData } from "@/lib/contentData";
import type { Skill } from "@/lib/skills";
import { PROFICIENCY_OPTIONS, PREFERENCE_OPTIONS, STATUS_OPTIONS } from "../constants";

interface SkillsTabProps {
  data: ContentData;
  updateSkill: (category: string, index: number, field: keyof Skill, value: string) => void;
  removeSkill: (category: string, index: number) => void;
  addSkill: (category: string) => void;
  addCategory: () => void;
  removeCategory: (category: string) => void;
}

export function SkillsTab({
  data,
  updateSkill,
  removeSkill,
  addSkill,
  addCategory,
  removeCategory,
}: SkillsTabProps) {
  return (
    <>
      <h2 className="text-lg font-semibold mb-6">Skills</h2>

      <div className="space-y-8">
        {Object.entries(data.cv.skills).map(([category, skills]) => (
          <div
            key={category}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{category}</h3>
              <button
                onClick={() => removeCategory(category)}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
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
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) =>
                      updateSkill(category, i, "name", e.target.value)
                    }
                    placeholder="Skill name"
                    className="flex-1 min-w-35 bg-background border border-border rounded px-2 py-1 text-sm"
                  />

                  <select
                    value={skill.proficiency}
                    onChange={(e) =>
                      updateSkill(category, i, "proficiency", e.target.value)
                    }
                    aria-label="Proficiency"
                    className="bg-background border border-border rounded px-2 py-1 text-sm"
                  >
                    {PROFICIENCY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <select
                    value={skill.preference ?? "neutral"}
                    onChange={(e) =>
                      updateSkill(category, i, "preference", e.target.value)
                    }
                    aria-label="Preference"
                    className="bg-background border border-border rounded px-2 py-1 text-sm"
                  >
                    {PREFERENCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <select
                    value={skill.status ?? "active"}
                    onChange={(e) =>
                      updateSkill(category, i, "status", e.target.value)
                    }
                    aria-label="Status"
                    className="bg-background border border-border rounded px-2 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeSkill(category, i)}
                    className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 text-sm px-1"
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

      <button
        onClick={addCategory}
        className="mt-4 text-xs text-accent hover:text-accent-hover transition-colors"
      >
        + Add Category
      </button>
    </>
  );
}
