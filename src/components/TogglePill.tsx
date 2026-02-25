/**
 * TogglePill — shared filter toggle button.
 *
 * Rendered "active" (accent-coloured) when the value it represents is
 * included in the current filter. Rendered with a strikethrough when
 * inactive so the visual affordance is unambiguous.
 *
 * Used by SkillsGrid and CVExperience — extracted here to avoid
 * identical-function duplication between the two components.
 */

interface TogglePillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function TogglePill({ label, active, onClick }: TogglePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-2.5 py-0.5 rounded-full border text-xs transition-colors ${
        active
          ? "border-accent/60 text-accent bg-accent/10"
          : "border-border text-muted/40 bg-surface line-through hover:border-accent/30 hover:text-muted"
      }`}
    >
      {label}
    </button>
  );
}
