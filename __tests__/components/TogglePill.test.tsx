import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TogglePill from "@/components/TogglePill";

describe("TogglePill", () => {
  it("renders the label", () => {
    render(<TogglePill label="TypeScript" active={false} onClick={() => {}} />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("sets aria-pressed to 'true' when active", () => {
    render(<TogglePill label="TypeScript" active={true} onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("sets aria-pressed to 'false' when inactive", () => {
    render(<TogglePill label="TypeScript" active={false} onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<TogglePill label="TypeScript" active={false} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies active styles when active", () => {
    render(<TogglePill label="TypeScript" active={true} onClick={() => {}} />);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/border-accent/);
  });

  it("applies inactive styles (line-through) when inactive", () => {
    render(<TogglePill label="TypeScript" active={false} onClick={() => {}} />);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/line-through/);
  });
});
