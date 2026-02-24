/**
 * Tests for src/lib/admin.ts — CV data and blog post helpers.
 *
 * TDD: RED first. These test the server-side logic for the
 * admin interface that reads and writes content files.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";

jest.mock("fs");
jest.mock("gray-matter");

import {
  readCvData,
  writeCvData,
  listBlogPosts,
  readBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../../src/lib/admin";

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedMatter = matter as jest.MockedFunction<typeof matter> & {
  stringify: jest.MockedFunction<typeof matter.stringify>;
};

const CV_PATH = path.resolve(process.cwd(), "content/cv.json");
const BLOG_DIR = path.resolve(process.cwd(), "content/blog");

const sampleCv = {
  name: "Chad Moore",
  skills: {
    Frontend: [
      { name: "React", proficiency: "expert", preference: "preferred" },
    ],
  },
};

describe("readCvData", () => {
  it("reads and parses cv.json from the content directory", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleCv));

    const data = readCvData();

    expect(fs.readFileSync).toHaveBeenCalledWith(CV_PATH, "utf-8");
    expect(data).toEqual(sampleCv);
  });

  it("throws if the file cannot be read", () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("ENOENT");
    });

    expect(() => readCvData()).toThrow("ENOENT");
  });
});

describe("writeCvData", () => {
  it("writes formatted JSON to cv.json", () => {
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

    writeCvData(sampleCv);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      CV_PATH,
      JSON.stringify(sampleCv, null, 2) + "\n",
      "utf-8"
    );
  });

  it("throws if the file cannot be written", () => {
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("EACCES");
    });

    expect(() => writeCvData(sampleCv)).toThrow("EACCES");
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
    mockedMatter.mockImplementation((input: string | Buffer) => {
      // Both calls return the same structure; we differentiate by call order
      return {
        data: { title: "Post", date: "2026-01-01", excerpt: "desc", tags: ["a"] },
        content: "body",
      } as ReturnType<typeof matter>;
    });
    // Make the second post newer
    mockedMatter
      .mockReturnValueOnce({
        data: { title: "Old", date: "2025-01-01", excerpt: "old", tags: [] },
        content: "old body",
      } as ReturnType<typeof matter>)
      .mockReturnValueOnce({
        data: { title: "New", date: "2026-02-01", excerpt: "new", tags: ["tag"] },
        content: "new body",
      } as ReturnType<typeof matter>);

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
    } as ReturnType<typeof matter>);

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
