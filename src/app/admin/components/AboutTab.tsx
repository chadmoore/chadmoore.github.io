/**
 * AboutTab — about page headings + intro paragraph editor.
 */
import type { ContentData } from "@/lib/contentData";
import { Field, inputClass } from "./Field";

interface AboutTabProps {
  data: ContentData;
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void;
  updateIntroParagraph: (index: number, value: string) => void;
  addIntroParagraph: () => void;
  removeIntroParagraph: (index: number) => void;
}

export function AboutTab({
  data,
  updateField,
  updateIntroParagraph,
  addIntroParagraph,
  removeIntroParagraph,
}: AboutTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">About Page</h2>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <Field label="Page Heading">
          <input
            type="text"
            value={data.about.heading}
            onChange={(e) => updateField("about", (about) => ({ ...about, heading: e.target.value }))}
            aria-label="Page Heading"
            className={inputClass}
          />
        </Field>
        <Field label="Skills Section Heading">
          <input
            type="text"
            value={data.about.skillsHeading}
            onChange={(e) => updateField("about", (about) => ({ ...about, skillsHeading: e.target.value }))}
            aria-label="Skills Section Heading"
            className={inputClass}
          />
        </Field>
        <Field label="Contact Section Heading">
          <input
            type="text"
            value={data.about.contactHeading}
            onChange={(e) => updateField("about", (about) => ({ ...about, contactHeading: e.target.value }))}
            aria-label="Contact Section Heading"
            className={inputClass}
          />
        </Field>
        <Field label="Contact Text (after email/LinkedIn links)">
          <input
            type="text"
            value={data.about.contactText}
            onChange={(e) => updateField("about", (about) => ({ ...about, contactText: e.target.value }))}
            aria-label="Contact Text"
            className={inputClass}
          />
        </Field>
      </div>

      <h3 className="font-medium">Intro Paragraphs</h3>
      <div className="space-y-3">
        {data.about.intro.map((paragraph, index) => (
          <div key={index} className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Paragraph {index + 1}</span>
              <button
                onClick={() => removeIntroParagraph(index)}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                title="Remove paragraph"
              >
                ✕
              </button>
            </div>
            <textarea
              value={paragraph}
              onChange={(e) => updateIntroParagraph(index, e.target.value)}
              rows={4}
              aria-label={`Intro paragraph ${index + 1}`}
              className={inputClass + " resize-y"}
            />
          </div>
        ))}
        <button
          onClick={addIntroParagraph}
          className="text-xs text-accent hover:text-accent-hover transition-colors"
        >
          + Add Paragraph
        </button>
      </div>
    </div>
  );
}
