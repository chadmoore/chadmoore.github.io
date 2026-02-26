/**
 * Tests for the CVTab admin component — experience editing.
 *
 * TDD: covers accordion expand/collapse, field editing, highlight
 * management, skill tag add/remove, reordering, and entry CRUD.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";
import { CVTab } from "@/app/admin/components/CVTab";
import type { ContentData, Experience } from "@/lib/contentData";

// ─── Helpers ────────────────────────────────────────────────────────

function buildExperience(overrides: Partial<Experience> = {}): Experience {
  return {
    title: "Staff Engineer",
    company: "Acme Corp",
    location: "Remote",
    startDate: "2022-01",
    endDate: "Present",
    description: "Led platform team.",
    highlights: [
      { text: "Built CI/CD pipeline", skills: ["Docker", "GitHub Actions"] },
      { text: "Reduced latency by 40%", skills: ["Node.js"] },
    ],
    ...overrides,
  };
}

function buildData(experience: Experience[] = [buildExperience()]): ContentData {
  return {
    site: {
      name: "Test",
      tagline: "",
      sections: { about: true, projects: true, blog: true, cv: true },
      links: { email: "", github: "", linkedin: "" },
      navOrder: ["home", "cv"],
    },
    home: { greeting: "Hi", featureCards: [] },
    about: {
      heading: "",
      intro: [],
      skillsHeading: "",
      contactHeading: "",
      contactText: "",
    },
    blog: { heading: "", description: "" },
    projects: { heading: "", description: "" },
    cv: {
      headline: "Engineer",
      location: "Somewhere",
      summary: "A summary",
      specialties: ["Testing"],
      experience,
      education: [],
      skills: {},
      certifications: [],
    },
  } as ContentData;
}

function renderCVTab(data?: ContentData) {
  const updateField = jest.fn();
  const result = render(
    <CVTab data={data ?? buildData()} updateField={updateField} />,
  );
  return { updateField, ...result };
}

// ─── Tests ──────────────────────────────────────────────────────────

describe("CVTab", () => {
  // ── Basic rendering ─────────────────────────────────────────────

  it("renders top-level CV fields", () => {
    renderCVTab();
    expect(screen.getByDisplayValue("Engineer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Somewhere")).toBeInTheDocument();
    expect(screen.getByDisplayValue("A summary")).toBeInTheDocument();
  });

  it("renders specialties", () => {
    renderCVTab();
    expect(screen.getByDisplayValue("Testing")).toBeInTheDocument();
  });

  it("shows experience count", () => {
    renderCVTab();
    expect(screen.getByText("1 entries")).toBeInTheDocument();
  });

  // ── Collapsed experience header ─────────────────────────────────

  it("renders collapsed experience header with title and company", () => {
    renderCVTab();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
  });

  it("shows date range in collapsed header", () => {
    renderCVTab();
    expect(screen.getByText(/2022-01/)).toBeInTheDocument();
    expect(screen.getByText(/Present/)).toBeInTheDocument();
  });

  // ── Expand / collapse ───────────────────────────────────────────

  it("does not show experience detail fields when collapsed", () => {
    renderCVTab();
    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
  });

  it("expands experience entry on click", () => {
    renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toBeInTheDocument();
    expect(screen.getByLabelText("Experience Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Experience Description")).toBeInTheDocument();
  });

  it("shows highlights when expanded", () => {
    renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    expect(screen.getByDisplayValue("Built CI/CD pipeline")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Reduced latency by 40%")).toBeInTheDocument();
  });

  it("shows skill tags on highlights", () => {
    renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("GitHub Actions")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
  });

  it("collapses entry on second click", () => {
    renderCVTab();
    const header = screen.getByText("Staff Engineer");
    fireEvent.click(header);
    expect(screen.getByLabelText("Title")).toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
  });

  // ── Field editing calls updateField ─────────────────────────────

  it("calls updateField when editing headline", () => {
    const { updateField } = renderCVTab();
    fireEvent.change(screen.getByDisplayValue("Engineer"), {
      target: { value: "Principal Engineer" },
    });
    expect(updateField).toHaveBeenCalledWith("cv", expect.any(Function));
  });

  it("calls updateField when editing experience title", () => {
    const { updateField } = renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Principal" },
    });
    expect(updateField).toHaveBeenCalledWith("cv", expect.any(Function));
  });

  // ── Highlight management ────────────────────────────────────────

  it("shows '+ Add Highlight' button when expanded", () => {
    renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));
    expect(screen.getByText("+ Add Highlight")).toBeInTheDocument();
  });

  it("calls updateField when removing a highlight", () => {
    const { updateField } = renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    const removeButtons = screen.getAllByTitle("Remove highlight");
    fireEvent.click(removeButtons[0]);

    expect(updateField).toHaveBeenCalledWith("cv", expect.any(Function));
  });

  // ── Skill tag management ────────────────────────────────────────

  it("renders + Skill buttons for each highlight", () => {
    renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    const addSkillBtns = screen.getAllByText("+ Skill");
    expect(addSkillBtns.length).toBe(2); // one per highlight
  });

  it("shows input when '+ Skill' is clicked", () => {
    renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    const addSkillBtns = screen.getAllByText("+ Skill");
    fireEvent.click(addSkillBtns[0]);

    expect(screen.getByLabelText("Add skill tag")).toBeInTheDocument();
  });

  it("calls updateField when removing a skill tag", () => {
    const { updateField } = renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    fireEvent.click(screen.getByTitle("Remove Docker"));
    expect(updateField).toHaveBeenCalledWith("cv", expect.any(Function));
  });

  // ── Reorder controls ───────────────────────────────────────────

  it("shows disabled move-up for first entry", () => {
    const data = buildData([buildExperience(), buildExperience({ title: "Junior Dev", company: "Startup" })]);
    renderCVTab(data);

    const upButtons = screen.getAllByTitle("Move up");
    expect(upButtons[0]).toBeDisabled();
    expect(upButtons[1]).not.toBeDisabled();
  });

  it("shows disabled move-down for last entry", () => {
    const data = buildData([buildExperience(), buildExperience({ title: "Junior Dev", company: "Startup" })]);
    renderCVTab(data);

    const downButtons = screen.getAllByTitle("Move down");
    expect(downButtons[0]).not.toBeDisabled();
    expect(downButtons[1]).toBeDisabled();
  });

  // ── Highlight reorder controls ─────────────────────────────────

  it("shows move-up/down buttons for highlights when expanded", () => {
    renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    const upButtons = screen.getAllByTitle("Move highlight up");
    const downButtons = screen.getAllByTitle("Move highlight down");
    expect(upButtons).toHaveLength(2);
    expect(downButtons).toHaveLength(2);
  });

  it("disables move-up on first highlight and move-down on last", () => {
    renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    const upButtons = screen.getAllByTitle("Move highlight up");
    const downButtons = screen.getAllByTitle("Move highlight down");
    expect(upButtons[0]).toBeDisabled();
    expect(upButtons[1]).not.toBeDisabled();
    expect(downButtons[0]).not.toBeDisabled();
    expect(downButtons[1]).toBeDisabled();
  });

  it("calls updateField when moving a highlight down", () => {
    const { updateField } = renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));

    const downButtons = screen.getAllByTitle("Move highlight down");
    fireEvent.click(downButtons[0]);
    expect(updateField).toHaveBeenCalledWith("cv", expect.any(Function));
  });

  // ── Add / delete entry ──────────────────────────────────────────

  it("renders '+ Add Position' button", () => {
    renderCVTab();
    expect(screen.getByText("+ Add Position")).toBeInTheDocument();
  });

  it("calls updateField when adding a position", () => {
    const { updateField } = renderCVTab();
    fireEvent.click(screen.getByText("+ Add Position"));
    expect(updateField).toHaveBeenCalledWith("cv", expect.any(Function));
  });

  it("shows 'Delete this position' when expanded", () => {
    renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));
    expect(screen.getByText("Delete this position")).toBeInTheDocument();
  });

  it("calls updateField when deleting a position", () => {
    const { updateField } = renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));
    fireEvent.click(screen.getByText("Delete this position"));
    expect(updateField).toHaveBeenCalledWith("cv", expect.any(Function));
  });

  // ── Empty state ─────────────────────────────────────────────────

  it("shows 0 entries when experience is empty", () => {
    renderCVTab(buildData([]));
    expect(screen.getByText("0 entries")).toBeInTheDocument();
  });

  it("shows 'Untitled Position' for entries with empty title", () => {
    renderCVTab(buildData([buildExperience({ title: "" })]));
    expect(screen.getByText("Untitled Position")).toBeInTheDocument();
  });

  // ── Highlight count label ───────────────────────────────────────

  it("shows highlight count in section header", () => {
    renderCVTab();
    fireEvent.click(screen.getByText("Staff Engineer"));
    expect(screen.getByText("Highlights (2)")).toBeInTheDocument();
  });
});
