/**
 * Tests for the Admin page component.
 *
 * TDD: RED first. The admin page is a client component that
 * fetches cv.json and blog posts via the API and provides
 * editing controls. Tabbed UI: Skills | Blog.
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock fetch globally
const mockCvData = {
  name: "Chad Moore",
  headline: "Senior / Staff Full‑Stack Engineer",
  location: "Northampton, Massachusetts, United States",
  summary: "A summary.",
  specialties: ["Enterprise Systems"],
  experience: [],
  education: [],
  skills: {
    Frontend: [
      { name: "React", proficiency: "expert", preference: "preferred" },
      { name: "AngularJS", proficiency: "proficient", status: "legacy" },
    ],
    Backend: [
      { name: "Node.js", proficiency: "expert", preference: "preferred" },
      { name: "PHP", proficiency: "familiar", status: "legacy" },
    ],
  },
  certifications: [],
  links: {
    email: "chad@chadmoore.info",
    github: "https://github.com/chadmoore",
    linkedin: "https://www.linkedin.com/in/chad-moore-info",
  },
};

const mockPosts = [
  { slug: "hello-world", title: "Hello World", date: "2026-02-23", excerpt: "Welcome", tags: ["meta"] },
];

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url: string) => {
    if (url.includes("/api/admin/blog")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockCvData),
    });
  }) as jest.Mock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Dynamic import so the mock is in place before the component loads
import AdminPage from "@/app/admin/page";

describe("AdminPage", () => {
  it("fetches cv data on mount", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/cv");
    });
  });

  it("fetches blog posts on mount", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/blog");
    });
  });

  it("renders tab buttons for skills and blog", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /skills/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /blog/i })).toBeInTheDocument();
    });
  });

  it("renders skill categories after loading", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText("Frontend")).toBeInTheDocument();
      expect(screen.getByText("Backend")).toBeInTheDocument();
    });
  });

  it("renders individual skill names in inputs", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText("Skill name");
      const values = inputs.map((el) => (el as HTMLInputElement).value);
      expect(values).toContain("React");
      expect(values).toContain("Node.js");
      expect(values).toContain("AngularJS");
    });
  });

  it("renders proficiency selectors for each skill", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      // Each skill should have a proficiency dropdown
      const selects = screen.getAllByRole("combobox");
      // At least one per skill (proficiency) — 4 skills × 3 dropdowns = 12
      expect(selects.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("renders a save button", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /save/i })
      ).toBeInTheDocument();
    });
  });

  it("shows a loading state initially", () => {
    render(<AdminPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows dev-only warning text", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText(/development only/i)).toBeInTheDocument();
    });
  });

  // ─── Blog tab tests ────────────────────────────────────────────

  it("switches to blog tab when clicked", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText("Frontend")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /blog/i }));

    await waitFor(() => {
      expect(screen.getByText("Blog Posts")).toBeInTheDocument();
    });
  });

  it("shows blog posts in the blog tab", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Frontend"));

    fireEvent.click(screen.getByRole("button", { name: /blog/i }));

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });
  });

  it("shows new post button in blog tab", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Frontend"));

    fireEvent.click(screen.getByRole("button", { name: /blog/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /new post/i })).toBeInTheDocument();
    });
  });

  // ─── Publish button tests ──────────────────────────────────────

  it("renders a publish button", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
    });
  });

  it("publish button is disabled before any save", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /publish/i });
      expect(btn).toBeDisabled();
    });
  });

  it("publish button stays disabled when saving without changes", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Frontend"));

    // Click Save without modifying anything
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText(/no changes to save/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /publish/i })).toBeDisabled();
  });

  it("publish button becomes enabled after a successful CV save with changes", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Frontend"));

    // Modify a skill name so data differs from last-saved snapshot
    const inputs = screen.getAllByPlaceholderText("Skill name");
    fireEvent.change(inputs[0], { target: { value: "Vue" } });

    // Click Save (CV)
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      const publishBtn = screen.getByRole("button", { name: /publish/i });
      expect(publishBtn).not.toBeDisabled();
    });
  });

  it("publish button becomes disabled again after successful publish", async () => {
    // Mock responses: CV load, blog load, CV save, then publish
    (global.fetch as jest.Mock).mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "POST" && url.includes("/api/admin/publish")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hash: "abc1234" }),
        });
      }
      if (opts?.method === "PUT" && url.includes("/api/admin/cv")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
      }
      if (url.includes("/api/admin/blog")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPosts) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCvData) });
    });

    render(<AdminPage />);
    await waitFor(() => screen.getByText("Frontend"));

    // Modify data so save detects a change
    const inputs = screen.getAllByPlaceholderText("Skill name");
    fireEvent.change(inputs[0], { target: { value: "Vue" } });

    // Save CV to enable publish
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /publish/i })).not.toBeDisabled();
    });

    // Click Publish
    fireEvent.click(screen.getByRole("button", { name: /publish/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /publish/i })).toBeDisabled();
    });
  });

  it("shows published commit hash after publish", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "POST" && url.includes("/api/admin/publish")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hash: "abc1234" }),
        });
      }
      if (opts?.method === "PUT" && url.includes("/api/admin/cv")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
      }
      if (url.includes("/api/admin/blog")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPosts) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCvData) });
    });

    render(<AdminPage />);
    await waitFor(() => screen.getByText("Frontend"));

    // Modify data so save detects a change
    const inputs = screen.getAllByPlaceholderText("Skill name");
    fireEvent.change(inputs[0], { target: { value: "Vue" } });

    // Save then publish
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /publish/i })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole("button", { name: /publish/i }));

    await waitFor(() => {
      expect(screen.getByText(/Published.*abc1234/)).toBeInTheDocument();
    });
  });
});
