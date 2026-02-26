/**
 * Tests for src/lib/siteConfig.ts — site configuration.
 */
import { siteConfig, cvSlug, cvDisplayLabel } from "@/lib/siteConfig";

describe("siteConfig", () => {
  it("exports a name string", () => {
    expect(typeof siteConfig.name).toBe("string");
    expect(siteConfig.name.length).toBeGreaterThan(0);
  });

  it("exports a tagline string", () => {
    expect(typeof siteConfig.tagline).toBe("string");
    expect(siteConfig.tagline.length).toBeGreaterThan(0);
  });

  it("exports a siteUrl pointing to the canonical domain", () => {
    expect(typeof siteConfig.siteUrl).toBe("string");
    expect(siteConfig.siteUrl).toMatch(/^https?:\/\//);
  });

  it("has a sections object with boolean values", () => {
    expect(siteConfig.sections).toBeDefined();
    const keys = Object.keys(siteConfig.sections);
    expect(keys).toContain("about");
    expect(keys).toContain("projects");
    expect(keys).toContain("blog");
    expect(keys).toContain("cv");

    for (const key of keys) {
      expect(typeof siteConfig.sections[key as keyof typeof siteConfig.sections]).toBe("boolean");
    }
  });

  // Note: specific section on/off values are NOT tested here because they are
  // user-editable admin panel decisions — not invariants of the code itself.
  // Component tests (Header, Home) mock siteConfig to test conditional
  // rendering behavior independently of what content.json currently says.

  it("has the expected shape", () => {
    // siteConfig is derived from content.json, verify its shape is complete
    expect(Object.keys(siteConfig)).toEqual(
      expect.arrayContaining(["name", "tagline", "sections"])
    );
  });
});

describe("cvSlug", () => {
  it("is 'resume' or 'cv'", () => {
    expect(["resume", "cv"]).toContain(cvSlug);
  });
});

describe("cvDisplayLabel", () => {
  it("is 'Resume' or 'CV' matching the slug", () => {
    expect(["Resume", "CV"]).toContain(cvDisplayLabel);
    if (cvSlug === "cv") {
      expect(cvDisplayLabel).toBe("CV");
    } else {
      expect(cvDisplayLabel).toBe("Resume");
    }
  });
});
