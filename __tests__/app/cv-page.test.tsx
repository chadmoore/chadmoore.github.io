/**
 * Tests for src/app/cv/page.tsx — CV page rendering.
 *
 * Verifies all sections render from content.json data.
 */
import { render, screen } from "@testing-library/react";
import rawContent from "../../content/content.json";
import type { ContentData } from "../../src/lib/contentData";

const content = rawContent as unknown as ContentData;
const cvData = content.cv;
const siteData = content.site;

// No Link mock needed — CV page doesn't use next/link
import CVPage from "@/app/cv/page";

describe("CVPage", () => {
  it("renders the name from content.json", () => {
    render(<CVPage />);
    // Name appears in the header h1
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      siteData.name
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

  it("renders the Education section only when education data exists", () => {
    render(<CVPage />);
    if (cvData.education.length > 0) {
      expect(screen.getByText("Education")).toBeInTheDocument();
      for (const edu of cvData.education) {
        expect(screen.getByText(edu.degree)).toBeInTheDocument();
        expect(screen.getByText(new RegExp(edu.institution))).toBeInTheDocument();
      }
    } else {
      expect(screen.queryByText("Education")).not.toBeInTheDocument();
    }
  });

  it("renders filter controls inside the Experience section", () => {
    render(<CVPage />);
    // CVExperience renders toggle pills for skill dimensions
    expect(screen.getByRole("button", { name: "Expert" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Legacy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "date" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "relevance" })).toBeInTheDocument();
  });

  it("does not render a standalone Skills section", () => {
    render(<CVPage />);
    expect(screen.queryByText("Skills")).not.toBeInTheDocument();
  });

  it("renders contact links (Email, LinkedIn, GitHub)", () => {
    render(<CVPage />);
    const emailLink = screen.getByText("Email");
    expect(emailLink.closest("a")).toHaveAttribute(
      "href",
      `mailto:${siteData.links.email}`
    );

    const linkedInLink = screen.getByText("LinkedIn");
    expect(linkedInLink.closest("a")).toHaveAttribute(
      "href",
      siteData.links.linkedin
    );

    const githubLink = screen.getByText("GitHub");
    expect(githubLink.closest("a")).toHaveAttribute(
      "href",
      siteData.links.github
    );
  });

  it("does not render Certifications section when array is empty", () => {
    render(<CVPage />);
    if (cvData.certifications.length === 0) {
      expect(screen.queryByText("Certifications")).not.toBeInTheDocument();
    }
  });
});
