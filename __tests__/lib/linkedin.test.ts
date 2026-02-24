/**
 * Tests for src/lib/linkedin.ts
 *
 * TDD: RED → GREEN → REFACTOR.
 * Covers the pure parsing and transformation functions — no filesystem or
 * zip I/O happens here, so no mocks are needed.
 */
import {
  parseCSVText,
  parseLinkedInDate,
  buildContentFromLinkedIn,
  getDefaultContent,
  type LinkedInData,
} from "@/lib/linkedin";
import type { ContentData } from "@/lib/contentData";

// ─── parseCSVText ────────────────────────────────────────────────────

describe("parseCSVText", () => {
  it("returns empty array for empty string", () => {
    expect(parseCSVText("")).toEqual([]);
  });

  it("returns empty array for header-only input", () => {
    expect(parseCSVText("Name,Age\n")).toEqual([]);
  });

  it("parses a single data row into an object", () => {
    const result = parseCSVText("Name,Age\nAlice,30\n");
    expect(result).toEqual([{ Name: "Alice", Age: "30" }]);
  });

  it("parses multiple rows", () => {
    const csv = "First,Last\nJohn,Doe\nJane,Smith\n";
    expect(parseCSVText(csv)).toEqual([
      { First: "John", Last: "Doe" },
      { First: "Jane", Last: "Smith" },
    ]);
  });

  it("handles a quoted field containing a comma", () => {
    const csv = 'Title,Location\nEngineer,"Boston, MA"\n';
    expect(parseCSVText(csv)).toEqual([
      { Title: "Engineer", Location: "Boston, MA" },
    ]);
  });

  it("handles a quoted field containing an embedded newline", () => {
    const csv = 'Name,Bio\nAlice,"Line one\nLine two"\n';
    expect(parseCSVText(csv)).toEqual([
      { Name: "Alice", Bio: "Line one\nLine two" },
    ]);
  });

  it("handles escaped double-quotes (\"\") inside a quoted field", () => {
    const csv = 'Quote\n"She said ""hello"""\n';
    expect(parseCSVText(csv)).toEqual([{ Quote: 'She said "hello"' }]);
  });

  it("strips a UTF-8 BOM from the beginning of the text", () => {
    const csv = "\ufeffName,Age\nChad,40\n";
    expect(parseCSVText(csv)).toEqual([{ Name: "Chad", Age: "40" }]);
  });

  it("handles CRLF line endings", () => {
    const csv = "Name,Role\r\nAlice,Engineer\r\n";
    expect(parseCSVText(csv)).toEqual([{ Name: "Alice", Role: "Engineer" }]);
  });

  it("handles input with no trailing newline", () => {
    const csv = "Name,Age\nAlice,30";
    expect(parseCSVText(csv)).toEqual([{ Name: "Alice", Age: "30" }]);
  });

  it("ignores rows where all fields are empty", () => {
    const csv = "Name,Age\nAlice,30\n,\n";
    const result = parseCSVText(csv);
    expect(result).toHaveLength(1);
  });
});

// ─── parseLinkedInDate ───────────────────────────────────────────────

describe("parseLinkedInDate", () => {
  it("converts 'Jan 2020' to '2020-01'", () => {
    expect(parseLinkedInDate("Jan 2020")).toBe("2020-01");
  });

  it("converts 'Dec 2023' to '2023-12'", () => {
    expect(parseLinkedInDate("Dec 2023")).toBe("2023-12");
  });

  it("converts 'Mar 2020' to '2020-03'", () => {
    expect(parseLinkedInDate("Mar 2020")).toBe("2020-03");
  });

  it("passes through a year-only string unchanged", () => {
    expect(parseLinkedInDate("2015")).toBe("2015");
  });

  it("returns empty string for empty input", () => {
    expect(parseLinkedInDate("")).toBe("");
  });

  it("returns empty string for 'Present'", () => {
    expect(parseLinkedInDate("Present")).toBe("");
  });

  it("is case-insensitive for 'present'", () => {
    expect(parseLinkedInDate("present")).toBe("");
  });

  it("trims leading/trailing whitespace", () => {
    expect(parseLinkedInDate("  Jan 2020  ")).toBe("2020-01");
  });
});

// ─── buildContentFromLinkedIn ────────────────────────────────────────

const minimalLinkedIn: LinkedInData = {
  profile: {
    "First Name": "Jane",
    "Last Name": "Doe",
    Headline: "Senior Engineer",
    Summary: "Experienced engineer.",
    "Geo Location": "New York, NY",
  },
  positions: [
    {
      Title: "Staff Engineer",
      "Company Name": "Acme Corp",
      Location: "New York, NY",
      "Started On": "Jan 2018",
      "Finished On": "",
      Description: "Led platform engineering.",
    },
    {
      Title: "Software Engineer",
      "Company Name": "Old Co",
      Location: "",
      "Started On": "2015",
      "Finished On": "Dec 2017",
      Description: "",
    },
  ],
  education: [
    {
      "School Name": "State University",
      "Degree Name": "B.S. Computer Science",
      "Start Date": "2010",
      "End Date": "2014",
      Notes: "",
      Activities: "",
    },
  ],
  skills: [
    { Name: "TypeScript" },
    { Name: "React" },
    { Name: "Node.js" },
  ],
};

describe("buildContentFromLinkedIn", () => {
  it("sets site.name from First Name + Last Name", () => {
    const result = buildContentFromLinkedIn(minimalLinkedIn);
    expect(result.site.name).toBe("Jane Doe");
  });

  it("sets cv.headline from the Headline field", () => {
    const result = buildContentFromLinkedIn(minimalLinkedIn);
    expect(result.cv.headline).toBe("Senior Engineer");
  });

  it("sets cv.location from Geo Location", () => {
    const result = buildContentFromLinkedIn(minimalLinkedIn);
    expect(result.cv.location).toBe("New York, NY");
  });

  it("sets cv.summary from Summary", () => {
    const result = buildContentFromLinkedIn(minimalLinkedIn);
    expect(result.cv.summary).toBe("Experienced engineer.");
  });

  it("maps positions to cv.experience entries", () => {
    const result = buildContentFromLinkedIn(minimalLinkedIn);
    expect(result.cv.experience).toHaveLength(2);
    expect(result.cv.experience[0]).toMatchObject({
      title: "Staff Engineer",
      company: "Acme Corp",
      location: "New York, NY",
      startDate: "2018-01",
      endDate: "",
      description: "Led platform engineering.",
      highlights: [],
    });
  });

  it("maps a past position's date correctly", () => {
    const result = buildContentFromLinkedIn(minimalLinkedIn);
    expect(result.cv.experience[1]).toMatchObject({
      startDate: "2015",
      endDate: "2017-12",
    });
  });

  it("maps education to cv.education entries", () => {
    const result = buildContentFromLinkedIn(minimalLinkedIn);
    expect(result.cv.education).toHaveLength(1);
    expect(result.cv.education[0]).toMatchObject({
      degree: "B.S. Computer Science",
      institution: "State University",
      startDate: "2010",
      endDate: "2014",
    });
  });

  it("puts imported skills into a 'Skills' category with 'familiar' proficiency", () => {
    const result = buildContentFromLinkedIn(minimalLinkedIn);
    expect(result.cv.skills["Skills"]).toBeDefined();
    expect(result.cv.skills["Skills"]).toHaveLength(3);
    expect(result.cv.skills["Skills"][0]).toMatchObject({
      name: "TypeScript",
      proficiency: "familiar",
    });
  });

  it("produces an empty skills object when LinkedIn skills list is empty", () => {
    const noSkills: LinkedInData = { ...minimalLinkedIn, skills: [] };
    const result = buildContentFromLinkedIn(noSkills);
    expect(result.cv.skills).toEqual({});
  });

  it("preserves non-CV sections from existing ContentData", () => {
    const existing: ContentData = {
      ...getDefaultContent(),
      site: {
        name: "Old Name",
        tagline: "My tagline",
        sections: { about: true, projects: false, blog: true, cv: true },
        links: { email: "me@example.com", github: "https://github.com/me", linkedin: "" },
        navOrder: ["home", "about", "cv"],
      },
      about: {
        heading: "My About Page",
        intro: ["Custom intro."],
        skillsHeading: "Skills",
        contactHeading: "Contact",
        contactText: "Reach out.",
      },
    };

    const result = buildContentFromLinkedIn(minimalLinkedIn, existing);

    // Site name updated from LinkedIn
    expect(result.site.name).toBe("Jane Doe");
    // Other site fields preserved
    expect(result.site.tagline).toBe("My tagline");
    expect(result.site.links.email).toBe("me@example.com");
    // About section untouched
    expect(result.about).toEqual(existing.about);
  });

  it("uses getDefaultContent when no existing data is provided", () => {
    const result = buildContentFromLinkedIn(minimalLinkedIn);
    const defaults = getDefaultContent();
    // Non-CV sections should match defaults (except site.name which comes from LinkedIn)
    expect(result.home).toEqual(defaults.home);
    expect(result.blog).toEqual(defaults.blog);
    expect(result.projects).toEqual(defaults.projects);
  });
});

// ─── getDefaultContent ───────────────────────────────────────────────

describe("getDefaultContent", () => {
  it("returns an object with all required ContentData keys", () => {
    const defaults = getDefaultContent();
    expect(defaults).toHaveProperty("site");
    expect(defaults).toHaveProperty("home");
    expect(defaults).toHaveProperty("about");
    expect(defaults).toHaveProperty("projects");
    expect(defaults).toHaveProperty("blog");
    expect(defaults).toHaveProperty("cv");
  });

  it("has empty string for site.name and site.tagline", () => {
    const defaults = getDefaultContent();
    expect(defaults.site.name).toBe("");
    expect(defaults.site.tagline).toBe("");
  });

  it("enables all sections by default", () => {
    const defaults = getDefaultContent();
    expect(defaults.site.sections.about).toBe(true);
    expect(defaults.site.sections.projects).toBe(true);
    expect(defaults.site.sections.blog).toBe(true);
    expect(defaults.site.sections.cv).toBe(true);
  });

  it("has empty arrays for cv experience, education, and certifications", () => {
    const defaults = getDefaultContent();
    expect(defaults.cv.experience).toEqual([]);
    expect(defaults.cv.education).toEqual([]);
    expect(defaults.cv.certifications).toEqual([]);
  });

  it("returns independent objects each call (no shared references)", () => {
    const a = getDefaultContent();
    const b = getDefaultContent();
    a.site.name = "Modified";
    expect(b.site.name).toBe("");
  });
});
