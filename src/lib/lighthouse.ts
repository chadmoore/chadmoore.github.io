/**
 * Lighthouse types — shape of content/lighthouse.json.
 *
 * The GitHub Action writes this file after each deploy audit.
 * The admin panel reads it to display scores per page.
 */

/** Lighthouse category scores (0–100). */
export interface LighthouseScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

/** Scores for a single audited page. */
export interface LighthousePage {
  url: string;
  scores: LighthouseScores;
}

/** The full lighthouse.json shape committed by the GitHub Action. */
export interface LighthouseData {
  timestamp: string;
  pages: LighthousePage[];
  /** Map of page URL → temporary-public-storage report link. */
  reportLinks?: Record<string, string>;
}
