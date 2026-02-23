/**
 * Tests for the About page component — verifies skills come from cv.json.
 */
import { render, screen } from "@testing-library/react";
import cvData from "../../content/cv.json";

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

// We need to import the component — but since it uses `Metadata` export,
// we import just the default export for rendering
import AboutPage from "@/app/about/page";

describe("AboutPage", () => {
  it("renders the About Me heading", () => {
    render(<AboutPage />);
    expect(screen.getByText("About Me")).toBeInTheDocument();
  });

  it("renders the 'What I Work With' section", () => {
    render(<AboutPage />);
    expect(screen.getByText("What I Work With")).toBeInTheDocument();
  });

  it("renders all skill categories from cv.json", () => {
    render(<AboutPage />);
    for (const category of Object.keys(cvData.skills)) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });

  it("renders all individual skills from cv.json", () => {
    render(<AboutPage />);
    const allSkills = Object.values(cvData.skills).flat();
    for (const skill of allSkills) {
      // Skills are now objects with a name property
      expect(screen.getByText(skill.name)).toBeInTheDocument();
    }
  });

  it("renders the Get In Touch section with email and LinkedIn links", () => {
    render(<AboutPage />);
    expect(screen.getByText("Get In Touch")).toBeInTheDocument();

    const emailLink = screen.getByText("email");
    expect(emailLink.closest("a")).toHaveAttribute("href", "mailto:chad@chadmoore.info");

    const linkedInLink = screen.getByText("LinkedIn");
    expect(linkedInLink.closest("a")).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/chad-moore-info"
    );
  });

  it("renders an SVG icon for each skill category", () => {
    const { container } = render(<AboutPage />);
    // Each category card has an icon (SVG) + heading. Verify SVGs exist.
    const svgs = container.querySelectorAll("svg");
    const categoryCount = Object.keys(cvData.skills).length;
    // There should be at least one SVG per category
    expect(svgs.length).toBeGreaterThanOrEqual(categoryCount);
  });

  it("renders the About intro paragraphs", () => {
    render(<AboutPage />);
    expect(
      screen.getByText(/nearly three decades/)
    ).toBeInTheDocument();
  });
});
