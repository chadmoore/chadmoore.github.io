/**
 * HomeTab — greeting + feature card editor.
 */
import type { ContentData, FeatureCard } from "@/lib/contentData";
import { ICON_OPTIONS } from "../constants";
import { Field, inputClass } from "./Field";

interface HomeTabProps {
  data: ContentData;
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void;
  updateCard: (index: number, field: keyof FeatureCard, value: string) => void;
  addCard: () => void;
  removeCard: (index: number) => void;
}

export function HomeTab({ data, updateField, updateCard, addCard, removeCard }: HomeTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Homepage</h2>

      <div className="bg-surface border border-border rounded-lg p-4">
        <Field label="Greeting (shown above name)">
          <input
            type="text"
            value={data.home.greeting}
            onChange={(e) => updateField("home", (home) => ({ ...home, greeting: e.target.value }))}
            aria-label="Greeting"
            className={inputClass}
          />
        </Field>
      </div>

      <h3 className="font-medium">Feature Cards</h3>
      <div className="space-y-4">
        {data.home.featureCards.map((card, index) => (
          <div key={index} className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Card {index + 1}</span>
              <button
                onClick={() => removeCard(index)}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                title="Remove card"
              >
                ✕
              </button>
            </div>
            <Field label="Title">
              <input
                type="text"
                value={card.title}
                onChange={(e) => updateCard(index, "title", e.target.value)}
                aria-label="Card title"
                className={inputClass}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={card.description}
                onChange={(e) => updateCard(index, "description", e.target.value)}
                rows={2}
                aria-label="Card description"
                className={inputClass + " resize-y"}
              />
            </Field>
            <Field label="Icon">
              <select
                value={card.icon}
                onChange={(e) => updateCard(index, "icon", e.target.value)}
                aria-label="Card icon"
                className={inputClass}
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </Field>
          </div>
        ))}
        <button
          onClick={addCard}
          className="text-xs text-accent hover:text-accent-hover transition-colors"
        >
          + Add Card
        </button>
      </div>
    </div>
  );
}
