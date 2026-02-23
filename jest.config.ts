import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        // Disable type-checking in tests for speed — tsc handles that separately
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    // Mirror the @/* path alias from tsconfig.json
    "^@/(.*)$": "<rootDir>/src/$1",
    // Map the cv.json import used in about/page.tsx and cv/page.tsx
    "^@/../content/(.*)$": "<rootDir>/content/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
};

export default config;
