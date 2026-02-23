/**
 * Markdown Renderer — The hand-rolled edition.
 *
 * "But there are a hundred markdown libraries on npm!"
 *
 * Sure. And they all pull in 50KB+ of dependencies for features
 * a personal blog doesn't need (footnotes, tables, task lists,
 * math equations, emoji shortcodes...).
 *
 * This is ~40 lines of regex that handle the 80% case:
 *  - Headings (h1-h3)
 *  - Bold, italic
 *  - Links (open in new tab for safety)
 *  - Inline code and fenced code blocks
 *  - Unordered lists
 *  - Horizontal rules
 *  - Auto-wrapped paragraphs
 *
 * If you need more, swap this out for react-markdown or MDX.
 * But honestly? This has worked fine so far.
 *
 * // Fun challenge: try writing a blog post that breaks this parser.
 * // If you find one, open a PR. Bonus points for creativity.
 */
interface MarkdownProps {
  /** Raw markdown string to render as HTML */
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  // Transform markdown to HTML via sequential regex replacements.
  // Order matters: code blocks must be processed before inline code,
  // and headers before bold (to avoid ** inside ### matching wrong).
  const html = content
    // Fenced code blocks: ```lang\n...```
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-surface border border-border rounded-lg p-4 overflow-x-auto my-6"><code>$2</code></pre>'
    )
    // Inline code: `code`
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-surface border border-border px-1.5 py-0.5 rounded text-sm">$1</code>'
    )
    // Headers: ### > ## > # (processed largest-first to prevent partial matches)
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-8 mb-3 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-10 mb-4 text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-10 mb-4 text-foreground">$1</h1>')
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text*
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links: [text](url) — all external links open in a new tab
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-accent hover:text-accent-hover underline underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // Unordered lists: - item
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted">$1</li>')
    // Horizontal rules: ---
    .replace(/^---$/gm, '<hr class="border-border my-8" />')
    // Paragraphs: wrap remaining non-HTML lines
    .replace(
      /^(?!<[a-z])((?!^$).+)$/gm,
      '<p class="text-muted leading-relaxed mb-4">$1</p>'
    );

  return (
    <div
      className="prose-custom"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
