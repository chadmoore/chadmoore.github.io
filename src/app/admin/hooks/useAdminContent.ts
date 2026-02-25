/**
 * useAdminContent — fetches content.json, exposes updateField, and saves.
 *
 * Owns: data, saving state, dirty-checking, hasUnpublished flag, publish.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { ContentData } from "@/lib/contentData";

export function useAdminContent() {
  const [data, setData] = useState<ContentData | null>(null);
  const lastSavedContent = useRef<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [hasUnpublished, setHasUnpublished] = useState(false);

  // Fetch content data on mount
  useEffect(() => {
    fetch("/api/admin/content")
      .then((res) => res.json())
      .then((json: ContentData) => {
        setData(json);
        lastSavedContent.current = JSON.stringify(json);
      })
      .catch(() => setMessage("Failed to load content data. Is the dev server running?"));
  }, []);

  /** Type-safe deep setter for any content.json path. */
  const updateField = useCallback(
    <K extends keyof ContentData>(
      section: K,
      updater: (prev: ContentData[K]) => ContentData[K],
    ) => {
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, [section]: updater(prev[section]) };
      });
    },
    [],
  );

  // ─── Publish ──────────────────────────────────────────────────
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    setMessage("");
    try {
      // Strip empty skill names before saving
      const cleaned: ContentData = {
        ...data,
        cv: {
          ...data.cv,
          skills: Object.fromEntries(
            Object.entries(data.cv.skills).map(([cat, skills]) => [
              cat,
              skills.filter((skill) => skill.name.trim() !== ""),
            ]),
          ),
        },
      };
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      if (res.ok) {
        const cleanedJson = JSON.stringify(cleaned);
        const changed = cleanedJson !== lastSavedContent.current;
        lastSavedContent.current = cleanedJson;
        setData(cleaned);
        if (changed) {
          setMessage("Saved!");
          setHasUnpublished(true);
          setPublishMessage("");
        } else {
          setMessage("No changes to save.");
        }
      } else {
        setMessage("Save failed.");
      }
    } catch {
      setMessage("Save failed — is the dev server running?");
    } finally {
      setSaving(false);
    }
  }, [data]);

  const contentDirty = data ? JSON.stringify(data) !== lastSavedContent.current : false;

  /** Revert data to the last saved snapshot. */
  const reset = useCallback(() => {
    if (!lastSavedContent.current) return;
    setData(JSON.parse(lastSavedContent.current) as ContentData);
    setMessage("");
  }, []);

  const publish = useCallback(async () => {
    setPublishing(true);
    setPublishMessage("");
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Update content via admin" }),
      });
      if (!res.ok) throw new Error("Publish failed");
      const { hash } = await res.json();
      if (hash === "no-changes") {
        setPublishMessage("Nothing to publish.");
      } else {
        setPublishMessage(`Published (${hash})`);
        setHasUnpublished(false);
      }
    } catch {
      setPublishMessage("Publish failed.");
    } finally {
      setPublishing(false);
    }
  }, []);

  return {
    data,
    setData,
    saving,
    message,
    contentDirty,
    updateField,
    save,
    reset,
    hasUnpublished,
    setHasUnpublished,
    publishing,
    publishMessage,
    publish,
  };
}
