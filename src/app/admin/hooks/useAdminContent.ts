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
  const deployTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Clear any in-flight deploy poll on unmount
  useEffect(() => {
    return () => {
      if (deployTimerRef.current) clearTimeout(deployTimerRef.current);
    };
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

  const formatElapsed = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, []);

  /**
   * Poll /api/admin/deploy-status until the GitHub Actions workflow
   * for `hash` completes (success or failure) or 5 minutes elapse.
   * Keeps `publishing` true and ticks `publishMessage` with elapsed time.
   *
   * Polls immediately on first call, then waits POLL_INTERVAL_MS between retries
   * so the UI reflects deploy completion as soon as possible.
   */
  const watchDeploy = useCallback(
    (hash: string): Promise<void> => {
      const TIMEOUT_MS = 5 * 60 * 1000;
      const POLL_INTERVAL_MS = 6_000;
      const startTime = Date.now();

      setPublishMessage(`Deploying… 0:00`);

      return new Promise<void>((resolve) => {
        const poll = async () => {
          const elapsed = Date.now() - startTime;

          if (elapsed > TIMEOUT_MS) {
            setPublishMessage("Deploy timed out — check GitHub Actions.");
            resolve();
            return;
          }

          setPublishMessage(`Deploying… ${formatElapsed(elapsed)}`);

          try {
            const res = await fetch(`/api/admin/deploy-status?sha=${hash}`);
            if (!res.ok) {
              setPublishMessage("Could not reach deploy status API.");
              resolve();
              return;
            }
            const { status } = (await res.json()) as { status: string };
            if (status === "success") {
              setPublishMessage(`Deployed! (${hash})`);
              resolve();
            } else if (status === "failure") {
              setPublishMessage("Deploy failed — check GitHub Actions.");
              resolve();
            } else {
              // "pending" → schedule next poll
              deployTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
            }
          } catch {
            // transient network error — retry after interval
            deployTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          }
        };

        poll(); // fire immediately; retries are scheduled by poll() itself
      });
    },
    [formatElapsed],
  );

  const publish = useCallback(async () => {
    setPublishing(true);
    setPublishMessage("");
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Update content via admin" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Publish failed");
      const { hash } = json as { hash: string };
      if (hash === "no-changes") {
        setPublishMessage("Nothing to publish.");
      } else {
        setHasUnpublished(false);
        await watchDeploy(hash);
      }
    } catch (err) {
      setPublishMessage(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }, [watchDeploy]);

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
