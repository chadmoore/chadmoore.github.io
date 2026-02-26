/**
 * Tests for src/app/sitemap.ts — sitemap generation.
 */
jest.mock("@/lib/blog");
jest.mock("@/lib/siteConfig", () => ({
  siteConfig: {
    siteUrl: "https://example.com",
    sections: { about: true, blog: true, cv: true, projects: true },
    name: "Test User",
    tagline: "A tagline",
    navOrder: [],
  },
  cvSlug: "resume",
}));

import sitemap from "@/app/sitemap";
import { getAllPosts } from "@/lib/blog";

const mockedGetAllPosts = getAllPosts as jest.MockedFunction<typeof getAllPosts>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetAllPosts.mockReturnValue([]);
});

describe("sitemap", () => {
  it("returns an array of sitemap entries", () => {
    const result = sitemap();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("includes the homepage with highest priority", () => {
    const result = sitemap();
    const home = result.find((e) => e.url === "https://example.com");
    expect(home).toBeDefined();
    expect(home?.priority).toBe(1.0);
  });

  it("includes all enabled section pages", () => {
    const result = sitemap();
    const urls = result.map((e) => e.url);
    expect(urls).toContain("https://example.com/about");
    expect(urls).toContain("https://example.com/blog");
    expect(urls).toContain("https://example.com/resume");
    expect(urls).toContain("https://example.com/projects");
  });

  it("includes blog post URLs derived from getAllPosts", () => {
    mockedGetAllPosts.mockReturnValue([
      {
        slug: "hello-world",
        title: "Hello World",
        date: "2026-01-01",
        excerpt: "An excerpt",
        content: "# Content",
        tags: [],
      },
    ]);
    const result = sitemap();
    const urls = result.map((e) => e.url);
    expect(urls).toContain("https://example.com/blog/hello-world");
  });
});
