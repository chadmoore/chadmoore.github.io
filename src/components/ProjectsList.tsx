/**
 * ProjectsList — Live GitHub Repository Showcase
 *
 * Fetches public repos from the GitHub API at runtime (client-side)
 * and renders them as a responsive card grid.
 *
 * Why client-side instead of build-time?
 * Because the GitHub API has rate limits per-IP, and at build time
 * in CI that IP is shared. Client-side means each visitor gets
 * their own rate limit bucket, and the data is always fresh.
 *
 * Features:
 *  - Skeleton loading animation while fetching
 *  - Error state with a direct link to the GitHub profile
 *  - Forks are filtered out (only original work shown)
 *  - Sorted by stars, because democracy
 *  - Language color dots matching GitHub's linguist colors
 *
 * // Easter egg: the language colors object below is lovingly
 * // hand-transcribed from GitHub's linguist YAML. If your favorite
 * // language is missing, it's not personal. Probably.
 */
"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

/** Shape of the GitHub API /repos response (only the fields we use). */
interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  topics: string[];
  updated_at: string;
}

/**
 * Language → color mapping, matching GitHub's linguist colors.
 * See: https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml
 */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-[#3178c6]",
  JavaScript: "bg-[#f1e05a]",
  Python: "bg-[#3572A5]",
  Rust: "bg-[#dea584]",
  Go: "bg-[#00ADD8]",
  Java: "bg-[#b07219]",
  "C#": "bg-[#178600]",
  Ruby: "bg-[#701516]",
  PHP: "bg-[#4F5D95]",
  Shell: "bg-[#89e051]",
  HTML: "bg-[#e34c26]",
  CSS: "bg-[#563d7c]",
  Dart: "bg-[#00B4AB]",
  Swift: "bg-[#F05138]",
  Kotlin: "bg-[#A97BFF]",
};

export default function ProjectsList() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch(
          "https://api.github.com/users/chadmoore/repos?sort=updated&per_page=30&type=owner"
        );
        if (!res.ok) throw new Error("Failed to fetch repositories");
        const data: Repo[] = await res.json();
        // Filter out forks and sort by stars then updated
        const filtered = data
          .filter((repo) => !repo.fork)
          .sort((a, b) => b.stargazers_count - a.stargazers_count);
        setRepos(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border border-border rounded-xl p-6 animate-pulse"
          >
            <div className="h-5 bg-surface rounded w-1/3 mb-3" />
            <div className="h-4 bg-surface rounded w-full mb-2" />
            <div className="h-4 bg-surface rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/30 bg-red-500/10 dark:bg-red-500/5 rounded-xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <p className="text-sm text-muted mt-2">
          Check back later or visit{" "}
          <a
            href="https://github.com/chadmoore"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            my GitHub profile
          </a>{" "}
          directly.
        </p>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <p className="text-muted text-center py-12">No repositories found.</p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {repos.map((repo) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group border border-border rounded-xl p-6 hover:border-accent/50 hover:bg-surface-hover transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-base font-semibold group-hover:text-accent transition-colors truncate">
              {repo.name}
            </h2>
            {repo.stargazers_count > 0 && (
              <span className="text-xs text-muted flex items-center gap-1 shrink-0 ml-2">
                <Star className="w-3.5 h-3.5 fill-current" />
                {repo.stargazers_count}
              </span>
            )}
          </div>
          <p className="text-sm text-muted line-clamp-2 mb-4">
            {repo.description || "No description"}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${LANGUAGE_COLORS[repo.language] || "bg-[#6b7280]"}`}
                />
                {repo.language}
              </span>
            )}
            <span>
              Updated {new Date(repo.updated_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
