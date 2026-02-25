/**
 * useBlogEditor — blog post CRUD, editor state, and deep-link handling.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { BlogPostMeta, BlogPostFull } from "../types";

export function useBlogEditor(setHasUnpublished: (v: boolean) => void) {
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPostFull | null>(null);
  const [newPost, setNewPost] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const lastSavedBlog = useRef<string>("");
  const [blogMessage, setBlogMessage] = useState("");
  const [initialEditSlug, setInitialEditSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [shouldStartNew, setShouldStartNew] = useState(false);

  // Read URL params on mount (for deep-link from DevEditLink / "+ Post")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "blog") {
      const editSlug = params.get("edit");
      if (editSlug) setInitialEditSlug(editSlug);
      if (params.get("new") === "1") setShouldStartNew(true);
    }
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

  // Auto-open editor when deep-linked from a blog page
  useEffect(() => {
    if (initialEditSlug && posts.length > 0) {
      openEditor(initialEditSlug);
      setInitialEditSlug(null);
    }
  }, [initialEditSlug, openEditor, posts]);

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

  // Auto-start new post when deep-linked with ?new=1
  useEffect(() => {
    if (shouldStartNew) {
      startNewPost();
      setShouldStartNew(false);
    }
  }, [shouldStartNew, startNewPost]);

  const saveBlogPost = useCallback(async () => {
    if (!editingPost) return;
    setSaving(true);
    setBlogMessage("");
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
      fetchPosts();
    } catch (err) {
      setBlogMessage(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [editingPost, newPost, tagInput, fetchPosts, setHasUnpublished]);

  const deletePost = useCallback(async (slug: string) => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setBlogMessage("");
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchPosts();
      setBlogMessage("Deleted.");
      setHasUnpublished(true);
    } catch {
      setBlogMessage("Delete failed.");
    }
  }, [fetchPosts, setHasUnpublished]);

  const updateEditingPost = useCallback(
    (field: keyof BlogPostFull, value: string | string[]) => {
      setEditingPost((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  return {
    posts,
    editingPost,
    newPost,
    tagInput,
    setTagInput,
    blogMessage,
    saving,
    lastSavedBlog,
    openEditor,
    startNewPost,
    saveBlogPost,
    deletePost,
    updateEditingPost,
    setEditingPost,
    setNewPost,
  };
}
