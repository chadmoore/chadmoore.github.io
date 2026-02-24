/**
 * Tests for DevEditLink — dev-only edit button on blog pages.
 */
import { render, screen } from "@testing-library/react";
import DevEditLink from "@/components/DevEditLink";

describe("DevEditLink", () => {
  it("renders an edit link in non-production environments", () => {
    render(<DevEditLink slug="hello-world" />);
    const link = screen.getByText("Edit");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/admin?tab=blog&edit=hello-world");
  });

  it("includes a title attribute for accessibility", () => {
    render(<DevEditLink slug="hello-world" />);
    expect(screen.getByTitle(/edit this post/i)).toBeInTheDocument();
  });
});
