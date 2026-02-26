/**
 * Admin API — GET content/lighthouse.json.
 *
 * GET  /api/admin/lighthouse  → returns the latest Lighthouse audit scores.
 *
 * Read-only — the GitHub Action is the sole writer.
 * Only works in development (next dev).
 */
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LIGHTHOUSE_PATH = path.join(process.cwd(), "content", "lighthouse.json");

export async function GET() {
  try {
    if (!fs.existsSync(LIGHTHOUSE_PATH)) {
      return NextResponse.json(null, { status: 200 });
    }
    const raw = fs.readFileSync(LIGHTHOUSE_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to read lighthouse.json" },
      { status: 500 },
    );
  }
}
