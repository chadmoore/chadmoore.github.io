/**
 * Site Configuration — The single source of truth.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Toggle any section on/off and the entire site adapts:
 * navigation links, homepage hero buttons, and recent-posts
 * section all respect these flags. No hunting through JSX.
 *
 * Want to show the Projects page? Flip `projects` to `true`.
 * Want to hide the blog? Set `blog` to `false`.
 *
 * That's it. One file. One commit. Done.
 *
 * // TODO: add a "uses" page for the /uses crowd
 * // TODO: add dark/light theme toggle (currently dark-only because taste)
 */
export const siteConfig = {
  /** Display name used in the hero, nav, and footer */
  name: "Chad Moore",

  /** Tagline shown below the name on the homepage */
  tagline: "Full-stack engineer. Enterprise systems. Cloud to UI.",

  /**
   * Section visibility flags.
   * Each key maps to a route (e.g. about → /about).
   * Set to `false` to hide from nav AND homepage.
   */
  sections: {
    about: true,
    projects: false,   // flip to true when the repos are ready for prime time
    blog: true,
    cv: true,
  },
} as const;

/** Union type of all toggleable section keys — keeps the Header type-safe. */
export type SectionKey = keyof typeof siteConfig.sections;
