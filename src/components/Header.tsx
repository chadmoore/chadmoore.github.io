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
import { Menu, SquarePen, X } from "lucide-react";
import { useState } from "react";
import { siteConfig, cvSlug, cvDisplayLabel, type SectionKey } from "@/lib/siteConfig";

/** Map the current pathname to the corresponding admin tab. */
function adminTabForPath(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname === "/about") return "about";
  if (pathname === `/${cvSlug}`) return "cv";
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
 * Lookup table for all possible nav entries.
 * The render order comes from siteConfig.navOrder, not from
 * this object's key order.
 */
const NAV_ENTRIES: Record<string, { href: string; label: string; section?: SectionKey }> = {
  home:     { href: "/",          label: "Home" },
  about:    { href: "/about",     label: "About",    section: "about" },
  projects: { href: "/projects",  label: "Projects", section: "projects" },
  blog:     { href: "/blog",      label: "Blog",     section: "blog" },
  cv:       { href: `/${cvSlug}`,  label: cvDisplayLabel, section: "cv" },
};

/**
 * Nav links ordered by siteConfig.navOrder, filtered to only
 * entries that have a page route and whose section is enabled.
 */
const navLinks = siteConfig.navOrder
  .map((key) => NAV_ENTRIES[key])
  .filter(
    (entry): entry is { href: string; label: string; section?: SectionKey } =>
      entry != null && (!entry.section || siteConfig.sections[entry.section]),
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
              <SquarePen className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-muted hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                  <SquarePen className="w-3.5 h-3.5" />
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
