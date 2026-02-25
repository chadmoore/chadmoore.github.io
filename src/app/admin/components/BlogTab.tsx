/**
 * BlogTab — blog heading/description fields, post editor, and post list.
 *
 * The heading/description fields were previously misplaced inside CVTab.
 * They now live here since they edit content.blog, not content.cv.
 */
import type { ContentData } from "@/lib/contentData";
import type { BlogPostMeta, BlogPostFull } from "../types";
import { Field, inputClass } from "./Field";

interface BlogTabProps {
  data: ContentData;
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void;
  posts: BlogPostMeta[];
  editingPost: BlogPostFull | null;
  newPost: boolean;
  tagInput: string;
  setTagInput: (v: string) => void;
  blogMessage: string;
  saving: boolean;
  lastSavedBlog: React.RefObject<string>;
  openEditor: (slug: string) => void;
  startNewPost: () => void;
  saveBlogPost: () => void;
  deletePost: (slug: string) => void;
  updateEditingPost: (field: keyof BlogPostFull, value: string | string[]) => void;
  setEditingPost: (post: BlogPostFull | null) => void;
  setNewPost: (v: boolean) => void;
}

export function BlogTab({
  data,
  updateField,
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
}: BlogTabProps) {
  return (
    <>
      {/* Blog page heading/description (content.blog section) */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-2 mb-6">
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
  );
}
