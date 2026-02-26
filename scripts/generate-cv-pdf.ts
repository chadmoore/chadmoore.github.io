/**
 * generate-cv-pdf.ts — Render content/content.json CV data into a professional PDF.
 *
 * Uses PDFKit to produce a clean, typographically polished résumé and
 * writes it to public/resume.pdf so it's served at chadmoore.info/resume.pdf.
 *
 * Usage:
 *   npx tsx scripts/generate-cv-pdf.ts
 *   npm run generate:pdf
 *
 * Re-run whenever CV content changes — the PDF is a build artifact,
 * committed to the repo so static export picks it up.
 */

import PDFDocument from "pdfkit";
import { createWriteStream, readFileSync } from "fs";
import { resolve } from "path";

// ─── Types (mirrored from contentData.ts to keep script standalone) ─

interface Highlight {
  text: string;
  skills: string[];
}

interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: Highlight[];
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  name: string;
  proficiency: string;
  preference?: string;
  status?: string;
}

interface CvSection {
  headline: string;
  location: string;
  summary: string;
  specialties: string[];
  experience: Experience[];
  education: Education[];
  skills: Record<string, Skill[]>;
  certifications: string[];
}

interface SiteSection {
  name: string;
  siteUrl?: string;
  cvLabel?: "resume" | "cv";
  links: { email: string; github: string; linkedin: string };
}

interface ContentData {
  site: SiteSection;
  cv: CvSection;
}

// ─── Date formatting (mirrors src/lib/dates.ts) ────────────────────

function formatDateRange(start: string, end: string | null): string {
  const formatMonthYear = (dateStr: string) => {
    const [year, month] = dateStr.split("-");
    if (!month) return year;
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  return `${formatMonthYear(start)} — ${end ? formatMonthYear(end) : "Present"}`;
}

// ─── Constants ──────────────────────────────────────────────────────

const PAGE_MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

const COLOR_PRIMARY = "#1a1a2e";
const COLOR_ACCENT = "#374151";
const COLOR_MUTED = "#64748b";
const COLOR_BORDER = "#e2e8f0";
const COLOR_LIGHT_BG = "#f8fafc";

const FONT_SANS = "Helvetica";
const FONT_SANS_BOLD = "Helvetica-Bold";
const FONT_SANS_OBLIQUE = "Helvetica-Oblique";

// ─── Helpers ────────────────────────────────────────────────────────

function drawHorizontalRule(doc: PDFKit.PDFDocument, y: number): void {
  doc
    .strokeColor(COLOR_BORDER)
    .lineWidth(0.75)
    .moveTo(PAGE_MARGIN, y)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN, y)
    .stroke();
}

function sectionHeading(doc: PDFKit.PDFDocument, title: string): void {
  ensureSpace(doc, 40);
  doc
    .font(FONT_SANS_BOLD)
    .fontSize(11)
    .fillColor(COLOR_ACCENT)
    .text(title.toUpperCase(), PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      characterSpacing: 1.5,
    });
  doc.moveDown(0.3);
  drawHorizontalRule(doc, doc.y);
  doc.moveDown(0.6);
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number): void {
  const remaining = doc.page.height - doc.page.margins.bottom - doc.y;
  if (remaining < needed) {
    doc.addPage();
  }
}

// ─── PDF Generation ─────────────────────────────────────────────────

export function generateCvPdf(content: ContentData, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const { site, cv } = content;
    const displayLabel = site.cvLabel === "cv" ? "CV" : "Resume";

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: PAGE_MARGIN, right: PAGE_MARGIN },
      info: {
        Title: `${site.name} — ${displayLabel}`,
        Author: site.name,
        Subject: cv.headline,
        Creator: "chadmoore.info",
      },
    });

    const stream = createWriteStream(outputPath);
    doc.pipe(stream);

    // ── Header ──────────────────────────────────────────────────────

    doc
      .font(FONT_SANS_BOLD)
      .fontSize(24)
      .fillColor(COLOR_PRIMARY)
      .text(site.name, PAGE_MARGIN, PAGE_MARGIN);

    doc
      .font(FONT_SANS)
      .fontSize(12)
      .fillColor(COLOR_ACCENT)
      .text(cv.headline);

    doc.moveDown(0.3);

    // Contact info — stacked, left-aligned
    const contactFontSize = 9;
    doc.font(FONT_SANS).fontSize(contactFontSize).fillColor(COLOR_MUTED);

    const contactLines: string[] = [];
    if (site.links.email) contactLines.push(site.links.email);
    if (cv.location) contactLines.push(cv.location);
    if (site.links.linkedin)
      contactLines.push(site.links.linkedin.replace("https://www.", ""));
    if (site.links.github)
      contactLines.push(site.links.github.replace("https://", ""));

    for (const line of contactLines) {
      doc.text(line, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });
    }

    doc.moveDown(0.6);
    drawHorizontalRule(doc, doc.y);
    doc.moveDown(0.8);

    // ── Summary ─────────────────────────────────────────────────────

    sectionHeading(doc, "Summary");
    doc
      .font(FONT_SANS)
      .fontSize(9.5)
      .fillColor(COLOR_PRIMARY)
      .text(cv.summary, { width: CONTENT_WIDTH, lineGap: 2 });

    if (cv.specialties.length > 0) {
      doc.moveDown(0.4);
      doc
        .font(FONT_SANS_OBLIQUE)
        .fontSize(8.5)
        .fillColor(COLOR_ACCENT)
        .text(cv.specialties.join("  ·  "), { width: CONTENT_WIDTH });
    }
    doc.moveDown(0.8);

    // ── Experience ──────────────────────────────────────────────────

    if (cv.experience.length > 0) {
      sectionHeading(doc, "Experience");

      for (const job of cv.experience) {
        ensureSpace(doc, 60);

        // Job title + company
        doc
          .font(FONT_SANS_BOLD)
          .fontSize(10.5)
          .fillColor(COLOR_PRIMARY)
          .text(job.title, PAGE_MARGIN, doc.y, {
            width: CONTENT_WIDTH,
            continued: false,
          });

        // Company + dates on same line
        const dateStr = formatDateRange(job.startDate, job.endDate || null);
        doc
          .font(FONT_SANS)
          .fontSize(9)
          .fillColor(COLOR_ACCENT)
          .text(job.company, PAGE_MARGIN, doc.y, {
            width: CONTENT_WIDTH * 0.6,
            continued: false,
          });

        // Date range — right-aligned on same conceptual line
        doc
          .font(FONT_SANS)
          .fontSize(8)
          .fillColor(COLOR_MUTED)
          .text(dateStr, PAGE_MARGIN, doc.y - 12, {
            width: CONTENT_WIDTH,
            align: "right",
          });

        doc.moveDown(0.2);

        // Description
        if (job.description) {
          doc
            .font(FONT_SANS_OBLIQUE)
            .fontSize(8.5)
            .fillColor(COLOR_MUTED)
            .text(job.description, { width: CONTENT_WIDTH, lineGap: 1 });
          doc.moveDown(0.3);
        }

        // Highlights as bullet list
        for (const highlight of job.highlights) {
          ensureSpace(doc, 20);
          const bulletX = PAGE_MARGIN + 8;
          const textX = PAGE_MARGIN + 18;
          const textW = CONTENT_WIDTH - 18;

          doc
            .font(FONT_SANS)
            .fontSize(8.5)
            .fillColor(COLOR_MUTED)
            .text("\u2022", bulletX, doc.y, { continued: false });

          doc
            .font(FONT_SANS)
            .fontSize(8.5)
            .fillColor(COLOR_PRIMARY)
            .text(highlight.text, textX, doc.y - 11, {
              width: textW,
              lineGap: 1,
            });
        }

        doc.moveDown(0.7);
      }
    }

    // ── Education ───────────────────────────────────────────────────

    if (cv.education.length > 0) {
      sectionHeading(doc, "Education");

      for (const edu of cv.education) {
        ensureSpace(doc, 40);

        doc
          .font(FONT_SANS_BOLD)
          .fontSize(10)
          .fillColor(COLOR_PRIMARY)
          .text(edu.degree, { width: CONTENT_WIDTH });

        doc
          .font(FONT_SANS)
          .fontSize(9)
          .fillColor(COLOR_ACCENT)
          .text(edu.institution, { width: CONTENT_WIDTH, continued: false });

        if (edu.startDate) {
          doc
            .font(FONT_SANS)
            .fontSize(8)
            .fillColor(COLOR_MUTED)
            .text(
              `${edu.startDate} — ${edu.endDate || "Present"}`,
              { width: CONTENT_WIDTH },
            );
        }

        if (edu.description) {
          doc
            .font(FONT_SANS)
            .fontSize(8.5)
            .fillColor(COLOR_MUTED)
            .text(edu.description, { width: CONTENT_WIDTH });
        }

        doc.moveDown(0.5);
      }
    }

    // ── Skills ──────────────────────────────────────────────────────

    const skillCategories = Object.entries(cv.skills);
    if (skillCategories.length > 0) {
      sectionHeading(doc, "Skills");

      for (const [category, skills] of skillCategories) {
        ensureSpace(doc, 25);

        // Filter to active skills only (no legacy)
        const activeSkills = skills.filter(
          (s) => !s.status || s.status === "active",
        );
        if (activeSkills.length === 0) continue;

        doc
          .font(FONT_SANS_BOLD)
          .fontSize(8.5)
          .fillColor(COLOR_PRIMARY)
          .text(`${category}: `, PAGE_MARGIN, doc.y, {
            continued: true,
          });

        doc
          .font(FONT_SANS)
          .fontSize(8.5)
          .fillColor(COLOR_MUTED)
          .text(activeSkills.map((s) => s.name).join(", "), {
            width: CONTENT_WIDTH - doc.x + PAGE_MARGIN,
          });

        doc.moveDown(0.2);
      }

      // Legacy skills summary
      const legacySkills = skillCategories
        .flatMap(([, skills]) => skills)
        .filter((s) => s.status === "legacy");
      if (legacySkills.length > 0) {
        doc.moveDown(0.3);
        doc
          .font(FONT_SANS_BOLD)
          .fontSize(8.5)
          .fillColor(COLOR_PRIMARY)
          .text("Prior Experience: ", PAGE_MARGIN, doc.y, { continued: true });
        doc
          .font(FONT_SANS)
          .fontSize(8.5)
          .fillColor(COLOR_MUTED)
          .text(legacySkills.map((s) => s.name).join(", "), {
            width: CONTENT_WIDTH - doc.x + PAGE_MARGIN,
          });
      }
    }

    // ── Certifications ──────────────────────────────────────────────

    if (cv.certifications.length > 0) {
      doc.moveDown(0.6);
      sectionHeading(doc, "Certifications");

      for (const cert of cv.certifications) {
        ensureSpace(doc, 15);
        doc
          .font(FONT_SANS)
          .fontSize(9)
          .fillColor(COLOR_PRIMARY)
          .text(`• ${cert}`, { width: CONTENT_WIDTH });
      }
    }

    // ── Finalize ────────────────────────────────────────────────────

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

// ─── CLI entry point ────────────────────────────────────────────────

/* istanbul ignore next -- CLI wrapper, not imported by tests */
if (require.main === module) {
  (async () => {
    const rootDir = resolve(__dirname, "..");
    const contentPath = resolve(rootDir, "content", "content.json");

    const raw = readFileSync(contentPath, "utf-8");
    const content = JSON.parse(raw) as ContentData;

    const slug = content.site.cvLabel === "cv" ? "cv" : "resume";
    const outputPath = resolve(rootDir, "public", `${slug}.pdf`);

    await generateCvPdf(content, outputPath);

    // eslint-disable-next-line no-console
    console.log(`✓ ${slug === "cv" ? "CV" : "Resume"} PDF written to ${outputPath}`);
  })().catch((err) => {
    console.error("Failed to generate CV PDF:", err);
    process.exit(1);
  });
}
