/**
 * Site configuration — toggle sections on/off from one place.
 * Set any section to `false` to hide it from the nav and homepage.
 */
const siteConfig = {
  name: "Chad Moore",
  tagline: "Creative Data Driven Full Stack Software",

  sections: {
    about: true,
    projects: false,   // flip to true when ready to showcase
    blog: true,
    cv: true,
  },
} as const;

export type SectionKey = keyof typeof siteConfig.sections;

export default siteConfig;
