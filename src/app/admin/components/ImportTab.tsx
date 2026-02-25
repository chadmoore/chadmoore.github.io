/**
 * ImportTab — LinkedIn data export upload + preview + apply.
 */
import type { ContentData } from "@/lib/contentData";

interface ImportTabProps {
  importFile: File | null;
  importing: boolean;
  importPreview: ContentData | null;
  importMessage: string;
  handleLinkedInImport: () => void;
  applyLinkedInImport: () => void;
  handleFileChange: (file: File | null) => void;
}

export function ImportTab({
  importFile,
  importing,
  importPreview,
  importMessage,
  handleLinkedInImport,
  applyLinkedInImport,
  handleFileChange,
}: ImportTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Import from LinkedIn</h2>
        <p className="text-sm text-muted mt-1">
          Upload a LinkedIn data export ZIP to bootstrap your CV data.
          Download it from{" "}
          <strong>Settings &amp; Privacy → Data Privacy → Get a copy of your data</strong>{" "}
          (select <em>Want something in particular?</em> and check at minimum
          Profile, Positions, Education, and Skills).
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <div className="space-y-2">
          <label className="block text-xs text-muted">
            LinkedIn data export (.zip)
          </label>
          <input
            type="file"
            accept=".zip"
            aria-label="LinkedIn export zip"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-accent/8 file:text-accent hover:file:bg-accent/20 cursor-pointer"
          />
        </div>

        <button
          onClick={handleLinkedInImport}
          disabled={!importFile || importing}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 text-sm"
        >
          {importing ? "Parsing…" : "Parse ZIP"}
        </button>

        {importMessage && (
          <p
            className={`text-sm ${
              importMessage.startsWith("Parsed") || importMessage.startsWith("Applied")
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {importMessage}
          </p>
        )}
      </div>

      {importPreview && (
        <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Preview</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted">Name</dt>
            <dd>{importPreview.site.name || <em className="text-muted">—</em>}</dd>
            <dt className="text-muted">Headline</dt>
            <dd>{importPreview.cv.headline || <em className="text-muted">—</em>}</dd>
            <dt className="text-muted">Location</dt>
            <dd>{importPreview.cv.location || <em className="text-muted">—</em>}</dd>
            <dt className="text-muted">Positions</dt>
            <dd>{importPreview.cv.experience.length}</dd>
            <dt className="text-muted">Education</dt>
            <dd>{importPreview.cv.education.length}</dd>
            <dt className="text-muted">Skills</dt>
            <dd>
              {Object.values(importPreview.cv.skills).reduce(
                (sum, list) => sum + list.length,
                0,
              )}
            </dd>
          </dl>

          <p className="text-xs text-muted">
            Non-CV sections (site links, homepage content, about copy) are
            preserved from your existing content. Only the CV section will
            be replaced.
          </p>

          <button
            onClick={applyLinkedInImport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm"
          >
            Apply to Editor
          </button>
        </div>
      )}
    </div>
  );
}
