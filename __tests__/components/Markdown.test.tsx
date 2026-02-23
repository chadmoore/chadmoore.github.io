/**
 * Tests for src/components/Markdown.tsx — the hand-rolled markdown renderer.
 */
import { render } from "@testing-library/react";
import Markdown from "@/components/Markdown";

describe("Markdown", () => {
  it("renders headings (h1, h2, h3)", () => {
    const { container } = render(
      <Markdown content={"# Heading 1\n## Heading 2\n### Heading 3"} />
    );

    expect(container.querySelector("h1")).toHaveTextContent("Heading 1");
    expect(container.querySelector("h2")).toHaveTextContent("Heading 2");
    expect(container.querySelector("h3")).toHaveTextContent("Heading 3");
  });

  it("renders bold text", () => {
    const { container } = render(<Markdown content="**bold text**" />);
    const strong = container.querySelector("strong");
    expect(strong).toHaveTextContent("bold text");
  });

  it("renders italic text", () => {
    const { container } = render(<Markdown content="*italic text*" />);
    const em = container.querySelector("em");
    expect(em).toHaveTextContent("italic text");
  });

  it("renders links with target=_blank", () => {
    const { container } = render(
      <Markdown content="[Google](https://google.com)" />
    );
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("href", "https://google.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("Google");
  });

  it("renders inline code", () => {
    const { container } = render(<Markdown content="Use `npm install` here" />);
    const code = container.querySelector("code");
    expect(code).toHaveTextContent("npm install");
  });

  it("renders fenced code blocks", () => {
    const { container } = render(
      <Markdown content={"```js\nconst x = 1;\n```"} />
    );
    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();
    expect(pre?.querySelector("code")).toHaveTextContent("const x = 1;");
  });

  it("renders unordered list items", () => {
    const { container } = render(
      <Markdown content={"- Item one\n- Item two\n- Item three"} />
    );
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Item one");
  });

  it("renders horizontal rules", () => {
    const { container } = render(<Markdown content={"Above\n\n---\n\nBelow"} />);
    const hr = container.querySelector("hr");
    expect(hr).toBeInTheDocument();
  });

  it("wraps plain text in paragraph tags", () => {
    const { container } = render(<Markdown content="Just a paragraph." />);
    const p = container.querySelector("p");
    expect(p).toHaveTextContent("Just a paragraph.");
  });

  it("handles empty content gracefully", () => {
    const { container } = render(<Markdown content="" />);
    expect(container.querySelector(".prose-custom")).toBeInTheDocument();
  });

  it("renders combined markdown correctly", () => {
    const md = [
      "# Title",
      "",
      "Some **bold** and *italic* text.",
      "",
      "- List item",
      "",
      "[Link](https://example.com)",
    ].join("\n");

    const { container } = render(<Markdown content={md} />);

    expect(container.querySelector("h1")).toHaveTextContent("Title");
    expect(container.querySelector("strong")).toHaveTextContent("bold");
    expect(container.querySelector("em")).toHaveTextContent("italic");
    expect(container.querySelector("li")).toHaveTextContent("List item");
    expect(container.querySelector("a")).toHaveAttribute("href", "https://example.com");
  });

  it("handles multiple paragraphs separated by blank lines", () => {
    const { container } = render(
      <Markdown content={"First paragraph.\n\nSecond paragraph."} />
    );
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(paragraphs[0]).toHaveTextContent("First paragraph.");
    expect(paragraphs[1]).toHaveTextContent("Second paragraph.");
  });

  it("wraps fenced code blocks in pre > code", () => {
    const { container } = render(
      <Markdown content={"```\nsome code here\n```"} />
    );
    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();
    const code = pre?.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(code).toHaveTextContent("some code here");
  });

  it("renders multiple lists properly", () => {
    const { container } = render(
      <Markdown content={"- Alpha\n- Bravo\n- Charlie"} />
    );
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(items[2]).toHaveTextContent("Charlie");
  });
});
