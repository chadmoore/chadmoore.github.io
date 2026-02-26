/**
 * Tests for src/components/ProjectsList.tsx — GitHub repo showcase.
 *
 * Mocks the global fetch to test loading, success, error, and empty states.
 */
import { render, screen, waitFor } from "@testing-library/react";
import ProjectsList from "@/components/ProjectsList";

// Save original fetch
const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

function mockFetchSuccess(repos: Record<string, unknown>[]) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => repos,
  });
}

function mockFetchError() {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    json: async () => ({}),
  });
}

function mockFetchNetworkError() {
  global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
}

const sampleRepo = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: "my-project",
  description: "A cool project",
  html_url: "https://github.com/chadmoore/my-project",
  language: "TypeScript",
  stargazers_count: 5,
  fork: false,
  topics: ["web"],
  updated_at: "2026-01-15T00:00:00Z",
  ...overrides,
});

describe("ProjectsList", () => {
  it("shows loading skeletons initially", () => {
    // Never resolve fetch so we stay in loading
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

    const { container } = render(<ProjectsList />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders repos after successful fetch", async () => {
    mockFetchSuccess([
      sampleRepo({ id: 1, name: "alpha", stargazers_count: 10 }),
      sampleRepo({ id: 2, name: "beta", stargazers_count: 3 }),
    ]);

    render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByText("alpha")).toBeInTheDocument();
      expect(screen.getByText("beta")).toBeInTheDocument();
    });
  });

  it("sorts repos by stars (most stars first)", async () => {
    mockFetchSuccess([
      sampleRepo({ id: 1, name: "few-stars", stargazers_count: 1 }),
      sampleRepo({ id: 2, name: "many-stars", stargazers_count: 100 }),
    ]);

    const { container } = render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByText("many-stars")).toBeInTheDocument();
    });

    // Verify order: many-stars should come before few-stars in the DOM
    const repoNames = Array.from(container.querySelectorAll("h2")).map(
      (h2) => h2.textContent
    );
    expect(repoNames.indexOf("many-stars")).toBeLessThan(
      repoNames.indexOf("few-stars")
    );
  });

  it("filters out forked repos", async () => {
    mockFetchSuccess([
      sampleRepo({ id: 1, name: "original-work", fork: false }),
      sampleRepo({ id: 2, name: "forked-repo", fork: true }),
    ]);

    render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByText("original-work")).toBeInTheDocument();
    });

    expect(screen.queryByText("forked-repo")).not.toBeInTheDocument();
  });

  it("shows 'No description' for repos without a description", async () => {
    mockFetchSuccess([sampleRepo({ description: null })]);

    render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByText("No description")).toBeInTheDocument();
    });
  });

  it("displays the language with a color dot", async () => {
    mockFetchSuccess([sampleRepo({ language: "TypeScript" })]);

    render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });
  });

  it("shows error state when API returns non-ok", async () => {
    mockFetchError();

    render(<ProjectsList />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to fetch repositories")
      ).toBeInTheDocument();
    });

    // Should have a fallback link to GitHub profile
    expect(screen.getByText("my GitHub profile")).toBeInTheDocument();
  });

  it("shows error state on network failure", async () => {
    mockFetchNetworkError();

    render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("shows empty state when no repos are returned", async () => {
    mockFetchSuccess([]);

    render(<ProjectsList />);

    await waitFor(() => {
      expect(
        screen.getByText("No repositories found.")
      ).toBeInTheDocument();
    });
  });

  it("shows empty state when all repos are forks", async () => {
    mockFetchSuccess([
      sampleRepo({ id: 1, fork: true }),
      sampleRepo({ id: 2, fork: true }),
    ]);

    render(<ProjectsList />);

    await waitFor(() => {
      expect(
        screen.getByText("No repositories found.")
      ).toBeInTheDocument();
    });
  });

  it("hides star count when repo has zero stars", async () => {
    mockFetchSuccess([sampleRepo({ stargazers_count: 0 })]);

    render(<ProjectsList />);

    await waitFor(() => {
      expect(screen.getByText("my-project")).toBeInTheDocument();
    });

    // The star count "0" should not be visible (only renders when > 0)
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("calls the correct GitHub API endpoint", async () => {
    mockFetchSuccess([]);
    render(<ProjectsList />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.github.com/users/chadmoore/repos?sort=updated&per_page=30&type=owner"
      );
    });
  });
});
