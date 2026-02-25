/**
 * Tests for src/lib/blog.ts — the blog engine.
 *
 * Uses mock filesystem to avoid depending on real content files.
 */
import path from "path";

// We need to mock `fs` and `gray-matter` before importing the module
jest.mock("fs");
jest.mock("gray-matter");

import fs from "fs";
import matter from "gray-matter";
import { getAllPosts, getPostBySlug, resolveWikiLinks } from "@/lib/blog";

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedMatter = matter as jest.MockedFunction<typeof matter>;

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getAllPosts", () => {
  it("returns an empty array when the content directory does not exist", () => {
    mockedFs.existsSync.mockReturnValue(false);

    const posts = getAllPosts();

    expect(posts).toEqual([]);
    expect(mockedFs.existsSync).toHaveBeenCalledWith(POSTS_DIR);
  });

  it("returns posts sorted newest-first", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue([
      "old-post.md" as unknown as ReturnType<typeof fs.readdirSync>[number],
      "new-post.md" as unknown as ReturnType<typeof fs.readdirSync>[number],
      "ignore.txt" as unknown as ReturnType<typeof fs.readdirSync>[number],
    ]);
    mockedFs.readFileSync.mockImplementation((filePath) => {
      const name = path.basename(filePath as string);
      if (name === "old-post.md") return "---\ntitle: Old\ndate: 2025-01-01\n---\nOld content";
      if (name === "new-post.md") return "---\ntitle: New\ndate: 2026-02-01\n---\nNew content";
      return "";
    });
    mockedMatter.mockImplementation((input) => {
      const str = input.toString();
      if (str.includes("Old")) {
        return { data: { title: "Old", date: "2025-01-01" }, content: "Old content" } as unknown as ReturnType<typeof matter>;
      }
      return { data: { title: "New", date: "2026-02-01" }, content: "New content" } as unknown as ReturnType<typeof matter>;
    });

    const posts = getAllPosts();

    expect(posts).toHaveLength(2);
    expect(posts[0].title).toBe("New");
    expect(posts[1].title).toBe("Old");
  });

  it("filters out non-.md files", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue([
      "post.md" as unknown as ReturnType<typeof fs.readdirSync>[number],
      "readme.txt" as unknown as ReturnType<typeof fs.readdirSync>[number],
      ".DS_Store" as unknown as ReturnType<typeof fs.readdirSync>[number],
    ]);
    mockedFs.readFileSync.mockReturnValue("---\ntitle: Post\ndate: 2026-01-01\n---\nContent");
    mockedMatter.mockReturnValue({
      data: { title: "Post", date: "2026-01-01" },
      content: "Content",
    } as unknown as ReturnType<typeof matter>);

    const posts = getAllPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("post");
  });

  it("falls back to slug when title is missing from frontmatter", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue([
      "no-title.md" as unknown as ReturnType<typeof fs.readdirSync>[number],
    ]);
    mockedFs.readFileSync.mockReturnValue("---\ndate: 2026-01-01\n---\nSome content");
    mockedMatter.mockReturnValue({
      data: { date: "2026-01-01" },
      content: "Some content",
    } as unknown as ReturnType<typeof matter>);

    const posts = getAllPosts();

    expect(posts[0].title).toBe("no-title");
  });

  it("auto-generates excerpt when not in frontmatter", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue([
      "post.md" as unknown as ReturnType<typeof fs.readdirSync>[number],
    ]);
    const longContent = "A".repeat(200);
    mockedFs.readFileSync.mockReturnValue(`---\ntitle: Post\ndate: 2026-01-01\n---\n${longContent}`);
    mockedMatter.mockReturnValue({
      data: { title: "Post", date: "2026-01-01" },
      content: longContent,
    } as unknown as ReturnType<typeof matter>);

    const posts = getAllPosts();

    expect(posts[0].excerpt).toBe("A".repeat(160) + "...");
  });

  it("defaults tags to an empty array when not in frontmatter", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue([
      "no-tags.md" as unknown as ReturnType<typeof fs.readdirSync>[number],
    ]);
    mockedFs.readFileSync.mockReturnValue("---\ntitle: No Tags\ndate: 2026-01-01\n---\nContent");
    mockedMatter.mockReturnValue({
      data: { title: "No Tags", date: "2026-01-01" },
      content: "Content",
    } as unknown as ReturnType<typeof matter>);

    const posts = getAllPosts();

    expect(posts[0].tags).toEqual([]);
  });

  it("defaults date to empty string when not in frontmatter", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue([
      "no-date.md" as unknown as ReturnType<typeof fs.readdirSync>[number],
    ]);
    mockedFs.readFileSync.mockReturnValue("---\ntitle: No Date\n---\nContent");
    mockedMatter.mockReturnValue({
      data: { title: "No Date" },
      content: "Content",
    } as unknown as ReturnType<typeof matter>);

    const posts = getAllPosts();

    expect(posts[0].date).toBe("");
  });
});

describe("getPostBySlug", () => {
  it("returns null for a non-existent slug", () => {
    mockedFs.existsSync.mockReturnValue(false);

    const post = getPostBySlug("does-not-exist");

    expect(post).toBeNull();
  });

  it("returns the correct post for an existing slug", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue("---\ntitle: Hello\ndate: 2026-02-23\ntags:\n  - test\n---\nHello world");
    mockedMatter.mockReturnValue({
      data: { title: "Hello", date: "2026-02-23", tags: ["test"] },
      content: "Hello world",
    } as unknown as ReturnType<typeof matter>);

    const post = getPostBySlug("hello-world");

    expect(post).not.toBeNull();
    expect(post!.slug).toBe("hello-world");
    expect(post!.title).toBe("Hello");
    expect(post!.tags).toEqual(["test"]);
    expect(post!.content).toBe("Hello world");
  });
});

describe("resolveWikiLinks", () => {
  const titleMap = new Map([
    ["hello-world", "Hello World!"],
    ["second-post", "My Second Post"],
  ]);

  it("returns content unchanged when no wiki-links are present", () => {
    const content = "Just a normal paragraph with no links.";
    expect(resolveWikiLinks(content, titleMap)).toBe(content);
  });

  it("resolves [[slug]] to a markdown link with the post title", () => {
    const result = resolveWikiLinks("Check out [[hello-world]] for more.", titleMap);
    expect(result).toBe("Check out [Hello World!](/blog/hello-world) for more.");
  });

  it("resolves [[slug|custom text]] to a markdown link with custom text", () => {
    const result = resolveWikiLinks("See [[hello-world|my first post]] here.", titleMap);
    expect(result).toBe("See [my first post](/blog/hello-world) here.");
  });

  it("falls back to the slug when the target post does not exist", () => {
    const result = resolveWikiLinks("Link to [[unknown-post]] here.", titleMap);
    expect(result).toBe("Link to [unknown-post](/blog/unknown-post) here.");
  });

  it("handles multiple wiki-links in one string", () => {
    const result = resolveWikiLinks("Read [[hello-world]] and [[second-post]].", titleMap);
    expect(result).toBe("Read [Hello World!](/blog/hello-world) and [My Second Post](/blog/second-post).");
  });

  it("trims whitespace in slugs and custom text", () => {
    const result = resolveWikiLinks("See [[ hello-world | a post ]] here.", titleMap);
    expect(result).toBe("See [a post](/blog/hello-world) here.");
  });

  it("does not resolve wiki-links inside inline code spans", () => {
    const result = resolveWikiLinks("Use `[[hello-world]]` to link.", titleMap);
    expect(result).toBe("Use `[[hello-world]]` to link.");
  });

  it("does not resolve wiki-links inside fenced code blocks", () => {
    const content = "Before\n```\n[[hello-world]]\n```\nAfter [[second-post]]";
    const result = resolveWikiLinks(content, titleMap);
    expect(result).toBe("Before\n```\n[[hello-world]]\n```\nAfter [My Second Post](/blog/second-post)");
  });

  it("handles inline code and wiki-links in the same line", () => {
    const content = "Use `[[slug]]` syntax to link to [[hello-world]].";
    const result = resolveWikiLinks(content, titleMap);
    expect(result).toBe("Use `[[slug]]` syntax to link to [Hello World!](/blog/hello-world).");
  });
});
