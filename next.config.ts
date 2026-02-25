/**
 * Next.js Configuration
 *
 * output: "export"  — Generates a fully static site into ./out
 *                      so we can deploy to GitHub Pages without a server.
 *                      Only enabled for production builds (STATIC_EXPORT=1)
 *                      so that API routes work during local development.
 *
 * reactCompiler     — Enables the React Compiler for automatic memoization.
 *                      Because life's too short for manual useMemo.
 *
 * images.unoptimized — GitHub Pages can't run the Next.js image optimizer,
 *                      so we serve images as-is. Keep 'em lean.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.STATIC_EXPORT === "1" ? "export" : undefined,
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;
