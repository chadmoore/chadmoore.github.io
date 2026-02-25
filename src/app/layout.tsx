/**
 * Root Layout — The skeleton every page inherits.
 *
 * This wraps every route in the app with:
 *  - Google Fonts (Geist Sans + Geist Mono, loaded with zero layout shift)
 *  - Global CSS (Tailwind + our custom theme tokens)
 *  - Persistent <Header /> and <Footer /> so navigation is always available
 *
 * The flex-col min-h-screen pattern ensures the footer hugs the bottom
 * even when page content is short. CSS grid would also work here, but
 * flexbox is simpler and we don't need the extra power.
 *
 * Fun fact: this file is the only server component that renders on every
 * single page of the site. Treat it with the reverence it deserves.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/siteConfig";
import { content } from "@/lib/content";

/* Load Geist typeface family — Vercel's open-source font.
 * Using next/font guarantees self-hosting, font-display: swap,
 * and automatic subsetting. No external requests at runtime. */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  authors: [{ name: siteConfig.name, url: siteConfig.siteUrl }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.tagline,
  },
  twitter: {
    card: "summary",
    title: siteConfig.name,
    description: siteConfig.tagline,
  },
  other: {
    // Point to our humans.txt for the 0.01% of people who care
    "link:author": "/humans.txt",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        Dear curious developer: welcome to the source code.
        Yes, it's a static export. Yes, it's over-engineered for a
        personal site. No, I don't regret a single line.

        If you found this, say hi: chad@chadmoore.info
      */}
      <head>
        {/* Structured data — helps search engines understand who this is */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: content.site.name,
              url: siteConfig.siteUrl,
              email: content.site.links.email,
              jobTitle: content.cv.headline,
              sameAs: [
                content.site.links.github,
                content.site.links.linkedin,
              ],
            }),
          }}
        />
        {/* Cloudflare Web Analytics — privacy-first, no cookies.
           Only loads in production to avoid CORS errors on localhost. */}
        {process.env.NODE_ENV === "production" && siteConfig.cloudflareAnalyticsToken && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: siteConfig.cloudflareAnalyticsToken })}
          />
        )}
        {/* Console easter egg — because every good site needs one */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=function(a){return a.map(function(c){return String.fromCodePoint(c)}).join("")};var m=[${Array.from("%c👋 Hey there, fellow developer!").map(c => c.codePointAt(0)).join(",")}];var s1=[${Array.from("font-size:16px;font-weight:bold;color:#3b82f6").map(c => c.codePointAt(0)).join(",")}];var m2=[${Array.from("%cCurious about how this site is built?\nNext.js • Tailwind CSS • TypeScript • Static Export\n\nSource: https://github.com/chadmoore/chadmoore.github.io").map(c => c.codePointAt(0)).join(",")}];var s2=[${Array.from("font-size:12px;color:#a3a3a3").map(c => c.codePointAt(0)).join(",")}];var m3=[${Array.from("%cP.S. — If you found a bug, it's a feature. If you found a feature, it's intentional. Probably.").map(c => c.codePointAt(0)).join(",")}];var s3=[${Array.from("font-size:11px;color:#525252;font-style:italic").map(c => c.codePointAt(0)).join(",")}];console.log(d(m),d(s1));console.log(d(m2),d(s2));console.log(d(m3),d(s3))})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
