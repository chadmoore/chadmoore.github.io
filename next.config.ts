/**
 * Next.js Configuration
 *
 * output: "export"  — Generates a fully static site into ./out
 *                      so we can deploy to GitHub Pages without a server.
 *
 * reactCompiler     — Enables the React Compiler for automatic memoization.
 *                      Because life's too short for manual useMemo.
 *
 * images.unoptimized — GitHub Pages can't run the Next.js image optimizer,
 *                      so we serve images as-is. Keep 'em lean.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
