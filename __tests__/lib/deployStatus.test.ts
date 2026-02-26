/**
 * Tests for src/app/api/admin/deploy-status/route.ts
 *
 * TDD: covers the GitHub Actions poll logic — parsing the git remote,
 * delegating to the GitHub API, and mapping run state to a status string.
 *
 * We test the exported pure helpers (getGitHubRepo, getDeployStatus) directly
 * to avoid the next/server initialisation requiring Web API globals in Node.
 */
import { execSync } from "child_process";

jest.mock("child_process");

const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

// Helper: build a fake GitHub runs API response
function githubResponse(runs: { status: string; conclusion: string | null }[]) {
  return Promise.resolve({
    ok: true,
    json: async () => ({ workflow_runs: runs }),
  } as unknown as Response);
}

// Reset mocks before each test
beforeEach(() => {
  mockedExecSync.mockReset();
  mockedExecSync.mockReturnValue(
    "git@github.com:testowner/testrepo.git" as unknown as ReturnType<typeof execSync>,
  );
  global.fetch = jest.fn();
});

import { getGitHubRepo, getDeployStatus } from "../../src/lib/deployStatus";

describe("getGitHubRepo", () => {
  it("parses SSH remote URLs", () => {
    mockedExecSync.mockReturnValue(
      "git@github.com:myowner/myrepo.git" as unknown as ReturnType<typeof execSync>,
    );
    expect(getGitHubRepo()).toEqual({ owner: "myowner", repo: "myrepo" });
  });

  it("parses HTTPS remote URLs", () => {
    mockedExecSync.mockReturnValue(
      "https://github.com/someowner/somerepo.git" as unknown as ReturnType<typeof execSync>,
    );
    expect(getGitHubRepo()).toEqual({ owner: "someowner", repo: "somerepo" });
  });

  it("throws when the remote is not a GitHub URL", () => {
    mockedExecSync.mockReturnValue(
      "https://gitlab.com/owner/repo.git" as unknown as ReturnType<typeof execSync>,
    );
    expect(() => getGitHubRepo()).toThrow(/Cannot parse GitHub remote URL/);
  });
});

describe("getDeployStatus", () => {
  describe("no runs yet", () => {
    it("returns 'pending' when workflow_runs is empty", async () => {
      (global.fetch as jest.Mock).mockReturnValue(githubResponse([]));
      expect(await getDeployStatus("abc1234")).toBe("pending");
    });
  });

  describe("run in progress", () => {
    it("returns 'pending' when the run has not completed", async () => {
      (global.fetch as jest.Mock).mockReturnValue(
        githubResponse([{ status: "in_progress", conclusion: null }]),
      );
      expect(await getDeployStatus("abc1234")).toBe("pending");
    });
  });

  describe("completed success", () => {
    it("returns 'success' when conclusion is success", async () => {
      (global.fetch as jest.Mock).mockReturnValue(
        githubResponse([{ status: "completed", conclusion: "success" }]),
      );
      expect(await getDeployStatus("abc1234")).toBe("success");
    });
  });

  describe("completed failure", () => {
    it("returns 'failure' when conclusion is not success", async () => {
      (global.fetch as jest.Mock).mockReturnValue(
        githubResponse([{ status: "completed", conclusion: "failure" }]),
      );
      expect(await getDeployStatus("abc1234")).toBe("failure");
    });
  });

  describe("skipped runs", () => {
    it("skips runs with conclusion=skipped and uses the next run", async () => {
      (global.fetch as jest.Mock).mockReturnValue(
        githubResponse([
          { status: "completed", conclusion: "skipped" },
          { status: "completed", conclusion: "success" },
        ]),
      );
      expect(await getDeployStatus("abc1234")).toBe("success");
    });

    it("falls back to the first run when all runs are skipped", async () => {
      (global.fetch as jest.Mock).mockReturnValue(
        githubResponse([{ status: "completed", conclusion: "skipped" }]),
      );
      // skipped falls back to first run; conclusion !== "success" → failure
      expect(await getDeployStatus("abc1234")).toBe("failure");
    });
  });

  describe("GitHub API errors", () => {
    it("throws when GitHub API responds with a non-OK status", async () => {
      (global.fetch as jest.Mock).mockReturnValue(
        Promise.resolve({ ok: false, status: 403 } as unknown as Response),
      );
      await expect(getDeployStatus("abc1234")).rejects.toThrow("GitHub API returned 403");
    });
  });

  describe("GitHub token", () => {
    it("includes Authorization header when GITHUB_TOKEN is set", async () => {
      process.env.GITHUB_TOKEN = "test-token";
      (global.fetch as jest.Mock).mockReturnValue(githubResponse([]));

      await getDeployStatus("abc1234");

      const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1]
        ?.headers as Record<string, string>;
      expect(calledHeaders["Authorization"]).toBe("Bearer test-token");

      delete process.env.GITHUB_TOKEN;
    });

    it("omits Authorization header when GITHUB_TOKEN is not set", async () => {
      delete process.env.GITHUB_TOKEN;
      (global.fetch as jest.Mock).mockReturnValue(githubResponse([]));

      await getDeployStatus("abc1234");

      const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1]
        ?.headers as Record<string, string>;
      expect(calledHeaders["Authorization"]).toBeUndefined();
    });
  });

  describe("API URL construction", () => {
    it("passes the sha as head_sha and includes owner/repo from remote", async () => {
      (global.fetch as jest.Mock).mockReturnValue(githubResponse([]));

      await getDeployStatus("deadbeef");

      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain("testowner/testrepo");
      expect(calledUrl).toContain("head_sha=deadbeef");
    });
  });
});

