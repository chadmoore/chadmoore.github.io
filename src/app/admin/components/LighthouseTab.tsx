/**
 * LighthouseTab — display latest Lighthouse audit scores.
 *
 * Fetches content/lighthouse.json via the admin API and renders
 * a score card for each audited page with color-coded gauges.
 */
"use client";

import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import type { LighthouseData, LighthouseScores } from "@/lib/lighthouse";

/** Category labels in display order. */
const CATEGORIES: { key: keyof LighthouseScores; label: string }[] = [
  { key: "performance", label: "Performance" },
  { key: "accessibility", label: "Accessibility" },
  { key: "bestPractices", label: "Best Practices" },
  { key: "seo", label: "SEO" },
];

/** Return a Tailwind color class based on the score (0–100). */
function scoreColor(score: number): string {
  if (score >= 90) return "text-green-500";
  if (score >= 50) return "text-orange-400";
  return "text-red-500";
}

/** Return the stroke-dasharray SVG value for a circular gauge. */
function gaugeDash(score: number): string {
  // Circle circumference = 2πr = 2 * π * 18 ≈ 113.1
  const circumference = 113.1;
  const filled = (score / 100) * circumference;
  return `${filled} ${circumference - filled}`;
}

/** A single circular score gauge. */
function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = scoreColor(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle
            cx="20" cy="20" r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-border"
          />
          <circle
            cx="20" cy="20" r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={gaugeDash(score)}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>
          {score}
        </span>
      </div>
      <span className="text-[11px] text-muted text-center leading-tight">{label}</span>
    </div>
  );
}

export function LighthouseTab() {
  const [data, setData] = useState<LighthouseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/lighthouse", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Could not load Lighthouse data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-muted">Loading Lighthouse data…</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Lighthouse</h2>
        <p className="text-muted">
          No audit data yet. Scores appear here after the Lighthouse GitHub Action runs.
        </p>
      </div>
    );
  }

  const timestamp = new Date(data.timestamp);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lighthouse</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchData}
            title="Refresh"
            className="text-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {data.pages.map((page) => {
          const reportUrl = data.reportLinks?.[`https://chadmoore.info${page.url}`];
          return (
            <div
              key={page.url}
              className="bg-surface border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{page.url || "/"}</span>
                {reportUrl && (
                  <a
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline text-xs flex items-center gap-1"
                  >
                    Full report <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex gap-6 justify-center">
                {CATEGORIES.map(({ key, label }) => (
                  <ScoreGauge
                    key={key}
                    score={page.scores[key]}
                    label={label}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
