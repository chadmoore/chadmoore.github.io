/**
 * Tests for src/app/blog/page.tsx — blog index page.
 */
import { render, screen } from "@testing-library/react";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock blog module
jest.mock("@/lib/blog");
import { getAllPosts } from "@/lib/blog";
const mockedGetAllPosts = getAllPosts as jest.MockedFunction<typeof getAllPosts>;

import BlogPage from "@/app/blog/page";

describe("BlogPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Blog heading", () => {
    mockedGetAllPosts.mockReturnValue([]);
    render(<BlogPage />);
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("renders the page description", () => {
    mockedGetAllPosts.mockReturnValue([]);
    render(<BlogPage />);
    expect(
      screen.getByText("Thoughts on software, data, and building things.")
    ).toBeInTheDocument();
  });

  it("shows empty state when no posts exist", () => {
    mockedGetAllPosts.mockReturnValue([]);
    render(<BlogPage />);
    expect(
      screen.getByText("No posts yet. Check back soon!")
    ).toBeInTheDocument();
  });

  it("renders posts with titles and excerpts", () => {
    mockedGetAllPosts.mockReturnValue([
      {
        slug: "test-post",
        title: "Test Post Title",
        date: "2026-02-20",
        excerpt: "This is a test excerpt.",
        content: "Full content here",
        tags: [],
      },
    ]);

    render(<BlogPage />);
    expect(screen.getByText("Test Post Title")).toBeInTheDocument();
    expect(screen.getByText("This is a test excerpt.")).toBeInTheDocument();
  });

  it("links each post to its slug URL", () => {
    mockedGetAllPosts.mockReturnValue([
      {
        slug: "my-post",
        title: "My Post",
        date: "2026-01-15",
        excerpt: "Excerpt",
        content: "Content",
        tags: [],
      },
    ]);

    render(<BlogPage />);
    const link = screen.getByText("My Post").closest("a");
    expect(link).toHaveAttribute("href", "/blog/my-post");
  });

  it("renders tags as pills when present", () => {
    mockedGetAllPosts.mockReturnValue([
      {
        slug: "tagged-post",
        title: "Tagged Post",
        date: "2026-01-10",
        excerpt: "Excerpt",
        content: "Content",
        tags: ["react", "typescript"],
      },
    ]);

    render(<BlogPage />);
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("renders multiple posts", () => {
    mockedGetAllPosts.mockReturnValue([
      {
        slug: "post-1",
        title: "First Post",
        date: "2026-02-20",
        excerpt: "Excerpt 1",
        content: "Content 1",
        tags: [],
      },
      {
        slug: "post-2",
        title: "Second Post",
        date: "2026-02-15",
        excerpt: "Excerpt 2",
        content: "Content 2",
        tags: [],
      },
    ]);

    render(<BlogPage />);
    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
  });

  it("formats dates consistently in Month DD, YYYY format", () => {
    mockedGetAllPosts.mockReturnValue([
      {
        slug: "dated-post",
        title: "Dated Post",
        date: "2026-02-23T12:00:00",
        excerpt: "Excerpt",
        content: "Content",
        tags: [],
      },
    ]);

    render(<BlogPage />);
    // Should display in "Month DD, YYYY" format (using noon to avoid timezone edge)
    expect(screen.getByText(/Feb 23, 2026/)).toBeInTheDocument();
  });
});
