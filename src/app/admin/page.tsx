/**
 * Admin Page — Local development content management.
 *
 * Client component that talks to /api/admin/* to read and write
 * content files. Only functional when running `next dev` — the API
 * routes don't exist in the static export.
 *
 * Nine tabs: Site, Home, About, Projects, CV, Skills, Blog, Import, Lighthouse.
 * All non-blog tabs edit content.json via a single Save button.
 * Blog posts are managed separately via /api/admin/blog/*.
 *
 * The actual state management lives in hooks/ and tab UI in components/.
 * This file is a thin orchestrator that wires them together.
 */
"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

// ─── Local modules ──────────────────────────────────────────────────
import type { Tab } from "./types";
import { TAB_LABELS } from "./types";
import { useAdminContent } from "./hooks/useAdminContent";
import { useSkillMutations } from "./hooks/useSkillMutations";
import { useCardMutations } from "./hooks/useCardMutations";
import { useAboutMutations } from "./hooks/useAboutMutations";
import { useBlogEditor } from "./hooks/useBlogEditor";
import { useLinkedInImport } from "./hooks/useLinkedInImport";
import { useTabDragReorder } from "./hooks/useTabDragReorder";

import { SiteTab } from "./components/SiteTab";
import { HomeTab } from "./components/HomeTab";
import { AboutTab } from "./components/AboutTab";
import { ProjectsTab } from "./components/ProjectsTab";
import { CVTab } from "./components/CVTab";
import { SkillsTab } from "./components/SkillsTab";
import { BlogTab } from "./components/BlogTab";
import { ImportTab } from "./components/ImportTab";
import { LighthouseTab } from "./components/LighthouseTab";

// ─── Component ──────────────────────────────────────────────────────

export default function AdminPage() {
  // Compute the initial tab from the URL once — before first render —
  // so we never flash the wrong tab or trigger a cascading setState.
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "site";
    const raw = new URLSearchParams(window.location.search).get("tab");
    return (raw as Tab) in TAB_LABELS ? (raw as Tab) : "site";
  });

  // ─── Hooks ────────────────────────────────────────────────────
  const content = useAdminContent();
  const { data, setData, updateField, save, reset, saving, message, contentDirty } = content;
  const { hasUnpublished, setHasUnpublished, publishing, publishMessage, publish } = content;

  const skillMutations = useSkillMutations(data, updateField);
  const cardMutations = useCardMutations(updateField);
  const aboutMutations = useAboutMutations(updateField);
  const blog = useBlogEditor(setHasUnpublished);
  const linkedIn = useLinkedInImport(setData, setHasUnpublished);
  const tabs = useTabDragReorder(data, updateField);

  // ─── Loading state ────────────────────────────────────────────

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-muted mt-1">
          Development only — edits content on disk
        </p>
      </div>

      {/* ─── Global Action Bar ─────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        {tab !== "blog" && tab !== "import" && tab !== "lighthouse" && (
          <>
            <button
              onClick={save}
              disabled={saving || !contentDirty}
              className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 text-sm${contentDirty && !saving ? " animate-pulse-3" : ""}`}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={reset}
              disabled={saving || !contentDirty}
              title="Reset changes"
              className="px-2 py-2 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {message && (
              <span className={`text-sm ${message.includes("Saved") ? "text-green-600 dark:text-green-400" : message.includes("No changes") ? "text-muted" : "text-red-600 dark:text-red-400"}`}>
                {message}
              </span>
            )}
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={publish}
            disabled={!hasUnpublished || publishing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
          {publishMessage && (
            <span className={`text-sm ${publishMessage.includes("Published") ? "text-green-600 dark:text-green-400" : publishMessage.includes("Nothing") ? "text-muted" : "text-red-600 dark:text-red-400"}`}>
              {publishMessage}
            </span>
          )}
        </div>
      </div>

      {/* ─── Tabs ──────────────────────────────────────────────── */}
      <div className="flex gap-4 border-b border-border mb-8">
        {tabs.tabOrder.map((t) => {
          const isPinned = tabs.PINNED_TABS.has(t);
          const isDragging = tabs.dragTab === t;
          const isDragOver = tabs.dragOverTab === t && tabs.dragTab !== t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              draggable={!isPinned}
              onDragStart={isPinned ? undefined : tabs.handleDragStart(t)}
              onDragOver={isPinned ? undefined : tabs.handleDragOver(t)}
              onDrop={isPinned ? undefined : tabs.handleDrop(t)}
              onDragEnd={tabs.handleDragEnd}
              onDragLeave={tabs.clearDragOver}
              className={`pb-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                tab === t
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }${!isPinned ? " cursor-grab active:cursor-grabbing" : ""}${
                isDragging ? " opacity-30" : ""
              }${isDragOver ? " border-accent/50!" : ""}`}
            >
              {TAB_LABELS[t]}
            </button>
          );
        })}
      </div>

      {/* ─── Tab Panels ────────────────────────────────────────── */}
      {tab === "site" && <SiteTab data={data} updateField={updateField} />}
      {tab === "home" && <HomeTab data={data} updateField={updateField} {...cardMutations} />}
      {tab === "about" && <AboutTab data={data} updateField={updateField} {...aboutMutations} />}
      {tab === "projects" && <ProjectsTab data={data} updateField={updateField} />}
      {tab === "cv" && <CVTab data={data} updateField={updateField} />}
      {tab === "skills" && <SkillsTab data={data} {...skillMutations} />}
      {tab === "blog" && (
        <BlogTab
          data={data}
          updateField={updateField}
          posts={blog.posts}
          editingPost={blog.editingPost}
          newPost={blog.newPost}
          tagInput={blog.tagInput}
          setTagInput={blog.setTagInput}
          blogMessage={blog.blogMessage}
          saving={blog.saving}
          lastSavedBlog={blog.lastSavedBlog}
          openEditor={blog.openEditor}
          startNewPost={blog.startNewPost}
          saveBlogPost={blog.saveBlogPost}
          deletePost={blog.deletePost}
          updateEditingPost={blog.updateEditingPost}
          setEditingPost={blog.setEditingPost}
          setNewPost={blog.setNewPost}
        />
      )}
      {tab === "import" && <ImportTab {...linkedIn} />}
      {tab === "lighthouse" && <LighthouseTab />}
    </div>
  );
}
