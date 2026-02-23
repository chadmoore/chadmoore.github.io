import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Chad Moore",
  description: "About Chad Moore — Creative Data Driven Full Stack Software",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
        About Me
      </h1>

      <div className="prose prose-invert max-w-none space-y-6 text-muted leading-relaxed">
        <p className="text-lg">
          I&apos;m Chad Moore — a full-stack software developer who loves building
          creative, data-driven solutions. I enjoy working across the entire
          stack, from crafting intuitive front-end experiences to designing
          robust back-end systems.
        </p>

        <p>
          My work spans web applications, data pipelines, APIs, and everything
          in between. I believe great software comes from curiosity, clear
          thinking, and a willingness to iterate.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-12 mb-4">
          What I Work With
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            "TypeScript",
            "React",
            "Next.js",
            "Node.js",
            "Python",
            "PostgreSQL",
            "Tailwind CSS",
            "Docker",
            "Git",
          ].map((skill) => (
            <div
              key={skill}
              className="bg-surface border border-border rounded-lg px-4 py-2 text-sm text-center hover:border-accent/50 transition-colors"
            >
              {skill}
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-foreground mt-12 mb-4">
          Get In Touch
        </h2>
        <p>
          The best way to reach me is by{" "}
          <a
            href="mailto:chad@chadmoore.info"
            className="text-accent hover:text-accent-hover transition-colors underline underline-offset-4"
          >
            email
          </a>
          {" "}or on{" "}
          <a
            href="https://www.linkedin.com/in/chad-moore-info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition-colors underline underline-offset-4"
          >
            LinkedIn
          </a>
          . I&apos;m always open to interesting conversations and collaborations.
        </p>
      </div>
    </div>
  );
}
