/**
 * Header — Sticky navigation that follows you everywhere.
 *
 * Features:
 *  - Backdrop blur for that frosted-glass look on scroll
 *  - Responsive: horizontal nav on desktop, hamburger on mobile
 *  - Route-aware active states via usePathname()
 *  - Respects siteConfig: disabled sections don't appear as links
 *
 * The nav links are defined in `allNavLinks` and filtered at module
 * scope so the array is computed once, not on every render.
 * React Compiler would catch this anyway, but being explicit is free.
 *
 * // Q: "Why not use a <dialog> for the mobile menu?"
 * // A: Because toggling a div is 3 lines and works everywhere. YAGNI.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig, type SectionKey } from "@/lib/siteConfig";

/** Map the current pathname to the corresponding admin tab. */
function adminTabForPath(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname === "/about") return "about";
  if (pathname === "/cv") return "cv";
  if (pathname === "/projects") return "site";
  if (pathname.startsWith("/blog/")) {
    const slug = pathname.replace("/blog/", "");
    return `blog&edit=${slug}`;
  }
  if (pathname === "/blog") return "blog";
  return "site";
}

const isDev = process.env.NODE_ENV !== "production";

/**
 * Master list of all possible nav links.
 * Each link optionally maps to a section key in siteConfig.
 * If the section is disabled, the link is filtered out.
 */
const allNavLinks: { href: string; label: string; section?: SectionKey }[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About", section: "about" },
  { href: "/projects", label: "Projects", section: "projects" },
  { href: "/blog", label: "Blog", section: "blog" },
  { href: "/cv", label: "CV", section: "cv" },
];

/** Filtered at module scope — only enabled sections make it to the DOM. */
const navLinks = allNavLinks.filter(
  (link) => !link.section || siteConfig.sections[link.section]
);

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight hover:text-accent transition-colors"
        >
          Chad Moore
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex gap-8">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`text-sm transition-colors hover:text-accent ${
                    pathname === href ? "text-accent font-medium" : "text-muted"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          {isDev && (
            <Link
              href={`/admin?tab=${adminTabForPath(pathname)}`}
              className="text-muted hover:text-accent transition-colors"
              title="Edit this page (dev only)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-muted hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-6 pb-4">
          <ul className="flex flex-col gap-3 pt-3">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm transition-colors hover:text-accent ${
                    pathname === href ? "text-accent font-medium" : "text-muted"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            {isDev && (
              <li>
                <Link
                  href={`/admin?tab=${adminTabForPath(pathname)}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Page
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
