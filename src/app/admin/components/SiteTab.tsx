/**
 * SiteTab — site name, tagline, links, and section visibility.
 */
import type { ContentData, SectionKey } from "@/lib/contentData";
import { Field, inputClass } from "./Field";

/** Display labels for section visibility toggles. */
const SECTION_LABELS: Record<SectionKey, string> = {
  about: "About",
  projects: "Projects",
  blog: "Blog",
  cv: "CV",
};

/** Sections that get a simple on/off checkbox. */
const SIMPLE_SECTIONS: SectionKey[] = ["about", "projects", "blog"];

interface SiteTabProps {
  data: ContentData;
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void;
}

export function SiteTab({ data, updateField }: SiteTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Site Settings</h2>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <Field label="Name">
          <input
            type="text"
            value={data.site.name}
            onChange={(e) => updateField("site", (site) => ({ ...site, name: e.target.value }))}
            aria-label="Name"
            className={inputClass}
          />
        </Field>

        <Field label="Tagline">
          <input
            type="text"
            value={data.site.tagline}
            onChange={(e) => updateField("site", (site) => ({ ...site, tagline: e.target.value }))}
            aria-label="Tagline"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <h3 className="font-medium">Links</h3>
        <Field label="Email">
          <input
            type="email"
            value={data.site.links.email}
            onChange={(e) => updateField("site", (site) => ({ ...site, links: { ...site.links, email: e.target.value } }))}
            aria-label="Email"
            className={inputClass}
          />
        </Field>
        <Field label="GitHub URL">
          <input
            type="url"
            value={data.site.links.github}
            onChange={(e) => updateField("site", (site) => ({ ...site, links: { ...site.links, github: e.target.value } }))}
            aria-label="GitHub URL"
            className={inputClass}
          />
        </Field>
        <Field label="LinkedIn URL">
          <input
            type="url"
            value={data.site.links.linkedin}
            onChange={(e) => updateField("site", (site) => ({ ...site, links: { ...site.links, linkedin: e.target.value } }))}
            aria-label="LinkedIn URL"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Section Visibility</h3>
        {SIMPLE_SECTIONS.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.site.sections[key]}
              onChange={(e) =>
                updateField("site", (site) => ({
                  ...site,
                  sections: { ...site.sections, [key]: e.target.checked },
                }))
              }
              className="accent-accent"
            />
            {SECTION_LABELS[key]}
          </label>
        ))}

        {/* CV / Resume — three-state: Off, Resume, CV */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">{SECTION_LABELS.cv}:</span>
          {(["off", "resume", "cv"] as const).map((option) => (
            <label key={option} className="flex items-center gap-1">
              <input
                type="radio"
                name="cv-mode"
                checked={
                  option === "off"
                    ? !data.site.sections.cv
                    : data.site.sections.cv &&
                      (data.site.cvLabel ?? "resume") === option
                }
                onChange={() =>
                  updateField("site", (site) => ({
                    ...site,
                    sections: { ...site.sections, cv: option !== "off" },
                    ...(option !== "off" ? { cvLabel: option as "resume" | "cv" } : {}),
                  }))
                }
                className="accent-accent"
              />
              {option === "off" ? "Off" : option === "cv" ? "CV" : "Resume"}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
