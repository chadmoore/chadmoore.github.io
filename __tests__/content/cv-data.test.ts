/**
 * Tests for content/cv.json — validates the CV data structure.
 *
 * TDD: These tests encode the EXPECTED state of cv.json after
 * populating it with real LinkedIn export data. Write RED first,
 * then update cv.json to make them GREEN.
 */
import cvData from "../../content/cv.json";

describe("cv.json data integrity", () => {
  it("has required top-level fields", () => {
    expect(cvData.name).toBe("Chad Moore");
    expect(cvData.headline).toBe("Senior / Staff Full‑Stack Engineer");
    expect(cvData.location).toBe("Northampton, Massachusetts, United States");
    expect(typeof cvData.summary).toBe("string");
    expect(cvData.summary.length).toBeGreaterThan(100);
  });

  it("has links with email, github, and linkedin", () => {
    expect(cvData.links.email).toBe("chad@chadmoore.info");
    expect(cvData.links.github).toBe("https://github.com/chadmoore");
    expect(cvData.links.linkedin).toBe("https://www.linkedin.com/in/chad-moore-info");
  });

  it("has specialties as an array of strings", () => {
    expect(Array.isArray(cvData.specialties)).toBe(true);
    expect(cvData.specialties.length).toBeGreaterThanOrEqual(5);
    for (const s of cvData.specialties) {
      expect(typeof s).toBe("string");
    }
  });
});

describe("cv.json experience (from LinkedIn Positions)", () => {
  it("has exactly 5 experience entries", () => {
    expect(cvData.experience).toHaveLength(5);
  });

  it("has Qlik as the most recent position", () => {
    const qlik = cvData.experience[0];
    expect(qlik.company).toBe("Qlik");
    expect(qlik.title).toBe("Senior Implementation Consultant");
    expect(qlik.startDate).toBe("2020-03");
    expect(qlik.endDate).toBe("2026-02");
    expect(qlik.location).toBe("Northampton, MA");
  });

  it("has RCN as the second position", () => {
    const rcn = cvData.experience[1];
    expect(rcn.company).toBe("RCN");
    expect(rcn.title).toBe("Application Developer");
    expect(rcn.startDate).toBe("2012-01");
    expect(rcn.endDate).toBe("2020-03");
  });

  it("has Bridgeport National Bindery as the third position", () => {
    const bnb = cvData.experience[2];
    expect(bnb.company).toBe("Bridgeport National Bindery");
    expect(bnb.title).toBe("Lead Software Developer");
    expect(bnb.startDate).toBe("2006-10");
    expect(bnb.endDate).toBe("2012-01");
  });

  it("has Mitem Corporation as the fourth position", () => {
    const mitem = cvData.experience[3];
    expect(mitem.company).toBe("Mitem Corporation");
    expect(mitem.title).toBe("Professional Services Consultant");
    expect(mitem.startDate).toBe("1999");
    expect(mitem.endDate).toBe("2006");
  });

  it("has Winthrop Technologies as the fifth position", () => {
    const winthrop = cvData.experience[4];
    expect(winthrop.company).toBe("Winthrop Technologies");
    expect(winthrop.title).toBe("Junior Consultant");
    expect(winthrop.startDate).toBe("1996");
    expect(winthrop.endDate).toBe("1998");
  });

  it("has highlights array on every experience entry", () => {
    for (const entry of cvData.experience) {
      expect(Array.isArray(entry.highlights)).toBe(true);
      expect(entry.highlights.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("has a description on every experience entry", () => {
    for (const entry of cvData.experience) {
      expect(typeof entry.description).toBe("string");
    }
  });
});

describe("cv.json skills (organized from LinkedIn Skills)", () => {
  it("has a skills object with at least 6 categories", () => {
    const categories = Object.keys(cvData.skills);
    expect(categories.length).toBeGreaterThanOrEqual(6);
  });

  it("has arrays of skill objects in each category", () => {
    for (const [, skills] of Object.entries(cvData.skills)) {
      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
      for (const skill of skills) {
        expect(typeof skill).toBe("object");
        expect(typeof skill.name).toBe("string");
        expect(["expert", "proficient", "familiar"]).toContain(
          skill.proficiency
        );
      }
    }
  });

  it("accepts optional preference and status fields with valid values", () => {
    const allSkills = Object.values(cvData.skills).flat();
    for (const skill of allSkills) {
      if (skill.preference !== undefined) {
        expect(["preferred", "neutral"]).toContain(skill.preference);
      }
      if (skill.status !== undefined) {
        expect(["active", "legacy"]).toContain(skill.status);
      }
    }
  });

  it("includes key skills from LinkedIn endorsements", () => {
    const allNames = Object.values(cvData.skills)
      .flat()
      .map((s) => s.name);
    const keySkills = [
      "JavaScript", "React", "TypeScript", "Node.js",
      "Ruby", "SQL", "Java", "C#", "Linux",
      "REST APIs", "Git", "Agile Methodologies",
    ];
    for (const skill of keySkills) {
      expect(allNames).toContain(skill);
    }
  });

  it("includes modern skills not yet endorsed but listed on LinkedIn", () => {
    const allNames = Object.values(cvData.skills)
      .flat()
      .map((s) => s.name);
    expect(allNames).toContain("Agentic AI");
    expect(allNames).toContain("SSO");
    expect(allNames).toContain("SAML");
  });

  it("has at least some preferred skills", () => {
    const allSkills = Object.values(cvData.skills).flat();
    const preferred = allSkills.filter((s) => s.preference === "preferred");
    expect(preferred.length).toBeGreaterThanOrEqual(10);
  });

  it("has at least some legacy skills", () => {
    const allSkills = Object.values(cvData.skills).flat();
    const legacy = allSkills.filter((s) => s.status === "legacy");
    expect(legacy.length).toBeGreaterThanOrEqual(5);
  });

  it("has at least some expert-level skills", () => {
    const allSkills = Object.values(cvData.skills).flat();
    const experts = allSkills.filter((s) => s.proficiency === "expert");
    expect(experts.length).toBeGreaterThanOrEqual(5);
  });
});

describe("cv.json education", () => {
  it("has an education array", () => {
    expect(Array.isArray(cvData.education)).toBe(true);
  });
});
