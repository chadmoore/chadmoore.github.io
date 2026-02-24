/**
 * Admin API — Read, update, and delete a single blog post.
 *
 * GET    /api/admin/blog/[slug]  → returns full post (metadata + content)
 * PUT    /api/admin/blog/[slug]  → overwrites the post's .md file
 * DELETE /api/admin/blog/[slug]  → deletes the .md file
 *
 * Dev-only — stripped by CI before static export.
 */
import { NextResponse } from "next/server";
import { readBlogPost, updateBlogPost, deleteBlogPost } from "@/lib/admin";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const post = readBlogPost(slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch {
    return NextResponse.json(
      { error: "Failed to read post" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const data = await request.json();
    updateBlogPost(slug, data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    deleteBlogPost(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
