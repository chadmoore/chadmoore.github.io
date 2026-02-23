/**
 * Tests for src/components/Footer.tsx
 */
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("renders the current year in the copyright", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("renders 'Chad Moore' in the copyright", () => {
    render(<Footer />);
    expect(screen.getByText(/Chad Moore/)).toBeInTheDocument();
  });

  it("has an email link", () => {
    render(<Footer />);
    const emailLink = screen.getByText("Email");
    expect(emailLink.closest("a")).toHaveAttribute("href", "mailto:chad@chadmoore.info");
  });

  it("has a LinkedIn link that opens in a new tab", () => {
    render(<Footer />);
    const linkedInLink = screen.getByText("LinkedIn");
    const anchor = linkedInLink.closest("a");
    expect(anchor).toHaveAttribute("href", "https://www.linkedin.com/in/chad-moore-info");
    expect(anchor).toHaveAttribute("target", "_blank");
  });

  it("has a GitHub link that opens in a new tab", () => {
    render(<Footer />);
    const githubLink = screen.getByText("GitHub");
    const anchor = githubLink.closest("a");
    expect(anchor).toHaveAttribute("href", "https://github.com/chadmoore");
    expect(anchor).toHaveAttribute("target", "_blank");
  });
});
