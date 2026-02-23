/**
 * Tests for the Homepage component.
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

// Mock the blog module to avoid filesystem access
jest.mock("@/lib/blog", () => ({
  getAllPosts: () => [
    {
      slug: "test-post",
      title: "Test Post",
      date: "2026-02-23",
      excerpt: "A test excerpt.",
      content: "Test content",
      tags: ["test"],
    },
  ],
}));

import Home from "@/app/page";

describe("Homepage", () => {
  it("renders the site name", () => {
    render(<Home />);
    expect(screen.getByText("Chad Moore")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<Home />);
    expect(
      screen.getByText("Creative Data Driven Full Stack Software")
    ).toBeInTheDocument();
  });

  it('renders the "About Me" CTA link', () => {
    render(<Home />);
    const aboutLink = screen.getByText("About Me");
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink.closest("a")).toHaveAttribute("href", "/about");
  });

  it('renders the "View CV" CTA link', () => {
    render(<Home />);
    const cvLink = screen.getByText("View CV");
    expect(cvLink).toBeInTheDocument();
    expect(cvLink.closest("a")).toHaveAttribute("href", "/cv");
  });

  it("renders the three feature cards", () => {
    render(<Home />);
    expect(screen.getByText("Full Stack Development")).toBeInTheDocument();
    expect(screen.getByText("Data Driven")).toBeInTheDocument();
    expect(screen.getByText("Creative Solutions")).toBeInTheDocument();
  });

  it("renders recent blog posts section when posts exist", () => {
    render(<Home />);
    expect(screen.getByText("Recent Posts")).toBeInTheDocument();
    expect(screen.getByText("Test Post")).toBeInTheDocument();
  });

  it('does not render "View Projects" when projects section is disabled', () => {
    render(<Home />);
    expect(screen.queryByText("View Projects")).not.toBeInTheDocument();
  });
});
