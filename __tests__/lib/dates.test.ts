/**
 * Tests for src/lib/dates.ts — the real formatDateRange function.
 *
 * Previously this tested a reimplemented copy, which is an anti-pattern.
 * Now it imports the actual function from the source.
 */
import { formatDateRange, formatPostDate } from "@/lib/dates";

describe("formatDateRange", () => {
  it("formats a full YYYY-MM to YYYY-MM range", () => {
    const result = formatDateRange("2020-01", "2022-12");
    expect(result).toContain("Jan");
    expect(result).toContain("2020");
    expect(result).toContain("Dec");
    expect(result).toContain("2022");
    expect(result).toContain("—");
  });

  it("shows 'Present' when end date is null", () => {
    const result = formatDateRange("2023-06", null);
    expect(result).toContain("Jun");
    expect(result).toContain("2023");
    expect(result).toContain("Present");
  });

  it("handles year-only strings (no month)", () => {
    const result = formatDateRange("2020", "2022");
    expect(result).toBe("2020 — 2022");
  });

  it("handles year-only start with null end", () => {
    const result = formatDateRange("2020", null);
    expect(result).toBe("2020 — Present");
  });

  it("formats single-month ranges correctly", () => {
    const result = formatDateRange("2023-01", "2023-01");
    // Both sides should show the same month
    expect(result).toMatch(/Jan 2023 — Jan 2023/);
  });

  it("handles month=12 correctly (December, not off-by-one)", () => {
    const result = formatDateRange("2025-12", null);
    expect(result).toContain("Dec");
    expect(result).toContain("2025");
  });

  it("handles month=01 correctly (January)", () => {
    const result = formatDateRange("2020-01", "2020-02");
    expect(result).toContain("Jan");
    expect(result).toContain("Feb");
  });
});

describe("formatPostDate", () => {
  it("formats a date in short style by default", () => {
    const result = formatPostDate("2025-01-15");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("formats a date in long style when specified", () => {
    const result = formatPostDate("2025-01-15", "long");
    expect(result).toContain("January");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("defaults to short style", () => {
    const short = formatPostDate("2025-06-01");
    expect(short).toContain("Jun");
    // Should NOT contain the full month name
    expect(short).not.toContain("June");
  });

  it("handles dates that already include a time component", () => {
    const result = formatPostDate("2025-03-10T08:30:00");
    expect(result).toContain("Mar");
    expect(result).toContain("10");
    expect(result).toContain("2025");
  });
});
