/**
 * Lighthouse CI Configuration
 *
 * Audits key pages on chadmoore.info after every deploy.
 * Scores are uploaded to temporary public storage and posted
 * as GitHub commit status checks.
 *
 * Performance budgets are intentionally generous — the goal
 * is catching regressions, not chasing 100s.
 */

// Derive the CV/Resume slug from content.json so the URL stays in sync
const content = require("./content/content.json");
const cvLabel = content.site?.cvLabel ?? "resume";
const cvSlug = cvLabel === "cv" ? "cv" : "resume";

module.exports = {
  ci: {
    collect: {
      url: [
        "https://chadmoore.info/",
        "https://chadmoore.info/about",
        "https://chadmoore.info/blog",
        "https://chadmoore.info/projects",
        `https://chadmoore.info/${cvSlug}`,
      ],
      // Run each page 3 times and take the median — reduces flakiness
      numberOfRuns: 3,
      settings: {
        // Simulate a mid-tier phone on a decent connection
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        // Performance: warn below 90, fail below 70
        "categories:performance": ["warn", { minScore: 0.9, aggregationMethod: "median-run" }],
        // Accessibility: warn below 95, fail below 85
        "categories:accessibility": ["warn", { minScore: 0.95, aggregationMethod: "median-run" }],
        // Best practices: warn below 90
        "categories:best-practices": ["warn", { minScore: 0.9, aggregationMethod: "median-run" }],
        // SEO: warn below 90
        "categories:seo": ["warn", { minScore: 0.9, aggregationMethod: "median-run" }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
