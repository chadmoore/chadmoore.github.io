"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import siteConfig, { type SectionKey } from "@/lib/siteConfig";

const allNavLinks: { href: string; label: string; section?: SectionKey }[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About", section: "about" },
  { href: "/projects", label: "Projects", section: "projects" },
  { href: "/blog", label: "Blog", section: "blog" },
  { href: "/cv", label: "CV", section: "cv" },
];

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
        <ul className="hidden md:flex gap-8">
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
          </ul>
        </div>
      )}
    </header>
  );
}
