/**
 * Tests for the Admin page component.
 *
 * TDD: RED first. The admin page is a client component that
 * fetches content.json and blog posts via the API and provides
 * editing controls. Tabbed UI: Site | Home | About | CV | Skills | Blog.
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock fetch globally
const mockContentData = {
  site: {
    name: "Chad Moore",
    tagline: "Senior / Staff Full‑Stack Engineer",
    sections: { about: true, projects: true, blog: true, cv: true },
    links: {
      email: "chad@chadmoore.info",
      github: "https://github.com/chadmoore",
      linkedin: "https://www.linkedin.com/in/chad-moore-info",
    },
    navOrder: ["home", "about", "projects", "blog", "cv", "skills"],
  },
  home: {
    greeting: "Hi, I'm",
    featureCards: [{ title: "Card", description: "Desc", icon: "integration" }],
  },
  about: {
    heading: "About Me",
    intro: ["Intro paragraph."],
    skillsHeading: "What I Work With",
    contactHeading: "Get In Touch",
    contactText: "I'm always open to discussing new opportunities.",
  },
  blog: { heading: "Blog", description: "Posts about engineering." },
  projects: { heading: "Projects", description: "Public repos on GitHub." },
  cv: {
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
      json: () => Promise.resolve(mockContentData),
    });
  }) as jest.Mock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Dynamic import so the mock is in place before the component loads
import AdminPage from "@/app/admin/page";

describe("AdminPage", () => {
  it("fetches content data on mount", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/content");
    });
  });

  it("fetches blog posts on mount", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/blog");
    });
  });

  it("renders tab buttons for all sections", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^site$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^home$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^about$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^projects$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^cv$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^skills$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^blog$/i })).toBeInTheDocument();
    });
  });

  it("renders skill categories after switching to skills tab", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    fireEvent.click(screen.getByRole("button", { name: /^skills$/i }));

    await waitFor(() => {
      expect(screen.getByText("Frontend")).toBeInTheDocument();
      expect(screen.getByText("Backend")).toBeInTheDocument();
    });
  });

  it("renders individual skill names in inputs", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    fireEvent.click(screen.getByRole("button", { name: /^skills$/i }));

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
    await waitFor(() => screen.getByText("Site Settings"));

    fireEvent.click(screen.getByRole("button", { name: /^skills$/i }));

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

  it("renders tabs in navOrder from content data", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    const allButtons = screen.getAllByRole("button");
    const tabLabels = ["Site", "Home", "About", "Projects", "Blog", "CV", "Skills"];
    const tabs = allButtons.filter((btn) => tabLabels.includes(btn.textContent ?? ""));
    expect(tabs.map((btn) => btn.textContent)).toEqual(tabLabels);
  });

  it("makes non-site tabs draggable", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    const siteTab = screen.getByRole("button", { name: /^site$/i });
    expect(siteTab).not.toHaveAttribute("draggable", "true");

    const homeTab = screen.getByRole("button", { name: /^home$/i });
    expect(homeTab).toHaveAttribute("draggable", "true");
  });

  // ─── Projects tab tests ───────────────────────────────────────

  it("renders projects tab with heading and description fields", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    fireEvent.click(screen.getByRole("button", { name: /^projects$/i }));

    await waitFor(() => {
      expect(screen.getByText("Projects Page")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Projects")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Public repos on GitHub.")).toBeInTheDocument();
    });
  });

  // ─── Blog tab tests ────────────────────────────────────────────

  it("switches to blog tab when clicked", async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText("Site Settings")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /^blog$/i }));

    await waitFor(() => {
      expect(screen.getByText("Blog Posts")).toBeInTheDocument();
    });
  });

  it("shows blog posts in the blog tab", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    fireEvent.click(screen.getByRole("button", { name: /^blog$/i }));

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });
  });

  it("shows new post button in blog tab", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    fireEvent.click(screen.getByRole("button", { name: /^blog$/i }));

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

  it("save button is disabled when no changes exist", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    const saveBtn = screen.getByRole("button", { name: /^save$/i });
    expect(saveBtn).toBeDisabled();
    expect(screen.getByRole("button", { name: /publish/i })).toBeDisabled();
  });

  it("save button becomes enabled after modifying a field", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    const saveBtn = screen.getByRole("button", { name: /^save$/i });
    expect(saveBtn).toBeDisabled();

    // Modify the site name
    const nameInput = screen.getByDisplayValue("Chad Moore");
    fireEvent.change(nameInput, { target: { value: "Test User" } });

    expect(saveBtn).not.toBeDisabled();
  });

  it("publish button becomes enabled after a successful save with changes", async () => {
    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    // Modify the site name so data differs from last-saved snapshot
    const nameInput = screen.getByDisplayValue("Chad Moore");
    fireEvent.change(nameInput, { target: { value: "Test User" } });

    // Click Save
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      const publishBtn = screen.getByRole("button", { name: /publish/i });
      expect(publishBtn).not.toBeDisabled();
    });
  });

  it("publish button becomes disabled again after successful publish", async () => {
    // Mock responses: content load, blog load, content save, then publish
    (global.fetch as jest.Mock).mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "POST" && url.includes("/api/admin/publish")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hash: "abc1234" }),
        });
      }
      if (opts?.method === "PUT" && url.includes("/api/admin/content")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
      }
      if (url.includes("/api/admin/blog")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPosts) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockContentData) });
    });

    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    // Modify data so save detects a change
    const nameInput = screen.getByDisplayValue("Chad Moore");
    fireEvent.change(nameInput, { target: { value: "Test User" } });

    // Save to enable publish
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
      if (opts?.method === "PUT" && url.includes("/api/admin/content")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
      }
      if (url.includes("/api/admin/blog")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPosts) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockContentData) });
    });

    render(<AdminPage />);
    await waitFor(() => screen.getByText("Site Settings"));

    // Modify data so save detects a change
    const nameInput = screen.getByDisplayValue("Chad Moore");
    fireEvent.change(nameInput, { target: { value: "Test User" } });

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
