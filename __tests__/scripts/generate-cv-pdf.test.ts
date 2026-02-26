/**
 * @jest-environment node
 */
/**
 * Tests for scripts/generate-cv-pdf.ts — PDF generation from CV data.
 *
 * Validates that generateCvPdf produces a valid PDF buffer with the
 * expected metadata. Uses a temp file to avoid polluting public/.
 */
import { existsSync, unlinkSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { generateCvPdf } from "../../scripts/generate-cv-pdf";
import rawContent from "../../content/content.json";

// Minimal typed subset — mirrors what the script consumes.
interface ContentData {
  site: {
    name: string;
    siteUrl?: string;
    links: { email: string; github: string; linkedin: string };
  };
  cv: {
    headline: string;
    location: string;
    summary: string;
    specialties: string[];
    experience: Array<{
      title: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      description: string;
      highlights: Array<{ text: string; skills: string[] }>;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      location: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
    skills: Record<
      string,
      Array<{
        name: string;
        proficiency: string;
        preference?: string;
        status?: string;
      }>
    >;
    certifications: string[];
  };
}

const content = rawContent as unknown as ContentData;

describe("generateCvPdf", () => {
  const outputPath = join(tmpdir(), `cv-test-${Date.now()}.pdf`);

  afterAll(() => {
    if (existsSync(outputPath)) unlinkSync(outputPath);
  });

  it("writes a PDF file to the specified path", async () => {
    await generateCvPdf(content, outputPath);
    expect(existsSync(outputPath)).toBe(true);
  });

  it("produces a file starting with the PDF header signature", async () => {
    await generateCvPdf(content, outputPath);
    const buf = readFileSync(outputPath);
    // Every valid PDF starts with %PDF-
    expect(buf.toString("ascii", 0, 5)).toBe("%PDF-");
  });

  it("produces a non-trivial file size", async () => {
    await generateCvPdf(content, outputPath);
    const buf = readFileSync(outputPath);
    // A real CV PDF should be well over 1 KB
    expect(buf.length).toBeGreaterThan(1024);
  });

  it("works with minimal content (empty arrays)", async () => {
    const minimal = {
      site: {
        name: "Test Person",
        siteUrl: "https://example.com",
        links: { email: "a@b.com", github: "", linkedin: "" },
      },
      cv: {
        headline: "Engineer",
        location: "Anywhere",
        summary: "A summary.",
        specialties: [],
        experience: [],
        education: [],
        skills: {},
        certifications: [],
      },
    };

    const minPath = join(tmpdir(), `cv-min-test-${Date.now()}.pdf`);
    await generateCvPdf(minimal, minPath);
    expect(existsSync(minPath)).toBe(true);
    const buf = readFileSync(minPath);
    expect(buf.toString("ascii", 0, 5)).toBe("%PDF-");
    unlinkSync(minPath);
  });
});
