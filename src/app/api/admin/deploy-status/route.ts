/**
 * Admin API — Poll GitHub Actions for the deploy status of a commit.
 *
 * GET /api/admin/deploy-status?sha=<commit-sha>
 *
 * Returns { status: "pending" | "success" | "failure" }.
 * Core logic lives in src/lib/deployStatus.ts so it can be unit-tested
 * without loading next/server.
 *
 * Dev-only — excluded from the static export like all admin routes.
 */
import { NextResponse } from "next/server";
import { getDeployStatus } from "@/lib/deployStatus";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sha = searchParams.get("sha");
    if (!sha) {
      return NextResponse.json({ error: "Missing sha parameter" }, { status: 400 });
    }

    const status = await getDeployStatus(sha);
    return NextResponse.json({ status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Status check failed" },
      { status: 500 },
    );
  }
}
