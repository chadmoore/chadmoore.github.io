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

// Isolate component behavior tests from content.json changes:
// mock siteConfig with projects enabled regardless of what content.json says.
jest.mock("@/lib/siteConfig", () => {
  const actual =
    jest.requireActual<typeof import("@/lib/siteConfig")>("@/lib/siteConfig");
  return {
    ...actual,
    siteConfig: {
      ...actual.siteConfig,
      sections: { ...actual.siteConfig.sections, projects: true },
    },
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

import { cvDisplayLabel, cvSlug } from "@/lib/siteConfig";

import Home from "@/app/page";

describe("Homepage", () => {
  it("renders the site name", () => {
    render(<Home />);
    expect(screen.getByText("Chad Moore")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<Home />);
    expect(
      screen.getByText("Full-stack engineer. Enterprise systems. Cloud to UI.")
    ).toBeInTheDocument();
  });

  it('renders the "About Me" CTA link', () => {
    render(<Home />);
    const aboutLink = screen.getByText("About Me");
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink.closest("a")).toHaveAttribute("href", "/about");
  });

  it(`renders the "View ${cvDisplayLabel}" CTA link`, () => {
    render(<Home />);
    const cvLink = screen.getByText(`View ${cvDisplayLabel}`);
    expect(cvLink).toBeInTheDocument();
    expect(cvLink.closest("a")).toHaveAttribute("href", `/${cvSlug}`);
  });

  it("renders the three feature cards", () => {
    render(<Home />);
    expect(screen.getByText("Enterprise Integration")).toBeInTheDocument();
    expect(screen.getByText("Secure Identity & APIs")).toBeInTheDocument();
    expect(screen.getByText("Architecture & Technical Leadership")).toBeInTheDocument();
  });

  it("renders recent blog posts section when posts exist", () => {
    render(<Home />);
    expect(screen.getByText("Recent Posts")).toBeInTheDocument();
    expect(screen.getByText("Test Post")).toBeInTheDocument();
  });

  it('renders "View Projects" link when projects section is enabled', () => {
    render(<Home />);
    expect(screen.getByText("View Projects")).toBeInTheDocument();
  });
});
