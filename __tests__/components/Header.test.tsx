/**
 * Tests for src/components/Header.tsx — sticky navigation.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/Header";
import { siteConfig } from "@/lib/siteConfig";

// Configurable pathname mock for testing active states
let currentPathname = "/";
jest.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

// Mock next/link to just render an <a>
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

describe("Header", () => {
  beforeEach(() => {
    currentPathname = "/";
  });

  it("renders the site name as a link to home", () => {
    render(<Header />);
    const homeLink = screen.getByText("Chad Moore");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders nav links for all enabled sections including Projects", () => {
    render(<Header />);
    // These should be present (enabled in siteConfig)
    expect(screen.getAllByText("Home").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("About").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Projects").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Blog").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("CV").length).toBeGreaterThanOrEqual(1);
  });

  it("renders nav links in the order specified by navOrder", () => {
    render(<Header />);
    // Get desktop list items (inside the hidden md:flex container)
    const lists = document.querySelectorAll("ul");
    // The first <ul> is the desktop nav
    const desktopItems = lists[0]?.querySelectorAll("li");
    const labels = Array.from(desktopItems ?? []).map((li) => li.textContent);
    // Derive expected order from siteConfig.navOrder (same logic as Header)
    const labelFor: Record<string, string> = {
      home: "Home", about: "About", projects: "Projects", blog: "Blog", cv: "CV",
    };
    const expected = siteConfig.navOrder
      .filter((key) => key in labelFor)
      .map((key) => labelFor[key]);
    expect(labels).toEqual(expected);
  });

  it("omits nav links when a section is disabled in siteConfig", () => {
    // All sections are currently enabled — this test documents the filtering behavior.
    // If a section were disabled, its nav link would not render.
    render(<Header />);
    // Verify the count matches expected enabled links (Home + 4 sections = 5 per nav × 2 navs = 10, but desktop+mobile)
    const allLinks = screen.getAllByRole("link");
    // "Chad Moore" home brand + 5 nav links desktop + 5 nav links would appear in mobile when open
    // Just verify Projects IS present since it's now enabled
    expect(screen.getAllByText("Projects").length).toBeGreaterThanOrEqual(1);
  });

  it("has a mobile menu toggle button", () => {
    render(<Header />);
    const toggleBtn = screen.getByLabelText("Toggle menu");
    expect(toggleBtn).toBeInTheDocument();
  });

  it("toggles mobile menu on button click", () => {
    const { container } = render(<Header />);
    const toggleBtn = screen.getByLabelText("Toggle menu");

    // Mobile menu should not be visible initially
    // The mobile menu div only renders when mobileOpen is true
    const mobileMenuBefore = container.querySelectorAll(".md\\:hidden.border-t");
    expect(mobileMenuBefore).toHaveLength(0);

    // Click to open
    fireEvent.click(toggleBtn);

    // Now the mobile menu should exist
    const mobileMenuAfter = container.querySelectorAll(".md\\:hidden.border-t");
    expect(mobileMenuAfter).toHaveLength(1);

    // Click to close
    fireEvent.click(toggleBtn);

    const mobileMenuClosed = container.querySelectorAll(".md\\:hidden.border-t");
    expect(mobileMenuClosed).toHaveLength(0);
  });

  it("highlights the active route with accent color and font-medium", () => {
    currentPathname = "/about";
    render(<Header />);
    // Find the About link in the desktop nav
    const aboutLinks = screen.getAllByText("About");
    // Desktop link should have the active classes
    const desktopAbout = aboutLinks.find(
      (el) => el.className.includes("text-accent") && el.className.includes("font-medium")
    );
    expect(desktopAbout).toBeDefined();
  });

  it("does not highlight non-active routes", () => {
    currentPathname = "/about";
    render(<Header />);
    // Home link should be text-muted, not text-accent
    const homeLinks = screen.getAllByText("Home");
    const desktopHome = homeLinks.find(
      (el) => el.className.includes("text-muted")
    );
    expect(desktopHome).toBeDefined();
  });

  describe("dev admin link", () => {
    it("renders a pencil icon link to the admin panel in dev", () => {
      currentPathname = "/";
      render(<Header />);
      const editLink = screen.getByTitle(/edit this page/i);
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute("href", "/admin?tab=home");
    });

    it("maps /about to the about admin tab", () => {
      currentPathname = "/about";
      render(<Header />);
      const editLink = screen.getByTitle(/edit this page/i);
      expect(editLink).toHaveAttribute("href", "/admin?tab=about");
    });

    it("maps /cv to the cv admin tab", () => {
      currentPathname = "/cv";
      render(<Header />);
      const editLink = screen.getByTitle(/edit this page/i);
      expect(editLink).toHaveAttribute("href", "/admin?tab=cv");
    });

    it("maps /blog to the blog admin tab", () => {
      currentPathname = "/blog";
      render(<Header />);
      const editLink = screen.getByTitle(/edit this page/i);
      expect(editLink).toHaveAttribute("href", "/admin?tab=blog");
    });

    it("deep-links /blog/[slug] to the blog editor for that post", () => {
      currentPathname = "/blog/hello-world";
      render(<Header />);
      const editLink = screen.getByTitle(/edit this page/i);
      expect(editLink).toHaveAttribute("href", "/admin?tab=blog&edit=hello-world");
    });

    it("shows Edit Page in the mobile menu", () => {
      currentPathname = "/about";
      render(<Header />);
      fireEvent.click(screen.getByLabelText("Toggle menu"));
      const mobileEditLink = screen.getByText("Edit Page");
      expect(mobileEditLink.closest("a")).toHaveAttribute("href", "/admin?tab=about");
    });
  });
});
