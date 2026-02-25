/**
 * Field — shared labeled input wrapper for the admin panel.
 */

export const inputClass =
  "w-full bg-background border border-border rounded px-2 py-1 text-sm [color-scheme:light] dark:[color-scheme:dark]";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}
