/**
 * Date Utilities — Shared date formatting helpers.
 *
 * Extracted from the CV page so they can be tested directly
 * and reused elsewhere if needed.
 */

/**
 * Converts a "YYYY-MM" start/end pair into a display-friendly date range.
 * Handles year-only strings and null end dates ("Present").
 *
 * Examples:
 *   formatDateRange("2020-01", "2022-12") → "Jan 2020 — Dec 2022"
 *   formatDateRange("2023-01", null)      → "Jan 2023 — Present"
 *   formatDateRange("2020", "2022")       → "2020 — 2022"
 */
export function formatDateRange(start: string, end: string | null): string {
  const formatMonthYear = (dateStr: string) => {
    const [year, month] = dateStr.split("-");
    if (!month) return year;                  // year-only fallback
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  return `${formatMonthYear(start)} — ${end ? formatMonthYear(end) : "Present"}`;
}

/**
 * Format a blog post date for display.
 *
 * @param dateStr - ISO date string (e.g. "2025-01-15")
 * @param style   - "short" → "Jan 15, 2025", "long" → "January 15, 2025"
 */
export function formatPostDate(dateStr: string, style: "short" | "long" = "short"): string {
  // Append noon time to prevent timezone-shift issues (midnight UTC → previous day in US timezones)
  const normalized = dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`;
  const date = new Date(normalized);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  });
}
