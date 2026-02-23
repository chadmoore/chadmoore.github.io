/**
 * Tests for src/app/projects/page.tsx — projects page wrapper.
 */
import { render, screen } from "@testing-library/react";

// Mock ProjectsList since it makes network requests
jest.mock("@/components/ProjectsList", () => {
  return function MockProjectsList() {
    return <div data-testid="projects-list">Mocked ProjectsList</div>;
  };
});

import ProjectsPage from "@/app/projects/page";

describe("ProjectsPage", () => {
  it("renders the Projects heading", () => {
    render(<ProjectsPage />);
    expect(
      screen.getByRole("heading", { level: 1 })
    ).toHaveTextContent("Projects");
  });

  it("renders the page description", () => {
    render(<ProjectsPage />);
    expect(
      screen.getByText(/A selection of my public repositories/)
    ).toBeInTheDocument();
  });

  it("renders the ProjectsList component", () => {
    render(<ProjectsPage />);
    expect(screen.getByTestId("projects-list")).toBeInTheDocument();
  });
});
