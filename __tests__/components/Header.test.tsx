/**
 * Tests for src/components/Header.tsx — sticky navigation.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/Header";

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

  it("renders nav links for enabled sections", () => {
    render(<Header />);
    // These should be present (enabled in siteConfig)
    expect(screen.getAllByText("Home").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("About").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Blog").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("CV").length).toBeGreaterThanOrEqual(1);
  });

  it("does not render nav links for disabled sections", () => {
    render(<Header />);
    // Projects is disabled in siteConfig
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
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
});
