/**
 * Admin Page — Local development content management.
 *
 * Client component that talks to /api/admin/* to read and write
 * content files. Only functional when running `next dev` — the API
 * routes don't exist in the static export.
 *
 * Six tabs: Site, Home, About, CV, Skills, and Blog.
 * All non-blog tabs edit content.json via a single Save button.
 * Blog posts are managed separately via /api/admin/blog/*.
 *
 * // If you're reading this code and thinking "this should use
 * // a form library" — you're probably right, but it ships today.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Skill, Proficiency, Preference, Status } from "@/lib/skills";
import type { ContentData, FeatureCard } from "@/lib/contentData";

// ─── Types ──────────────────────────────────────────────────────────

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

type Tab = "site" | "home" | "about" | "projects" | "cv" | "skills" | "blog";

const TAB_LABELS: Record<Tab, string> = {
  site: "Site",
  home: "Home",
  about: "About",
  projects: "Projects",
  cv: "CV",
  skills: "Skills",
  blog: "Blog",
};

// ─── Constants ──────────────────────────────────────────────────────

const PROFICIENCY_OPTIONS: Proficiency[] = ["expert", "proficient", "familiar"];
const PREFERENCE_OPTIONS: Preference[] = ["preferred", "neutral"];
const STATUS_OPTIONS: Status[] = ["active", "legacy"];
const ICON_OPTIONS = ["integration", "security", "architecture"];

// ─── Shared input component ─────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-background border border-border rounded px-2 py-1 text-sm [color-scheme:light] dark:[color-scheme:dark]";

// ─── Component ──────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("site");
  const [data, setData] = useState<ContentData | null>(null);
  const lastSavedContent = useRef<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [hasUnpublished, setHasUnpublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");

  // ─── Blog state ───────────────────────────────────────────────
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPostFull | null>(null);
  const [newPost, setNewPost] = useState(false);
  const [tagInput, setTagInput] = useState("");
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

  // Fetch content data on mount
  useEffect(() => {
    fetch("/api/admin/content")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        lastSavedContent.current = JSON.stringify(json);
      })
      .catch(() => setMessage("Failed to load content data. Is the dev server running?"));
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

  // ─── Generic Content Update ───────────────────────────────────

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

  // ─── Skill Mutations ─────────────────────────────────────────────

  const updateSkill = useCallback(
    (category: string, index: number, field: keyof Skill, value: string) => {
      if (!data) return;
      updateField("cv", (cv) => {
        const skills = { ...cv.skills };
        const list = [...skills[category]];
        list[index] = { ...list[index], [field]: value };
        skills[category] = list;
        return { ...cv, skills };
      });
    },
    [data, updateField],
  );

  const removeSkill = useCallback(
    (category: string, index: number) => {
      if (!data) return;
      updateField("cv", (cv) => {
        const skills = { ...cv.skills };
        const list = [...skills[category]];
        list.splice(index, 1);
        skills[category] = list;
        return { ...cv, skills };
      });
    },
    [data, updateField],
  );

  const addSkill = useCallback(
    (category: string) => {
      if (!data) return;
      updateField("cv", (cv) => {
        const skills = { ...cv.skills };
        const list = [...skills[category]];
        list.push({ name: "", proficiency: "proficient" });
        skills[category] = list;
        return { ...cv, skills };
      });
    },
    [data, updateField],
  );

  const addCategory = useCallback(() => {
    const name = prompt("New category name:");
    if (!name || !data) return;
    updateField("cv", (cv) => {
      const skills = { ...cv.skills };
      skills[name] = [{ name: "", proficiency: "proficient" }];
      return { ...cv, skills };
    });
  }, [data, updateField]);

  const removeCategory = useCallback(
    (category: string) => {
      if (!data) return;
      if (!confirm(`Remove "${category}" and all its skills?`)) return;
      updateField("cv", (cv) => {
        const skills = { ...cv.skills };
        delete skills[category];
        return { ...cv, skills };
      });
    },
    [data, updateField],
  );

  // ─── Feature Card Mutations ───────────────────────────────────

  const updateCard = useCallback(
    (index: number, field: keyof FeatureCard, value: string) => {
      updateField("home", (home) => {
        const cards = [...home.featureCards];
        cards[index] = { ...cards[index], [field]: value };
        return { ...home, featureCards: cards };
      });
    },
    [updateField],
  );

  const addCard = useCallback(() => {
    updateField("home", (home) => ({
      ...home,
      featureCards: [...home.featureCards, { title: "", description: "", icon: "integration" }],
    }));
  }, [updateField]);

  const removeCard = useCallback(
    (index: number) => {
      updateField("home", (home) => {
        const cards = [...home.featureCards];
        cards.splice(index, 1);
        return { ...home, featureCards: cards };
      });
    },
    [updateField],
  );

  // ─── About Intro Mutations ───────────────────────────────────

  const updateIntroParagraph = useCallback(
    (index: number, value: string) => {
      updateField("about", (about) => {
        const intro = [...about.intro];
        intro[index] = value;
        return { ...about, intro };
      });
    },
    [updateField],
  );

  const addIntroParagraph = useCallback(() => {
    updateField("about", (about) => ({
      ...about,
      intro: [...about.intro, ""],
    }));
  }, [updateField]);

  const removeIntroParagraph = useCallback(
    (index: number) => {
      updateField("about", (about) => {
        const intro = [...about.intro];
        intro.splice(index, 1);
        return { ...about, intro };
      });
    },
    [updateField],
  );

  // ─── Save Content ─────────────────────────────────────────────

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

  // ─── Blog Handlers ─────────────────────────────────────────────

  const openEditor = useCallback(async (slug: string) => {
    setBlogMessage("");
    try {
      const res = await fetch(`/api/admin/blog/${slug}`);
      if (!res.ok) throw new Error();
      const post = await res.json();
      lastSavedBlog.current = JSON.stringify(post);
      setEditingPost(post);
      setTagInput(post.tags.join(", "));
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
    setTagInput("");
    setNewPost(true);
    lastSavedBlog.current = "";
    setBlogMessage("");
  }, []);

  const saveBlogPost = useCallback(async () => {
    if (!editingPost) return;
    setSaving(true);
    setBlogMessage("");
    // Parse the raw tag input into the tags array before saving
    const postToSave = {
      ...editingPost,
      tags: tagInput.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (newPost) {
        if (!postToSave.slug.trim()) {
          setBlogMessage("Slug is required.");
          setSaving(false);
          return;
        }
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postToSave),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Create failed");
        }
      } else {
        const res = await fetch(`/api/admin/blog/${postToSave.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postToSave),
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
  }, [editingPost, newPost, tagInput, fetchPosts]);

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

  const contentDirty = data ? JSON.stringify(data) !== lastSavedContent.current : false;

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
        {tab !== "blog" && (
          <>
            <button
              onClick={save}
              disabled={saving || !contentDirty}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? "Saving…" : "Save"}
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
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              tab === t
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ─── Site Tab ──────────────────────────────────────────── */}
      {tab === "site" && (
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
            {(["about", "projects", "blog", "cv"] as const).map((key) => (
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
                <span className="capitalize">{key}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ─── Home Tab ──────────────────────────────────────────── */}
      {tab === "home" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Homepage</h2>

          <div className="bg-surface border border-border rounded-lg p-4">
            <Field label="Greeting (shown above name)">
              <input
                type="text"
                value={data.home.greeting}
                onChange={(e) => updateField("home", (home) => ({ ...home, greeting: e.target.value }))}
                aria-label="Greeting"
                className={inputClass}
              />
            </Field>
          </div>

          <h3 className="font-medium">Feature Cards</h3>
          <div className="space-y-4">
            {data.home.featureCards.map((card, index) => (
              <div key={index} className="bg-surface border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Card {index + 1}</span>
                  <button
                    onClick={() => removeCard(index)}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                    title="Remove card"
                  >
                    ✕
                  </button>
                </div>
                <Field label="Title">
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateCard(index, "title", e.target.value)}
                    aria-label="Card title"
                    className={inputClass}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    value={card.description}
                    onChange={(e) => updateCard(index, "description", e.target.value)}
                    rows={2}
                    aria-label="Card description"
                    className={inputClass + " resize-y"}
                  />
                </Field>
                <Field label="Icon">
                  <select
                    value={card.icon}
                    onChange={(e) => updateCard(index, "icon", e.target.value)}
                    aria-label="Card icon"
                    className={inputClass}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </Field>
              </div>
            ))}
            <button
              onClick={addCard}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              + Add Card
            </button>
          </div>
        </div>
      )}

      {/* ─── About Tab ─────────────────────────────────────────── */}
      {tab === "about" && (
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
      )}

      {/* ─── Projects Tab ─────────────────────────────────────── */}
      {tab === "projects" && (
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
      )}

      {/* ─── CV Tab ────────────────────────────────────────────── */}
      {tab === "cv" && (
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

          <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Blog Page</h3>
            <Field label="Blog Heading">
              <input
                type="text"
                value={data.blog.heading}
                onChange={(e) => updateField("blog", (blog) => ({ ...blog, heading: e.target.value }))}
                aria-label="Blog Heading"
                className={inputClass}
              />
            </Field>
            <Field label="Blog Description">
              <input
                type="text"
                value={data.blog.description}
                onChange={(e) => updateField("blog", (blog) => ({ ...blog, description: e.target.value }))}
                aria-label="Blog Description"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      )}

      {/* ─── Skills Tab ────────────────────────────────────────── */}
      {tab === "skills" && (
        <>
          <h2 className="text-lg font-semibold mb-6">Skills</h2>

          <div className="space-y-8">
            {Object.entries(data.cv.skills).map(([category, skills]) => (
              <div
                key={category}
                className="bg-surface border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{category}</h3>
                  <button
                    onClick={() => removeCategory(category)}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
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
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) =>
                          updateSkill(category, i, "name", e.target.value)
                        }
                        placeholder="Skill name"
                        className="flex-1 min-w-35 bg-background border border-border rounded px-2 py-1 text-sm"
                      />

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

                      <button
                        onClick={() => removeSkill(category, i)}
                        className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 text-sm px-1"
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
            <p className={`mb-4 text-sm ${blogMessage.includes("Saved") || blogMessage.includes("Deleted") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
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
                <Field label="Slug (filename)">
                  <input
                    type="text"
                    value={editingPost.slug}
                    onChange={(e) => updateEditingPost("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    placeholder="my-post-slug"
                    className={inputClass}
                  />
                </Field>
              )}

              <Field label="Title">
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => updateEditingPost("title", e.target.value)}
                  placeholder="Post title"
                  className={inputClass}
                />
              </Field>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Field label="Date">
                    <input
                      type="date"
                      value={editingPost.date}
                      onChange={(e) => updateEditingPost("date", e.target.value)}
                      title="Post date"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="flex-1">
                  <Field label="Tags (comma-separated)">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="tag1, tag2"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <Field label="Excerpt">
                <input
                  type="text"
                  value={editingPost.excerpt}
                  onChange={(e) => updateEditingPost("excerpt", e.target.value)}
                  placeholder="Short description"
                  className={inputClass}
                />
              </Field>

              <Field label="Content (Markdown)">
                <textarea
                  value={editingPost.content}
                  onChange={(e) => updateEditingPost("content", e.target.value)}
                  placeholder="Write your post in Markdown..."
                  rows={16}
                  className={inputClass + " font-mono resize-y"}
                />
              </Field>

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
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors"
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
