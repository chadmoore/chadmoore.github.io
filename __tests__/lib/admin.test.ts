/**
 * Tests for src/lib/admin.ts — content data and blog post helpers.
 *
 * TDD: RED first. These test the server-side logic for the
 * admin interface that reads and writes content files.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { execSync } from "child_process";

jest.mock("fs");
jest.mock("gray-matter");
jest.mock("child_process");
jest.mock("../../scripts/generate-cv-pdf", () => ({
  generateCvPdf: jest.fn().mockResolvedValue(undefined),
}));

import {
  readContentData,
  writeContentData,
  listBlogPosts,
  readBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  publishChanges,
  regenerateCvPdf,
} from "../../src/lib/admin";

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedMatter = matter as jest.MockedFunction<typeof matter> & {
  stringify: jest.MockedFunction<typeof matter.stringify>;
};
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

const CONTENT_PATH = path.resolve(process.cwd(), "content/content.json");
const BLOG_DIR = path.resolve(process.cwd(), "content/blog");

import type { ContentData } from "../../src/lib/contentData";

const sampleContent = {
  site: {
    name: "Chad Moore",
    tagline: "A tagline",
    sections: { about: true, projects: true, blog: true, cv: true },
    links: { email: "chad@chadmoore.info", github: "https://github.com/chadmoore", linkedin: "https://www.linkedin.com/in/chad-moore-info" },
  },
  home: { greeting: "Hi, I'm", featureCards: [] },
  about: { heading: "About Me", intro: [], skillsHeading: "Skills", contactHeading: "Contact", contactText: "" },
  blog: { heading: "Blog", description: "" },
  cv: {
    headline: "Engineer",
    location: "Northampton",
    summary: "A summary.",
    specialties: [],
    experience: [],
    education: [],
    skills: {
      Frontend: [
        { name: "React", proficiency: "expert", preference: "preferred" },
      ],
    },
    certifications: [],
  },
} as unknown as ContentData;

describe("readContentData", () => {
  it("reads and parses content.json from the content directory", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleContent));

    const data = readContentData();

    expect(fs.readFileSync).toHaveBeenCalledWith(CONTENT_PATH, "utf-8");
    expect(data).toEqual(sampleContent);
  });

  it("throws if the file cannot be read", () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("ENOENT");
    });

    expect(() => readContentData()).toThrow("ENOENT");
  });
});

describe("writeContentData", () => {
  it("writes formatted JSON to content.json", () => {
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

    writeContentData(sampleContent);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      CONTENT_PATH,
      JSON.stringify(sampleContent, null, 2) + "\n",
      "utf-8"
    );
  });

  it("throws if the file cannot be written", () => {
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("EACCES");
    });

    expect(() => writeContentData(sampleContent)).toThrow("EACCES");
  });
});

// ─── Blog Helpers ───────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe("listBlogPosts", () => {
  it("returns empty array when blog directory does not exist", () => {
    mockedFs.existsSync.mockReturnValue(false);
    expect(listBlogPosts()).toEqual([]);
  });

  it("returns posts sorted newest-first without content", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue([
      "old.md" as unknown as ReturnType<typeof fs.readdirSync>[number],
      "new.md" as unknown as ReturnType<typeof fs.readdirSync>[number],
    ]);
    mockedFs.readFileSync.mockReturnValue("frontmatter");
    mockedMatter.mockImplementation((_input) => {
      // Both calls return the same structure; we differentiate by call order
      return {
        data: { title: "Post", date: "2026-01-01", excerpt: "desc", tags: ["a"] },
        content: "body",
      } as unknown as ReturnType<typeof matter>;
    });
    // Make the second post newer
    mockedMatter
      .mockReturnValueOnce({
        data: { title: "Old", date: "2025-01-01", excerpt: "old", tags: [] },
        content: "old body",
      } as unknown as ReturnType<typeof matter>)
      .mockReturnValueOnce({
        data: { title: "New", date: "2026-02-01", excerpt: "new", tags: ["tag"] },
        content: "new body",
      } as unknown as ReturnType<typeof matter>);

    const posts = listBlogPosts();
    expect(posts).toHaveLength(2);
    expect(posts[0].title).toBe("New");
    expect(posts[0].slug).toBe("new");
    // Content should NOT be included
    expect((posts[0] as Record<string, unknown>).content).toBeUndefined();
  });
});

describe("readBlogPost", () => {
  it("returns null when post does not exist", () => {
    mockedFs.existsSync.mockReturnValue(false);
    expect(readBlogPost("nope")).toBeNull();
  });

  it("returns full post with content", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue("raw md");
    mockedMatter.mockReturnValue({
      data: { title: "Hello", date: "2026-01-01", excerpt: "hi", tags: ["a"] },
      content: "## Body",
    } as unknown as ReturnType<typeof matter>);

    const post = readBlogPost("hello");
    expect(post).not.toBeNull();
    expect(post!.slug).toBe("hello");
    expect(post!.title).toBe("Hello");
    expect(post!.content).toBe("## Body");
  });
});

describe("createBlogPost", () => {
  it("throws if slug already exists", () => {
    mockedFs.existsSync.mockReturnValue(true);
    expect(() =>
      createBlogPost({ slug: "dup", title: "Dup", date: "", excerpt: "", tags: [], content: "" }),
    ).toThrow('Post "dup" already exists');
  });

  it("creates a new .md file with frontmatter", () => {
    // existsSync: first call for BLOG_DIR (true), second for file (false)
    mockedFs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
    mockedFs.writeFileSync.mockImplementation(() => {});
    mockedMatter.stringify = jest.fn().mockReturnValue("---\ntitle: Test\n---\nbody");

    createBlogPost({ slug: "test", title: "Test", date: "2026-01-01", excerpt: "e", tags: [], content: "body" });

    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(BLOG_DIR, "test.md"),
      expect.any(String),
      "utf-8",
    );
  });
});

describe("updateBlogPost", () => {
  it("throws if post does not exist", () => {
    mockedFs.existsSync.mockReturnValue(false);
    expect(() =>
      updateBlogPost("nope", { title: "X", date: "", excerpt: "", tags: [], content: "" }),
    ).toThrow('Post "nope" not found');
  });

  it("writes updated content to existing file", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.writeFileSync.mockImplementation(() => {});
    mockedMatter.stringify = jest.fn().mockReturnValue("---\ntitle: Updated\n---\nnew body");

    updateBlogPost("hello", { title: "Updated", date: "2026-01-01", excerpt: "", tags: [], content: "new body" });

    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(BLOG_DIR, "hello.md"),
      expect.any(String),
      "utf-8",
    );
  });
});

describe("deleteBlogPost", () => {
  it("throws if post does not exist", () => {
    mockedFs.existsSync.mockReturnValue(false);
    expect(() => deleteBlogPost("nope")).toThrow('Post "nope" not found');
  });

  it("deletes the .md file", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.unlinkSync.mockImplementation(() => {});

    deleteBlogPost("old");

    expect(mockedFs.unlinkSync).toHaveBeenCalledWith(path.join(BLOG_DIR, "old.md"));
  });
});

describe("publishChanges", () => {
  beforeEach(() => {
    mockedExecSync.mockReset();
    // readContentData needs a valid JSON response for regenerateCvPdf
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ site: {}, cv: {} }));
  });

  it("pulls, then regenerates PDF, stages, commits, and pushes changes", async () => {
    mockedExecSync
      .mockReturnValueOnce("") // git pull --rebase  ← first, so we commit on top of remote
      .mockReturnValueOnce("") // git add -A
      .mockReturnValueOnce(" M content/content.json\n") // git status --porcelain
      .mockReturnValueOnce("") // git commit
      .mockReturnValueOnce("") // git push
      .mockReturnValueOnce("abc1234\n"); // git rev-parse --short HEAD

    const hash = await publishChanges("test commit");

    // Verify call order matters: pull before add before commit before push
    const calls = mockedExecSync.mock.calls.map((c) => c[0] as string);
    expect(calls[0]).toBe("git pull --rebase");
    expect(calls[1]).toBe("git add -A");
    expect(calls[2]).toBe("git status --porcelain");
    expect(calls[3]).toContain("git commit");
    expect(calls[4]).toBe("git push");
    expect(hash).toBe("abc1234");
  });

  it("returns 'no-changes' when working tree is clean", async () => {
    mockedExecSync
      .mockReturnValueOnce("") // git pull --rebase
      .mockReturnValueOnce("") // git add -A
      .mockReturnValueOnce(""); // git status --porcelain (empty)

    const hash = await publishChanges("nothing to do");

    expect(hash).toBe("no-changes");
    // Should NOT have called commit or push
    expect(mockedExecSync).toHaveBeenCalledTimes(3);
  });
});
