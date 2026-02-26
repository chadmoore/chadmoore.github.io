/**
 * Admin API — GET content/lighthouse.json.
 *
 * GET  /api/admin/lighthouse  → returns the latest Lighthouse audit scores.
 *
 * Pulls from git first so the local file matches what the
 * GitHub Action committed. Read-only — the Action is the sole writer.
 * Only works in development (next dev).
 */
import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const LIGHTHOUSE_PATH = path.join(process.cwd(), "content", "lighthouse.json");

export async function GET() {
  try {
    // Pull latest so we pick up scores committed by the GitHub Action
    try {
      execSync("git pull --rebase", { cwd: process.cwd(), timeout: 15_000 });
    } catch {
      // Non-fatal — serve whatever is on disk
    }

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
