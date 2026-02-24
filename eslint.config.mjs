import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sonarjs from "eslint-plugin-sonarjs";

// ─── CODE SMELL SCORE ────────────────────────────────────────────────────────
//
// Thresholds are calibrated to the current codebase and enforced in CI.
// Raising a threshold requires a comment explaining why.
//
//  Cognitive complexity ≤ 15  — SonarJS default; covers nested conditions,
//                               loops, and logical operators weighted by depth.
//  Cyclomatic complexity ≤ 15 — independent paths through a function.
//  Nesting depth ≤ 4          — beyond 4 levels deep, extract a function.
//  Duplicate strings ≥ 4×     — in business logic (.ts) only; TSX is exempt
//                               because Tailwind utilities are a design system,
//                               not magic strings.
//
// Exempt file: src/app/admin/page.tsx — intentionally monolithic tabbed form.
// Raising its complexity would require breaking it into separate tab modules
// (a valid refactor but out of scope for the current iteration).
//
// ─────────────────────────────────────────────────────────────────────────────

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // ── Core smell rules — apply to all source files ──────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { sonarjs },
    rules: {
      // Complexity ceilings
      "complexity":                         ["error", { max: 15 }],
      "max-depth":                          ["error", { max: 4 }],
      "sonarjs/cognitive-complexity":       ["error", 15],

      // Duplicated logic
      "sonarjs/no-identical-functions":     "error",
      "sonarjs/no-duplicated-branches":     "error",
      "sonarjs/no-all-duplicated-branches": "error",

      // Logic smells
      "sonarjs/no-collapsible-if":          "error",
      "sonarjs/no-redundant-boolean":       "error",
      "sonarjs/no-inverted-boolean-check":  "error",
      "sonarjs/no-redundant-jump":          "error",
      "sonarjs/prefer-immediate-return":    "warn",
      "sonarjs/no-nested-template-literals":"warn",
    },
  },

  // ── Duplicate string literals — business logic only, not JSX ─────────────
  {
    files: ["src/**/*.ts"],
    plugins: { sonarjs },
    rules: {
      "sonarjs/no-duplicate-string": ["warn", { threshold: 4 }],
    },
  },

  // ── Admin page exemption ──────────────────────────────────────────────────
  // AdminPage is a single-file tabbed form editor. Its complexity is
  // structural (one render function, many conditional form sections),
  // not algorithmic. Splitting it into per-tab components is a valid
  // future refactor; for now this exemption is intentional.
  {
    files: ["src/app/admin/page.tsx"],
    rules: {
      "complexity":                   "off",
      "sonarjs/cognitive-complexity": "off",
    },
  },
]);

export default eslintConfig;

