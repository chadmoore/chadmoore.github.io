/**
 * Tests for the 404 Not Found page.
 */
import { render, screen } from "@testing-library/react";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

import NotFound from "@/app/not-found";

describe("NotFound (404) Page", () => {
  it("renders the 404 text", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("shows 'Page not found' heading", () => {
    render(<NotFound />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("has a link back to home", () => {
    render(<NotFound />);
    const link = screen.getByText("Take me home");
    expect(link.closest("a")).toHaveAttribute("href", "/");
  });
});
