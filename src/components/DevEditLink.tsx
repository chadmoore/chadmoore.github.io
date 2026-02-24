/**
 * DevEditLink — shows an "Edit" link only in development.
 *
 * Uses process.env.NODE_ENV which is baked in at build time.
 * In `next dev` it's "development"; in the static export it's
 * "production" — so this link never appears on the live site.
 *
 * Server component — no client-side state or effects needed.
 */

import { SquarePen } from "lucide-react";

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
      <SquarePen className="w-3 h-3" />
      Edit
    </a>
  );
}
