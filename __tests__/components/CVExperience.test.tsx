/**
 * Tests for CVExperience — filterable, sortable work history component.
 *
 * Uses synthetic mock data to keep tests deterministic and independent
 * of the real content.json, which may evolve.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CVExperience from "@/components/CVExperience";
import type { Experience } from "@/lib/contentData";
import type { Skill } from "@/lib/skills";

// ─── Mock data ───────────────────────────────────────────────────────

const mockSkills: Record<string, Skill[]> = {
  Frontend: [
    { name: "React", proficiency: "expert", preference: "preferred", status: "active" },
    { name: "jQuery", proficiency: "familiar", preference: "neutral", status: "legacy" },
  ],
  Backend: [
    { name: "Node.js", proficiency: "proficient", preference: "preferred", status: "active" },
    { name: "PHP", proficiency: "familiar", preference: "neutral", status: "legacy" },
  ],
};

const mockExperience: Experience[] = [
  {
    title: "Senior Engineer",
    company: "AcmeCorp",
    location: "Remote",
    startDate: "2022-01",
    endDate: "",
    description: "Modern platform work.",
    highlights: [
      { text: "Built React dashboard", skills: ["React"] },
      { text: "Wrote Node.js microservices", skills: ["Node.js"] },
      { text: "Improved deployment pipeline", skills: [] }, // no skill tag — always visible
    ],
  },
  {
    title: "Junior Developer",
    company: "OldCorp",
    location: "On-site",
    startDate: "2018-06",
    endDate: "2021-12",
    description: "Legacy codebase maintenance.",
    highlights: [
      { text: "Maintained jQuery frontend", skills: ["jQuery"] },
      { text: "Patched PHP backend", skills: ["PHP"] },
    ],
  },
];

// ─── Tests ───────────────────────────────────────────────────────────

describe("CVExperience", () => {
  const user = userEvent.setup();

  // ── Default rendering ─────────────────────────────────────────────

  it("renders all job titles by default", () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Junior Developer")).toBeInTheDocument();
  });

  it("renders company names by default", () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    expect(screen.getByText(/AcmeCorp/)).toBeInTheDocument();
    expect(screen.getByText(/OldCorp/)).toBeInTheDocument();
  });

  it("renders all highlight bullets by default", () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    expect(screen.getByText("Built React dashboard")).toBeInTheDocument();
    expect(screen.getByText("Wrote Node.js microservices")).toBeInTheDocument();
    expect(screen.getByText("Improved deployment pipeline")).toBeInTheDocument();
    expect(screen.getByText("Maintained jQuery frontend")).toBeInTheDocument();
    expect(screen.getByText("Patched PHP backend")).toBeInTheDocument();
  });

  it("renders skill tags on highlights", () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    expect(screen.getAllByText("React").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Node.js").length).toBeGreaterThanOrEqual(1);
  });

  // ── Filter controls ───────────────────────────────────────────────

  it("renders all proficiency toggle pills", () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    expect(screen.getByRole("button", { name: /expert/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /proficient/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /familiar/i })).toBeInTheDocument();
  });

  it("renders all preference toggle pills", () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    expect(screen.getByRole("button", { name: /preferred/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /neutral/i })).toBeInTheDocument();
  });

  it("renders all status toggle pills", () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    expect(screen.getByRole("button", { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /legacy/i })).toBeInTheDocument();
  });

  it("all filter toggles start as pressed (all visible)", () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    const pills = ["Expert", "Proficient", "Familiar", "Preferred", "Neutral", "Active", "Legacy"];
    for (const label of pills) {
      expect(screen.getByRole("button", { name: label })).toHaveAttribute("aria-pressed", "true");
    }
  });

  // ── Sort controls ─────────────────────────────────────────────────

  it("renders date and relevance sort buttons", () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    expect(screen.getByRole("button", { name: /date/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /relevance/i })).toBeInTheDocument();
  });

  it("date sort is active by default", () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    const dateBtn = screen.getByRole("button", { name: "date" });
    expect(dateBtn.className).toMatch(/bg-accent/);
  });

  // ── Filtering behaviour ───────────────────────────────────────────

  it("hides familiar-skill highlights when Familiar is toggled off", async () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    // Default: jQuery and PHP highlights are visible
    expect(screen.getByText("Maintained jQuery frontend")).toBeInTheDocument();
    expect(screen.getByText("Patched PHP backend")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Familiar" }));

    expect(screen.queryByText("Maintained jQuery frontend")).not.toBeInTheDocument();
    expect(screen.queryByText("Patched PHP backend")).not.toBeInTheDocument();
  });

  it("job titles remain visible even when all their highlights are filtered", async () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    await user.click(screen.getByRole("button", { name: "Familiar" }));
    // OldCorp only has familiar skills → all highlights hidden, but title stays
    expect(screen.getByText("Junior Developer")).toBeInTheDocument();
    expect(screen.getByText(/OldCorp/)).toBeInTheDocument();
  });

  it("highlights with no skill tags are always shown regardless of filters", async () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    // Toggle off everything except one value in each dimension to be restrictive
    await user.click(screen.getByRole("button", { name: "Proficient" }));
    await user.click(screen.getByRole("button", { name: "Familiar" }));
    // "Improved deployment pipeline" has no skill tags — should always appear
    expect(screen.getByText("Improved deployment pipeline")).toBeInTheDocument();
  });

  it("hides legacy-skill highlights when Legacy is toggled off", async () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    await user.click(screen.getByRole("button", { name: "Legacy" }));
    expect(screen.queryByText("Maintained jQuery frontend")).not.toBeInTheDocument();
    expect(screen.queryByText("Patched PHP backend")).not.toBeInTheDocument();
    // Active/expert highlights still visible
    expect(screen.getByText("Built React dashboard")).toBeInTheDocument();
  });

  it("toggling Legacy back on restores the hidden highlights", async () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    await user.click(screen.getByRole("button", { name: "Legacy" }));
    expect(screen.queryByText("Maintained jQuery frontend")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Legacy" }));
    expect(screen.getByText("Maintained jQuery frontend")).toBeInTheDocument();
  });

  // ── Sort behaviour ────────────────────────────────────────────────

  it("clicking Relevance sort activates the relevance button", async () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    const relevanceBtn = screen.getByRole("button", { name: "relevance" });
    await user.click(relevanceBtn);
    expect(relevanceBtn.className).toMatch(/bg-accent/);
  });

  it("relevance sort places the entry with more matching highlights first", async () => {
    render(<CVExperience experience={mockExperience} skills={mockSkills} />);
    // Toggle off Familiar so OldCorp (jQuery, PHP = familiar) gets 0 matches
    // AcmeCorp keeps React + Node.js = 2 matches + 1 untagged = 3 visible
    await user.click(screen.getByRole("button", { name: "Familiar" }));
    await user.click(screen.getByRole("button", { name: "relevance" }));

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[0]).toHaveTextContent("Senior Engineer");
    expect(headings[1]).toHaveTextContent("Junior Developer");
  });
});
