/**
 * Admin API — GET and PUT cv.json.
 *
 * GET  /api/admin/cv  → returns the current cv.json
 * PUT  /api/admin/cv  → overwrites cv.json with the request body
 *
 * These routes only work in development (next dev).
 * The CI pipeline removes src/app/api/ before static export,
 * so this code never ships to production.
 *
 * // If you somehow reached this endpoint in production,
 * // congratulations on your time-travel abilities.
 */
import { NextResponse } from "next/server";
import { readCvData, writeCvData } from "@/lib/admin";

export async function GET() {
  try {
    const data = readCvData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to read cv.json" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    writeCvData(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to write cv.json" },
      { status: 500 }
    );
  }
}
