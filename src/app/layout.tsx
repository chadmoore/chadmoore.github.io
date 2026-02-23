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
  title: "Chad Moore",
  description: "Creative Data Driven Full Stack Software",
  authors: [{ name: "Chad Moore", url: "https://chadmoore.info" }],
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
        {/* Console easter egg — because every good site needs one */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log(
                "%c👋 Hey there, fellow developer!",
                "font-size:16px;font-weight:bold;color:#3b82f6"
              );
              console.log(
                "%cCurious about how this site is built?\\nNext.js • Tailwind CSS • TypeScript • Static Export\\n\\nSource: https://github.com/chadmoore/chadmoore.github.io",
                "font-size:12px;color:#a3a3a3"
              );
              console.log(
                "%cP.S. — If you found a bug, it's a feature. If you found a feature, it's intentional. Probably.",
                "font-size:11px;color:#525252;font-style:italic"
              );
            `,
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
