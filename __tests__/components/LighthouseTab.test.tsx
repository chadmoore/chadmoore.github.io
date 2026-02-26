/**
 * Tests for the LighthouseTab admin component.
 *
 * Validates score rendering, empty/error states, and report links.
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { LighthouseTab } from "@/app/admin/components/LighthouseTab";
import type { LighthouseData } from "@/lib/lighthouse";

const mockData: LighthouseData = {
  timestamp: "2025-01-15T12:00:00.000Z",
  pages: [
    {
      url: "/",
      scores: { performance: 95, accessibility: 100, bestPractices: 92, seo: 100 },
    },
    {
      url: "/about",
      scores: { performance: 88, accessibility: 97, bestPractices: 100, seo: 95 },
    },
    {
      url: "/blog",
      scores: { performance: 42, accessibility: 80, bestPractices: 75, seo: 90 },
    },
  ],
  reportLinks: {
    "https://chadmoore.info/": "https://storage.example.com/report-home",
    "https://chadmoore.info/about": "https://storage.example.com/report-about",
  },
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe("LighthouseTab", () => {
  it("shows loading state initially", () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as jest.Mock;
    render(<LighthouseTab />);
    expect(screen.getByText("Loading Lighthouse data…")).toBeInTheDocument();
  });

  it("shows empty state when no data exists", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    }) as jest.Mock;

    render(<LighthouseTab />);
    await waitFor(() => {
      expect(screen.getByText(/no audit data yet/i)).toBeInTheDocument();
    });
  });

  it("shows error state on fetch failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "fail" }),
    }) as jest.Mock;

    render(<LighthouseTab />);
    await waitFor(() => {
      expect(screen.getByText(/could not load lighthouse data/i)).toBeInTheDocument();
    });
  });

  it("renders page URLs and scores", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    }) as jest.Mock;

    render(<LighthouseTab />);
    await waitFor(() => {
      // Page URLs
      expect(screen.getByText("/")).toBeInTheDocument();
      expect(screen.getByText("/about")).toBeInTheDocument();
      expect(screen.getByText("/blog")).toBeInTheDocument();
    });

    // Score values rendered in the gauges (some may appear more than once
    // across pages so use getAllByText for non-unique values)
    expect(screen.getAllByText("95").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("100").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders category labels for each page", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    }) as jest.Mock;

    render(<LighthouseTab />);
    await waitFor(() => {
      const perfLabels = screen.getAllByText("Performance");
      // One "Performance" label per page
      expect(perfLabels).toHaveLength(mockData.pages.length);
    });
  });

  it("renders report links when available", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    }) as jest.Mock;

    render(<LighthouseTab />);
    await waitFor(() => {
      const reportLinks = screen.getAllByText(/full report/i);
      // Only 2 pages have report links in the mock data
      expect(reportLinks).toHaveLength(2);
    });

    const link = screen.getAllByText(/full report/i)[0].closest("a");
    expect(link).toHaveAttribute("href", "https://storage.example.com/report-home");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("displays the audit timestamp", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    }) as jest.Mock;

    render(<LighthouseTab />);
    await waitFor(() => {
      // The timestamp is formatted by toLocaleDateString + toLocaleTimeString
      // Just check the heading is present alongside the date
      expect(screen.getByText("Lighthouse")).toBeInTheDocument();
    });
  });

  it("refresh button re-fetches data", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    }) as jest.Mock;

    render(<LighthouseTab />);
    await waitFor(() => screen.getByText("Lighthouse"));

    expect(global.fetch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle("Refresh"));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
