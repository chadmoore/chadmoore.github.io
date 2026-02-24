/**
 * Admin Page — Local development CV & blog management.
 *
 * Client component that talks to /api/admin/* to read and write
 * content files. Only functional when running `next dev` — the API
 * routes don't exist in the static export.
 *
 * Two sections: Skills editor and Blog manager, toggled via tabs.
 *
 * // If you're reading this code and thinking "this should use
 * // a form library" — you're probably right, but it ships today.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Skill, Proficiency, Preference, Status } from "@/lib/skills";

// ─── Types ──────────────────────────────────────────────────────────

interface CvData {
  name: string;
  headline: string;
  location: string;
  summary: string;
  specialties: string[];
  experience: Record<string, unknown>[];
  education: Record<string, unknown>[];
  skills: Record<string, Skill[]>;
  certifications: Record<string, unknown>[];
  links: Record<string, string>;
}

interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

interface BlogPostFull extends BlogPostMeta {
  content: string;
}

type Tab = "skills" | "blog";

// ─── Constants ──────────────────────────────────────────────────────

const PROFICIENCY_OPTIONS: Proficiency[] = ["expert", "proficient", "familiar"];
const PREFERENCE_OPTIONS: Preference[] = ["preferred", "neutral"];
const STATUS_OPTIONS: Status[] = ["active", "legacy"];

// ─── Component ──────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("skills");
  const [data, setData] = useState<CvData | null>(null);
  const lastSavedCv = useRef<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [hasUnpublished, setHasUnpublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");

  // ─── Blog state ───────────────────────────────────────────────
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPostFull | null>(null);
  const [newPost, setNewPost] = useState(false);
  const lastSavedBlog = useRef<string>("");
  const [blogMessage, setBlogMessage] = useState("");
  const [initialEditSlug, setInitialEditSlug] = useState<string | null>(null);

  // Read URL params on mount (for deep-link from DevEditLink)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "blog") {
      setTab("blog");
      const editSlug = params.get("edit");
      if (editSlug) setInitialEditSlug(editSlug);
    }
  }, []);

  // Fetch cv data on mount
  useEffect(() => {
    fetch("/api/admin/cv")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        lastSavedCv.current = JSON.stringify(json);
      })
      .catch(() => setMessage("Failed to load CV data. Is the dev server running?"));
  }, []);

  // Fetch blog posts on mount
  const fetchPosts = useCallback(() => {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) setPosts(json);
      })
      .catch(() => setBlogMessage("Failed to load blog posts."));
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Auto-open editor when deep-linked from a blog page
  useEffect(() => {
    if (initialEditSlug && posts.length > 0) {
      openEditor(initialEditSlug);
      setInitialEditSlug(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEditSlug, posts]);

  // ─── Skill Mutations ─────────────────────────────────────────────

  const updateSkill = useCallback(
    (category: string, index: number, field: keyof Skill, value: string) => {
      if (!data) return;
      setData((prev) => {
        if (!prev) return prev;
        const skills = { ...prev.skills };
        const list = [...skills[category]];
        list[index] = { ...list[index], [field]: value };
        skills[category] = list;
        return { ...prev, skills };
      });
    },
    [data]
  );

  const removeSkill = useCallback(
    (category: string, index: number) => {
      if (!data) return;
      setData((prev) => {
        if (!prev) return prev;
        const skills = { ...prev.skills };
        const list = [...skills[category]];
        list.splice(index, 1);
        skills[category] = list;
        return { ...prev, skills };
      });
    },
    [data]
  );

  const addSkill = useCallback(
    (category: string) => {
      if (!data) return;
      setData((prev) => {
        if (!prev) return prev;
        const skills = { ...prev.skills };
        const list = [...skills[category]];
        list.push({ name: "", proficiency: "proficient" });
        skills[category] = list;
        return { ...prev, skills };
      });
    },
    [data]
  );

  const addCategory = useCallback(() => {
    const name = prompt("New category name:");
    if (!name || !data) return;
    setData((prev) => {
      if (!prev) return prev;
      const skills = { ...prev.skills };
      skills[name] = [{ name: "", proficiency: "proficient" }];
      return { ...prev, skills };
    });
  }, [data]);

  const removeCategory = useCallback(
    (category: string) => {
      if (!data) return;
      if (!confirm(`Remove "${category}" and all its skills?`)) return;
      setData((prev) => {
        if (!prev) return prev;
        const skills = { ...prev.skills };
        delete skills[category];
        return { ...prev, skills };
      });
    },
    [data]
  );

  // ─── Save ─────────────────────────────────────────────────────────

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    setMessage("");
    try {
      // Strip empty skill names before saving
      const cleaned = {
        ...data,
        skills: Object.fromEntries(
          Object.entries(data.skills).map(([cat, skills]) => [
            cat,
            skills.filter((s) => s.name.trim() !== ""),
          ])
        ),
      };
      const res = await fetch("/api/admin/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      if (res.ok) {
        const cleanedJson = JSON.stringify(cleaned);
        const changed = cleanedJson !== lastSavedCv.current;
        lastSavedCv.current = cleanedJson;
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

  // ─── Blog Handlers ─────────────────────────────────────────────

  const openEditor = useCallback(async (slug: string) => {
    setBlogMessage("");
    try {
      const res = await fetch(`/api/admin/blog/${slug}`);
      if (!res.ok) throw new Error();
      const post = await res.json();
      lastSavedBlog.current = JSON.stringify(post);
      setEditingPost(post);
      setNewPost(false);
    } catch {
      setBlogMessage("Failed to load post.");
    }
  }, []);

  const startNewPost = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setEditingPost({
      slug: "",
      title: "",
      date: today,
      excerpt: "",
      tags: [],
      content: "",
    });
    setNewPost(true);
    lastSavedBlog.current = "";
    setBlogMessage("");
  }, []);

  const saveBlogPost = useCallback(async () => {
    if (!editingPost) return;
    setSaving(true);
    setBlogMessage("");
    try {
      if (newPost) {
        if (!editingPost.slug.trim()) {
          setBlogMessage("Slug is required.");
          setSaving(false);
          return;
        }
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingPost),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Create failed");
        }
      } else {
        const res = await fetch(`/api/admin/blog/${editingPost.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingPost),
        });
        if (!res.ok) throw new Error("Update failed");
      }
      setBlogMessage("Saved!");
      setEditingPost(null);
      setNewPost(false);
      setHasUnpublished(true);
      setPublishMessage("");
      fetchPosts();
    } catch (err) {
      setBlogMessage(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [editingPost, newPost, fetchPosts]);

  const deletePost = useCallback(async (slug: string) => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setBlogMessage("");
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchPosts();
      setBlogMessage("Deleted.");
      setHasUnpublished(true);
      setPublishMessage("");
    } catch {
      setBlogMessage("Delete failed.");
    }
  }, [fetchPosts]);

  const updateEditingPost = useCallback(
    (field: keyof BlogPostFull, value: string | string[]) => {
      setEditingPost((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  // ─── Publish ──────────────────────────────────────────────────

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

  // ─── Render ───────────────────────────────────────────────────────

  const cvDirty = data ? JSON.stringify(data) !== lastSavedCv.current : false;

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

      {/* ─── Publish Bar ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={publish}
          disabled={!hasUnpublished || publishing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {publishing ? "Publishing…" : "Publish"}
        </button>
        {publishMessage && (
          <span className={`text-sm ${publishMessage.includes("Published") ? "text-green-400" : publishMessage.includes("Nothing") ? "text-muted" : "text-red-400"}`}>
            {publishMessage}
          </span>
        )}
      </div>

      {/* ─── Tabs ──────────────────────────────────────────────── */}
      <div className="flex gap-4 border-b border-border mb-8">
        {(["skills", "blog"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ─── Skills Tab ────────────────────────────────────────── */}
      {tab === "skills" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Skills</h2>
            <div className="flex items-center gap-3">
              {message && (
                <span className={`text-sm ${message.includes("Saved") ? "text-green-400" : "text-red-400"}`}>
                  {message}
                </span>
              )}
              <button
                onClick={save}
                disabled={saving || !cvDirty}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

        <div className="space-y-8">
          {Object.entries(data.skills).map(([category, skills]) => (
            <div
              key={category}
              className="bg-surface border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{category}</h3>
                <button
                  onClick={() => removeCategory(category)}
                  className="text-xs text-red-400 hover:text-red-300"
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
                    {/* Name */}
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) =>
                        updateSkill(category, i, "name", e.target.value)
                      }
                      placeholder="Skill name"
                      className="flex-1 min-w-35 bg-background border border-border rounded px-2 py-1 text-sm"
                    />

                    {/* Proficiency */}
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

                    {/* Preference */}
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

                    {/* Status */}
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

                    {/* Remove */}
                    <button
                      onClick={() => removeSkill(category, i)}
                      className="text-red-400 hover:text-red-300 text-sm px-1"
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
      )}

      {/* ─── Blog Tab ──────────────────────────────────────────── */}
      {tab === "blog" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Blog Posts</h2>
            <button
              onClick={startNewPost}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm"
            >
              + New Post
            </button>
          </div>

          {blogMessage && (
            <p className={`mb-4 text-sm ${blogMessage.includes("Saved") || blogMessage.includes("Deleted") ? "text-green-400" : "text-red-400"}`}>
              {blogMessage}
            </p>
          )}

          {/* Post editor */}
          {editingPost && (
            <div className="bg-surface border border-border rounded-lg p-4 mb-6 space-y-4">
              <h3 className="font-medium">
                {newPost ? "New Post" : `Editing: ${editingPost.slug}`}
              </h3>

              {newPost && (
                <div>
                  <label className="block text-xs text-muted mb-1">Slug (filename)</label>
                  <input
                    type="text"
                    value={editingPost.slug}
                    onChange={(e) => updateEditingPost("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    placeholder="my-post-slug"
                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-muted mb-1">Title</label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => updateEditingPost("title", e.target.value)}
                  placeholder="Post title"
                  className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-muted mb-1">Date</label>
                  <input
                    type="date"
                    value={editingPost.date}
                    onChange={(e) => updateEditingPost("date", e.target.value)}
                    title="Post date"
                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-muted mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editingPost.tags.join(", ")}
                    onChange={(e) => updateEditingPost("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                    placeholder="tag1, tag2"
                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Excerpt</label>
                <input
                  type="text"
                  value={editingPost.excerpt}
                  onChange={(e) => updateEditingPost("excerpt", e.target.value)}
                  placeholder="Short description"
                  className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Content (Markdown)</label>
                <textarea
                  value={editingPost.content}
                  onChange={(e) => updateEditingPost("content", e.target.value)}
                  placeholder="Write your post in Markdown..."
                  rows={16}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono resize-y"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveBlogPost}
                  disabled={
                    saving ||
                    (newPost
                      ? !editingPost?.slug.trim() || !editingPost?.title.trim()
                      : editingPost !== null && JSON.stringify(editingPost) === lastSavedBlog.current)
                  }
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? "Saving…" : newPost ? "Create" : "Save"}
                </button>
                <button
                  onClick={() => { setEditingPost(null); setNewPost(false); }}
                  className="px-4 py-2 border border-border rounded-lg text-muted hover:text-foreground transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Post list */}
          {posts.length === 0 ? (
            <div className="border border-border rounded-xl p-12 text-center">
              <p className="text-muted">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="flex items-center justify-between py-3 border-b border-border"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <span className="font-medium truncate">{post.title}</span>
                      <span className="text-xs text-muted font-mono shrink-0">{post.date}</span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-1">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-[10px] text-accent/80 bg-accent/5 border border-accent/20 px-1.5 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={`/blog/${post.slug}`}
                      className="text-xs text-muted hover:text-accent transition-colors"
                    >
                      View
                    </a>
                    <button
                      onClick={() => openEditor(post.slug)}
                      className="text-xs text-accent hover:text-accent-hover transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePost(post.slug)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
