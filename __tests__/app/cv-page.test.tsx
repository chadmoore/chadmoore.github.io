/**
 * Tests for src/app/cv/page.tsx — CV page rendering.
 *
 * Verifies all sections render from cv.json data.
 */
import { render, screen } from "@testing-library/react";
import cvData from "../../content/cv.json";

// No Link mock needed — CV page doesn't use next/link
import CVPage from "@/app/cv/page";

describe("CVPage", () => {
  it("renders the name from cv.json", () => {
    render(<CVPage />);
    // Name appears in the header h1
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      cvData.name
    );
  });

  it("renders the headline", () => {
    render(<CVPage />);
    // Headline text may also appear in experience entries
    expect(screen.getAllByText(cvData.headline).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the location", () => {
    render(<CVPage />);
    expect(screen.getByText(cvData.location)).toBeInTheDocument();
  });

  it("renders the summary section", () => {
    render(<CVPage />);
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText(cvData.summary)).toBeInTheDocument();
  });

  it("renders all specialties as pills", () => {
    render(<CVPage />);
    for (const specialty of cvData.specialties) {
      // Some specialties may also appear as skill category names
      expect(screen.getAllByText(specialty).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders the Experience section with job titles", () => {
    render(<CVPage />);
    expect(screen.getByText("Experience")).toBeInTheDocument();
    for (const job of cvData.experience) {
      // Job title may duplicate the headline in the header
      expect(screen.getAllByText(job.title).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(new RegExp(job.company)).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders the Education section", () => {
    render(<CVPage />);
    expect(screen.getByText("Education")).toBeInTheDocument();
    for (const edu of cvData.education) {
      expect(screen.getByText(edu.degree)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(edu.institution))).toBeInTheDocument();
    }
  });

  it("renders all skill categories and individual skills", () => {
    render(<CVPage />);
    expect(screen.getByText("Skills")).toBeInTheDocument();
    for (const [category, skills] of Object.entries(cvData.skills)) {
      // Category names may also appear as specialty pills
      expect(screen.getAllByText(category).length).toBeGreaterThanOrEqual(1);
      for (const skill of skills) {
        // Some skills may appear in multiple places, just verify at least one
        expect(screen.getAllByText(skill).length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("renders contact links (Email, LinkedIn, GitHub)", () => {
    render(<CVPage />);
    const emailLink = screen.getByText("Email");
    expect(emailLink.closest("a")).toHaveAttribute(
      "href",
      `mailto:${cvData.links.email}`
    );

    const linkedInLink = screen.getByText("LinkedIn");
    expect(linkedInLink.closest("a")).toHaveAttribute(
      "href",
      cvData.links.linkedin
    );

    const githubLink = screen.getByText("GitHub");
    expect(githubLink.closest("a")).toHaveAttribute(
      "href",
      cvData.links.github
    );
  });

  it("does not render Certifications section when array is empty", () => {
    render(<CVPage />);
    if (cvData.certifications.length === 0) {
      expect(screen.queryByText("Certifications")).not.toBeInTheDocument();
    }
  });
});
