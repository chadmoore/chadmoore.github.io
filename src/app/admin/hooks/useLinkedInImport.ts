/**
 * useLinkedInImport — handles LinkedIn ZIP upload, parsing, and apply.
 */
import { useState, useCallback } from "react";
import type { ContentData } from "@/lib/contentData";

export function useLinkedInImport(
  setData: React.Dispatch<React.SetStateAction<ContentData | null>>,
  setHasUnpublished: (v: boolean) => void,
) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ContentData | null>(null);
  const [importMessage, setImportMessage] = useState("");

  const handleLinkedInImport = useCallback(async () => {
    if (!importFile) return;
    setImporting(true);
    setImportMessage("");
    setImportPreview(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await fetch("/api/admin/linkedin", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Import failed");
      }
      const result = await res.json();
      setImportPreview(result);
      setImportMessage(
        "Parsed successfully — review the summary below, then click Apply to load into the editor.",
      );
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }, [importFile]);

  const applyLinkedInImport = useCallback(() => {
    if (!importPreview) return;
    setData(importPreview);
    setImportPreview(null);
    setImportFile(null);
    setImportMessage(
      "Applied! Review and edit across the other tabs, then Save when ready.",
    );
    setHasUnpublished(false);
  }, [importPreview, setData, setHasUnpublished]);

  const handleFileChange = useCallback((file: File | null) => {
    setImportFile(file);
    setImportPreview(null);
    setImportMessage("");
  }, []);

  return {
    importFile,
    importing,
    importPreview,
    importMessage,
    handleLinkedInImport,
    applyLinkedInImport,
    handleFileChange,
  };
}
