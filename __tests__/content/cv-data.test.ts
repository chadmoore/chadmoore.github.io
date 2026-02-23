/**
 * Tests for content/cv.json — validates the CV data structure.
 *
 * These tests ensure the JSON schema is correct so that the CV page
 * and About page don't crash due to missing or malformed data.
 */
import cvData from "../../content/cv.json";

describe("cv.json data integrity", () => {
  it("has required top-level fields", () => {
    expect(cvData.name).toBeDefined();
    expect(typeof cvData.name).toBe("string");
    expect(cvData.headline).toBeDefined();
    expect(cvData.summary).toBeDefined();
  });

  it("has a skills object with at least one category", () => {
    expect(typeof cvData.skills).toBe("object");
    const categories = Object.keys(cvData.skills);
    expect(categories.length).toBeGreaterThan(0);
  });

  it("has arrays of strings in each skill category", () => {
    for (const [category, skills] of Object.entries(cvData.skills)) {
      expect(Array.isArray(skills)).toBe(true);
      for (const skill of skills) {
        expect(typeof skill).toBe("string");
      }
    }
  });

  it("has an experience array", () => {
    expect(Array.isArray(cvData.experience)).toBe(true);
  });

  it("has experience entries with required fields", () => {
    for (const entry of cvData.experience) {
      expect(entry.title).toBeDefined();
      expect(entry.company).toBeDefined();
      expect(entry.startDate).toBeDefined();
      // endDate can be null (current position)
      expect("endDate" in entry).toBe(true);
    }
  });

  it("has an education array", () => {
    expect(Array.isArray(cvData.education)).toBe(true);
  });

  it("has links with email, github, and linkedin", () => {
    expect(cvData.links).toBeDefined();
    expect(cvData.links.email).toContain("@");
    expect(cvData.links.github).toContain("github.com");
    expect(cvData.links.linkedin).toContain("linkedin.com");
  });

  it("has specialties as an array of strings", () => {
    expect(Array.isArray(cvData.specialties)).toBe(true);
    for (const s of cvData.specialties) {
      expect(typeof s).toBe("string");
    }
  });
});
