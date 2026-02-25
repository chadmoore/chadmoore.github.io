/**
 * ProjectsTab — projects page heading + description.
 */
import type { ContentData } from "@/lib/contentData";
import { Field, inputClass } from "./Field";

interface ProjectsTabProps {
  data: ContentData;
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void;
}

export function ProjectsTab({ data, updateField }: ProjectsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Projects Page</h2>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <Field label="Page Heading">
          <input
            type="text"
            value={data.projects.heading}
            onChange={(e) => updateField("projects", (projects) => ({ ...projects, heading: e.target.value }))}
            aria-label="Projects Heading"
            className={inputClass}
          />
        </Field>
        <Field label="Description">
          <input
            type="text"
            value={data.projects.description}
            onChange={(e) => updateField("projects", (projects) => ({ ...projects, description: e.target.value }))}
            aria-label="Projects Description"
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}
