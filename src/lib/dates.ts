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
  const fmt = (d: string) => {
    const [year, month] = d.split("-");
    if (!month) return year;                  // year-only fallback
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  return `${fmt(start)} — ${end ? fmt(end) : "Present"}`;
}
