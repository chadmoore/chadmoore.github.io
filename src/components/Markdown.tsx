interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  // Simple markdown-to-HTML for common patterns
  const html = content
    // Code blocks
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-surface border border-border rounded-lg p-4 overflow-x-auto my-6"><code>$2</code></pre>'
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-surface border border-border px-1.5 py-0.5 rounded text-sm">$1</code>'
    )
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-8 mb-3 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-10 mb-4 text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-10 mb-4 text-foreground">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-accent hover:text-accent-hover underline underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-border my-8" />')
    // Paragraphs — wrap lines that aren't already HTML
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
