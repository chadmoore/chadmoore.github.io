/**
 * Deploy-status helpers — poll GitHub Actions for a commit's workflow state.
 *
 * Extracted from the API route so they can be tested without pulling in
 * next/server (which requires Web API globals not available in Node tests).
 */
import { execSync } from "child_process";

const REPO_ROOT = process.cwd();

export type DeployStatus = "pending" | "success" | "failure";

interface WorkflowRun {
  status: string;
  conclusion: string | null;
}

interface GitHubRunsResponse {
  workflow_runs?: WorkflowRun[];
}

/** Parse { owner, repo } from the local git remote. */
export function getGitHubRepo(): { owner: string; repo: string } {
  const remoteUrl = execSync("git remote get-url origin", {
    cwd: REPO_ROOT,
    encoding: "utf-8",
  }).trim();

  // Handles SSH (git@github.com:owner/repo.git) and HTTPS (...github.com/owner/repo.git)
  const match = remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
  if (!match) throw new Error(`Cannot parse GitHub remote URL: ${remoteUrl}`);
  return { owner: match[1], repo: match[2] };
}

/**
 * Fetch the current deploy status for a given commit SHA from GitHub Actions.
 * Throws on unrecoverable errors (bad remote URL, GitHub API failure).
 */
export async function getDeployStatus(sha: string): Promise<DeployStatus> {
  const { owner, repo } = getGitHubRepo();

  const apiUrl =
    `https://api.github.com/repos/${owner}/${repo}/actions/runs` +
    `?head_sha=${sha}&per_page=5`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "admin-panel",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(apiUrl, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API returned ${res.status}`);
  }

  const data = (await res.json()) as GitHubRunsResponse;
  const runs: WorkflowRun[] = data.workflow_runs ?? [];

  if (runs.length === 0) return "pending";

  // Ignore skipped runs (e.g. path filters); take the first real run
  const run = runs.find((r) => r.conclusion !== "skipped") ?? runs[0];

  if (run.status !== "completed") return "pending";
  return run.conclusion === "success" ? "success" : "failure";
}
