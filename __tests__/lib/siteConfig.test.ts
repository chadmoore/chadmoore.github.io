/**
 * Tests for src/lib/siteConfig.ts — site configuration.
 */
import { siteConfig } from "@/lib/siteConfig";

describe("siteConfig", () => {
  it("exports a name string", () => {
    expect(typeof siteConfig.name).toBe("string");
    expect(siteConfig.name.length).toBeGreaterThan(0);
  });

  it("exports a tagline string", () => {
    expect(typeof siteConfig.tagline).toBe("string");
    expect(siteConfig.tagline.length).toBeGreaterThan(0);
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

  it("has consistent current values", () => {
    // These reflect the intended production config
    expect(siteConfig.sections.about).toBe(true);
    expect(siteConfig.sections.projects).toBe(false);
    expect(siteConfig.sections.blog).toBe(true);
    expect(siteConfig.sections.cv).toBe(true);
  });

  it("has the expected shape", () => {
    // siteConfig is derived from content.json, verify its shape is complete
    expect(Object.keys(siteConfig)).toEqual(
      expect.arrayContaining(["name", "tagline", "sections"])
    );
  });
});
