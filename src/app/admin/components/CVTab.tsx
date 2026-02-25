/**
 * CVTab — headline, location, summary, specialties.
 *
 * Bug fix: blog heading/description fields were previously misplaced here.
 * They now live in BlogTab where they belong.
 */
import type { ContentData } from "@/lib/contentData";
import { Field, inputClass } from "./Field";

interface CVTabProps {
  data: ContentData;
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void;
}

export function CVTab({ data, updateField }: CVTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">CV / Resume</h2>

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
    </div>
  );
}
