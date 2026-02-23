import type { Metadata } from "next";
import ProjectsList from "@/components/ProjectsList";

export const metadata: Metadata = {
  title: "Projects | Chad Moore",
  description: "Open source projects and repositories by Chad Moore",
};

export default function ProjectsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Projects
        </h1>
        <p className="text-muted max-w-2xl">
          A selection of my public repositories on GitHub. These are pulled
          live from the GitHub API.
        </p>
      </div>
      <ProjectsList />
    </div>
  );
}
