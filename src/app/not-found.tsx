/**
 * 404 Page — You took a wrong turn.
 *
 * In a static export, Next.js generates this as 404.html.
 * GitHub Pages will serve it automatically for any unmatched route.
 *
 * // The "4" and "0" and "4" walk into a page. The page says,
 * // "We don't serve your kind here." The 404 says,
 * // "That's exactly my problem."
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-2xl mx-auto px-6 py-24 text-center">
      {/* ASCII-ish art for visual flair */}
      <pre className="text-accent font-mono text-6xl sm:text-8xl font-bold mb-6 select-none">
        404
      </pre>

      <h1 className="text-2xl font-semibold text-foreground mb-4">
        Page not found
      </h1>

      <p className="text-muted mb-8 leading-relaxed">
        Whatever you were looking for isn&apos;t here.
        It might have moved, or maybe it never existed.
        <br />
        Either way, no judgment.
      </p>

      <Link
        href="/"
        className="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
      >
        Take me home
      </Link>

      {/* Hidden message for view-source enthusiasts */}
      {/* You found the 404 source code. Achievement unlocked: "Thorough Explorer" 🏆 */}
    </section>
  );
}
