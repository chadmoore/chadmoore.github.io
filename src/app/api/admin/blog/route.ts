/**
 * Admin API — List all blog posts and create new ones.
 *
 * GET  /api/admin/blog  → returns all posts (metadata only, no content)
 * POST /api/admin/blog  → creates a new post from { slug, title, date, excerpt, tags, content }
 *
 * Dev-only — stripped by CI before static export, same as the CV API.
 */
import { NextResponse } from "next/server";
import { listBlogPosts, createBlogPost } from "@/lib/admin";

export async function GET() {
  try {
    const posts = listBlogPosts();
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json(
      { error: "Failed to list blog posts" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    createBlogPost(data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
