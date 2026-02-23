/**
 * Tests for src/lib/skills.ts — skill type helpers.
 *
 * TDD: RED first. These test helper functions that don't exist yet.
 */
import {
  resolveSkill,
  sortSkills,
  getSkillClasses,
  type Skill,
  type ResolvedSkill,
} from "../../src/lib/skills";

describe("resolveSkill", () => {
  it("fills in default preference and status when omitted", () => {
    const skill: Skill = { name: "React", proficiency: "expert" };
    const resolved = resolveSkill(skill);
    expect(resolved).toEqual({
      name: "React",
      proficiency: "expert",
      preference: "neutral",
      status: "active",
    });
  });

  it("preserves explicit preference and status", () => {
    const skill: Skill = {
      name: "AngularJS",
      proficiency: "proficient",
      preference: "neutral",
      status: "legacy",
    };
    const resolved = resolveSkill(skill);
    expect(resolved).toEqual({
      name: "AngularJS",
      proficiency: "proficient",
      preference: "neutral",
      status: "legacy",
    });
  });

  it("preserves preferred preference", () => {
    const skill: Skill = {
      name: "TypeScript",
      proficiency: "expert",
      preference: "preferred",
    };
    const resolved = resolveSkill(skill);
    expect(resolved.preference).toBe("preferred");
    expect(resolved.status).toBe("active");
  });
});

describe("sortSkills", () => {
  it("sorts preferred skills before neutral", () => {
    const skills: Skill[] = [
      { name: "CSS", proficiency: "proficient" },
      { name: "React", proficiency: "expert", preference: "preferred" },
    ];
    const sorted = sortSkills(skills);
    expect(sorted[0].name).toBe("React");
    expect(sorted[1].name).toBe("CSS");
  });

  it("sorts by proficiency within same preference (expert > proficient > familiar)", () => {
    const skills: Skill[] = [
      { name: "Kubernetes", proficiency: "familiar", preference: "preferred" },
      { name: "React", proficiency: "expert", preference: "preferred" },
      { name: "Next.js", proficiency: "proficient", preference: "preferred" },
    ];
    const sorted = sortSkills(skills);
    expect(sorted.map((s) => s.name)).toEqual([
      "React",
      "Next.js",
      "Kubernetes",
    ]);
  });

  it("sorts legacy skills after active skills", () => {
    const skills: Skill[] = [
      { name: "AngularJS", proficiency: "proficient", status: "legacy" },
      { name: "CSS", proficiency: "proficient" },
    ];
    const sorted = sortSkills(skills);
    expect(sorted[0].name).toBe("CSS");
    expect(sorted[1].name).toBe("AngularJS");
  });

  it("combines all three dimensions correctly", () => {
    const skills: Skill[] = [
      { name: "PHP", proficiency: "familiar", status: "legacy" },
      { name: "CSS", proficiency: "proficient" },
      { name: "React", proficiency: "expert", preference: "preferred" },
      { name: "AngularJS", proficiency: "proficient", status: "legacy" },
    ];
    const sorted = sortSkills(skills);
    // preferred+expert+active first, then neutral+active, then legacy
    expect(sorted.map((s) => s.name)).toEqual([
      "React",
      "CSS",
      "AngularJS",
      "PHP",
    ]);
  });
});

describe("getSkillClasses", () => {
  it("returns accent classes for preferred skills", () => {
    const resolved: ResolvedSkill = {
      name: "React",
      proficiency: "expert",
      preference: "preferred",
      status: "active",
    };
    const classes = getSkillClasses(resolved);
    expect(classes).toContain("border-accent/60");
  });

  it("returns muted classes for legacy skills", () => {
    const resolved: ResolvedSkill = {
      name: "PHP",
      proficiency: "familiar",
      preference: "neutral",
      status: "legacy",
    };
    const classes = getSkillClasses(resolved);
    expect(classes).toContain("opacity-60");
  });

  it("returns base classes for neutral active skills", () => {
    const resolved: ResolvedSkill = {
      name: "SQL",
      proficiency: "expert",
      preference: "neutral",
      status: "active",
    };
    const classes = getSkillClasses(resolved);
    expect(classes).toContain("border-border");
    expect(classes).not.toContain("opacity-60");
    expect(classes).not.toContain("border-accent/60");
  });

  it("returns font-semibold for expert proficiency", () => {
    const resolved: ResolvedSkill = {
      name: "React",
      proficiency: "expert",
      preference: "preferred",
      status: "active",
    };
    const classes = getSkillClasses(resolved);
    expect(classes).toContain("font-semibold");
  });

  it("does not return font-semibold for proficient or familiar", () => {
    const proficient: ResolvedSkill = {
      name: "Docker",
      proficiency: "proficient",
      preference: "preferred",
      status: "active",
    };
    expect(getSkillClasses(proficient)).not.toContain("font-semibold");

    const familiar: ResolvedSkill = {
      name: "PHP",
      proficiency: "familiar",
      preference: "neutral",
      status: "legacy",
    };
    expect(getSkillClasses(familiar)).not.toContain("font-semibold");
  });
});
