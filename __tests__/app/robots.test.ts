/**
 * Tests for src/app/robots.ts — robots.txt generation.
 */
jest.mock("@/lib/siteConfig", () => ({
  siteConfig: {
    siteUrl: "https://example.com",
    sections: { about: true, blog: true, cv: true, projects: true },
    name: "Test User",
    tagline: "A tagline",
    navOrder: [],
  },
}));

import robots from "@/app/robots";

describe("robots", () => {
  it("allows all crawlers access to all pages", () => {
    const result = robots();
    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAgent: "*", allow: "/" }),
      ])
    );
  });

  it("specifies the sitemap URL", () => {
    const result = robots();
    expect(result.sitemap).toBe("https://example.com/sitemap.xml");
  });
});
