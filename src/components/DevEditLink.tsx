/**
 * DevEditLink — shows an "Edit" link only in development.
 *
 * Uses process.env.NODE_ENV which is baked in at build time.
 * In `next dev` it's "development"; in the static export it's
 * "production" — so this link never appears on the live site.
 *
 * Client component because we want this to render in the browser
 * (server components in dev mode would also work, but this is
 * simpler to reason about and test).
 */
"use client";

interface DevEditLinkProps {
  /** The slug for the admin editor, e.g. "hello-world" */
  slug: string;
}

export default function DevEditLink({ slug }: DevEditLinkProps) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <a
      href={`/admin?tab=blog&edit=${slug}`}
      className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors"
      title="Edit this post (dev only)"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Edit
    </a>
  );
}
