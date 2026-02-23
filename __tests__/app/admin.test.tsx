/**
 * Tests for the Admin page component.
 *
 * TDD: RED first. The admin page is a client component that
 * fetches cv.json via the API and provides editing controls.
 */
import { render, screen, waitFor } from "@testing-library/react";

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

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockCvData),
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
});
