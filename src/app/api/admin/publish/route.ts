/**
 * Admin API — Publish content changes via git.
 *
 * POST /api/admin/publish → stages, commits, and pushes all changes
 *
 * Accepts an optional { message } body for the commit message.
 * Returns { hash } on success or { hash: "no-changes" } if the
 * working tree is clean.
 *
 * Dev-only — stripped by CI before static export like all admin routes.
 */
import { NextResponse } from "next/server";
import { publishChanges } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    let message = "Update content via admin";
    try {
      const body = await request.json();
      if (body.message && typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // no body or invalid JSON — use default message
    }

    const hash = await publishChanges(message);
    return NextResponse.json({ hash });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Publish failed" },
      { status: 500 }
    );
  }
}
