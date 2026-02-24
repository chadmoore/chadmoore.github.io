/**
 * Tests for content/content.json — validates the consolidated content structure.
 *
 * TDD: These tests encode the EXPECTED state of content.json after
 * populating it with real data. Write RED first,
 * then update content.json to make them GREEN.
 */
import rawContent from "../../content/content.json";

interface CvSkill {
  name: string;
  proficiency: string;
  preference?: string;
  status?: string;
}

interface CvHighlight {
  text: string;
  skills: string[];
}

interface CvExperience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: CvHighlight[];
}

interface CvSection {
  headline: string;
  location: string;
  summary: string;
  specialties: string[];
  experience: CvExperience[];
  education: Array<{ degree: string; institution: string; location?: string }>;
  skills: Record<string, CvSkill[]>;
  certifications: unknown[];
}

interface SiteSection {
  name: string;
  tagline: string;
  sections: Record<string, boolean>;
  links: { email: string; github: string; linkedin: string };
}

interface ContentData {
  site: SiteSection;
  home: unknown;
  about: unknown;
  blog: unknown;
  cv: CvSection;
}

const content = rawContent as unknown as ContentData;
const siteData = content.site;
const cvData = content.cv;

describe("content.json top-level structure", () => {
  it("has all required top-level sections", () => {
    expect(content.site).toBeDefined();
    expect(content.home).toBeDefined();
    expect(content.about).toBeDefined();
    expect(content.blog).toBeDefined();
    expect(content.cv).toBeDefined();
  });
});

describe("content.json site data", () => {
  it("has name and tagline", () => {
    expect(siteData.name).toBe("Chad Moore");
    expect(typeof siteData.tagline).toBe("string");
    expect(siteData.tagline.length).toBeGreaterThan(0);
  });

  it("has links with email, github, and linkedin", () => {
    expect(siteData.links.email).toBe("chad@chadmoore.info");
    expect(siteData.links.github).toBe("https://github.com/chadmoore");
    expect(siteData.links.linkedin).toBe("https://www.linkedin.com/in/chad-moore-info");
  });
});

describe("content.json CV data integrity", () => {
  it("has required CV fields", () => {
    expect(cvData.headline).toBe("Senior / Staff Full‑Stack Engineer");
    expect(cvData.location).toBe("Northampton, Massachusetts, United States");
    expect(typeof cvData.summary).toBe("string");
    expect(cvData.summary.length).toBeGreaterThan(100);
  });

  it("has specialties as an array of strings", () => {
    expect(Array.isArray(cvData.specialties)).toBe(true);
    expect(cvData.specialties.length).toBeGreaterThanOrEqual(5);
    for (const s of cvData.specialties) {
      expect(typeof s).toBe("string");
    }
  });
});

describe("content.json experience (from LinkedIn Positions)", () => {
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

  it("has highlights array of objects on every experience entry", () => {
    for (const entry of cvData.experience) {
      expect(Array.isArray(entry.highlights)).toBe(true);
      expect(entry.highlights.length).toBeGreaterThanOrEqual(1);
      for (const h of entry.highlights) {
        expect(typeof h).toBe("object");
        expect(typeof h.text).toBe("string");
        expect(h.text.length).toBeGreaterThan(0);
        expect(Array.isArray(h.skills)).toBe(true);
      }
    }
  });

  it("has only valid skill names in highlight tags", () => {
    const allNames = new Set(
      Object.values(cvData.skills)
        .flat()
        .map((s) => s.name)
    );
    for (const entry of cvData.experience) {
      for (const h of entry.highlights) {
        for (const skill of h.skills) {
          expect(allNames).toContain(skill);
        }
      }
    }
  });

  it("has a description on every experience entry", () => {
    for (const entry of cvData.experience) {
      expect(typeof entry.description).toBe("string");
    }
  });
});

describe("content.json skills (organized from LinkedIn Skills)", () => {
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

describe("content.json education", () => {
  it("has an education array", () => {
    expect(Array.isArray(cvData.education)).toBe(true);
  });
});
