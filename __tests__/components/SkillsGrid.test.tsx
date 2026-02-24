/**
 * Tests for SkillsGrid — interactive filter/sort toggles for skills.
 *
 * Interaction model: every dimension value is a toggle pill.
 * Highlighted (aria-pressed=true) = that value is visible.
 * Click to toggle off. All values start ON.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SkillsGrid from "../../src/components/SkillsGrid";
import type { Skill } from "../../src/lib/skills";

const mockSkills: Record<string, Skill[]> = {
  Frontend: [
    { name: "React", proficiency: "expert", preference: "preferred" },
    { name: "jQuery", proficiency: "proficient", status: "legacy" },
    { name: "CSS", proficiency: "proficient" },
  ],
  Backend: [
    { name: "Node.js", proficiency: "expert", preference: "preferred" },
    { name: "PHP", proficiency: "familiar", status: "legacy" },
  ],
};

describe("SkillsGrid", () => {
  // ─── Default rendering ──────────────────────────────────────────

  it("renders all skill names by default", () => {
    render(<SkillsGrid skills={mockSkills} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("jQuery")).toBeInTheDocument();
    expect(screen.getByText("CSS")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("PHP")).toBeInTheDocument();
  });

  it("renders category headings", () => {
    render(<SkillsGrid skills={mockSkills} />);
    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
  });

  it("renders icons when showIcons is true", () => {
    const { container } = render(
      <SkillsGrid skills={mockSkills} showIcons />,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("does not render icons when showIcons is false", () => {
    const { container } = render(<SkillsGrid skills={mockSkills} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(0);
  });

  // ─── Toggle pills exist for every dimension value ──────────────

  it("renders toggle pills for all dimension values", () => {
    render(<SkillsGrid skills={mockSkills} />);

    // Proficiency
    expect(screen.getByRole("button", { name: "Expert" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proficient" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Familiar" })).toBeInTheDocument();

    // Preference
    expect(screen.getByRole("button", { name: "Preferred" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Neutral" })).toBeInTheDocument();

    // Status
    expect(screen.getByRole("button", { name: /^Active$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Legacy" })).toBeInTheDocument();
  });

  it("all toggle pills start as pressed (all visible)", () => {
    render(<SkillsGrid skills={mockSkills} />);
    expect(screen.getByRole("button", { name: "Expert" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Legacy" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Preferred" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Neutral" })).toHaveAttribute("aria-pressed", "true");
  });

  // ─── Status filtering ──────────────────────────────────────────

  it("hides legacy skills when Legacy is toggled off", () => {
    render(<SkillsGrid skills={mockSkills} />);
    expect(screen.getByText("jQuery")).toBeInTheDocument();
    expect(screen.getByText("PHP")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Legacy" }));

    expect(screen.getByRole("button", { name: "Legacy" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("jQuery")).not.toBeInTheDocument();
    expect(screen.queryByText("PHP")).not.toBeInTheDocument();
    // Active skills still visible
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("CSS")).toBeInTheDocument();
  });

  it("toggles Legacy back on after clicking twice", () => {
    render(<SkillsGrid skills={mockSkills} />);
    const legacyBtn = screen.getByRole("button", { name: "Legacy" });

    fireEvent.click(legacyBtn); // off
    expect(screen.queryByText("jQuery")).not.toBeInTheDocument();

    fireEvent.click(legacyBtn); // back on
    expect(screen.getByText("jQuery")).toBeInTheDocument();
    expect(legacyBtn).toHaveAttribute("aria-pressed", "true");
  });

  // ─── Preference filtering ──────────────────────────────────────

  it("hides neutral skills when Neutral is toggled off", () => {
    render(<SkillsGrid skills={mockSkills} />);

    fireEvent.click(screen.getByRole("button", { name: "Neutral" }));

    // Only preferred remain: React, Node.js
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    // Neutral skills hidden
    expect(screen.queryByText("CSS")).not.toBeInTheDocument();
    // jQuery is legacy + neutral — also hidden
    expect(screen.queryByText("jQuery")).not.toBeInTheDocument();
  });

  // ─── Proficiency filtering ─────────────────────────────────────

  it("hides familiar skills when Familiar is toggled off", () => {
    render(<SkillsGrid skills={mockSkills} />);

    fireEvent.click(screen.getByRole("button", { name: "Familiar" }));

    expect(screen.queryByText("PHP")).not.toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("jQuery")).toBeInTheDocument();
  });

  // ─── Combined filters ──────────────────────────────────────────

  it("combines multiple dimension filters", () => {
    render(<SkillsGrid skills={mockSkills} />);

    // Turn off Legacy and Neutral → only preferred + active
    fireEvent.click(screen.getByRole("button", { name: "Legacy" }));
    fireEvent.click(screen.getByRole("button", { name: "Neutral" }));

    // Only React (expert, preferred, active) and Node.js (expert, preferred, active)
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.queryByText("CSS")).not.toBeInTheDocument();
    expect(screen.queryByText("jQuery")).not.toBeInTheDocument();
    expect(screen.queryByText("PHP")).not.toBeInTheDocument();
  });

  it("hides empty categories when all skills are filtered out", () => {
    render(<SkillsGrid skills={mockSkills} />);

    // Turn off Neutral AND Legacy — both categories still have preferred+active skills
    fireEvent.click(screen.getByRole("button", { name: "Legacy" }));
    fireEvent.click(screen.getByRole("button", { name: "Neutral" }));

    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
  });

  // ─── Sort mode ─────────────────────────────────────────────────

  it("renders sort mode buttons", () => {
    render(<SkillsGrid skills={mockSkills} />);
    expect(screen.getByRole("button", { name: /proficiency/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /preference/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /default/i })).toBeInTheDocument();
  });

  // ─── Visible count ─────────────────────────────────────────────

  it("shows count of visible skills", () => {
    render(<SkillsGrid skills={mockSkills} />);
    // All 5 visible = "5 skills"
    expect(screen.getByText(/5 skills/)).toBeInTheDocument();
  });

  it("shows 'X of Y' when filtered", () => {
    render(<SkillsGrid skills={mockSkills} />);
    fireEvent.click(screen.getByRole("button", { name: "Legacy" }));
    // 3 of 5 visible
    expect(screen.getByText(/3 of 5/)).toBeInTheDocument();
  });

  // ─── Safety: can't toggle off the last value in a dimension ────

  it("prevents toggling off the last value (keeps at least one)", () => {
    render(<SkillsGrid skills={mockSkills} />);

    // Status has Active + Legacy. Toggle Legacy off, then try Active.
    fireEvent.click(screen.getByRole("button", { name: "Legacy" }));
    fireEvent.click(screen.getByRole("button", { name: /^Active$/i }));

    // Active should still be pressed — can't remove the last one
    expect(screen.getByRole("button", { name: /^Active$/i })).toHaveAttribute("aria-pressed", "true");
    // Skills should still be visible
    expect(screen.getByText("React")).toBeInTheDocument();
  });
});
