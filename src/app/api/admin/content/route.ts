/**
 * Admin API — GET and PUT content.json.
 *
 * GET  /api/admin/content  → returns the current content.json
 * PUT  /api/admin/content  → overwrites content.json with the request body
 *
 * These routes only work in development (next dev).
 * The CI pipeline removes src/app/api/ before static export,
 * so this code never ships to production.
 *
 * // If you somehow reached this endpoint in production,
 * // congratulations on your time-travel abilities.
 */
import { NextResponse } from "next/server";
import { readContentData, writeContentData } from "@/lib/admin";

export async function GET() {
  try {
    const data = readContentData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to read content.json" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    writeContentData(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to write content.json" },
      { status: 500 }
    );
  }
}
