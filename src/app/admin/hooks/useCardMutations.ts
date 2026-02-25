/**
 * useCardMutations — CRUD for homepage feature cards.
 */
import { useCallback } from "react";
import type { ContentData, FeatureCard } from "@/lib/contentData";

export function useCardMutations(
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void,
) {
  const updateCard = useCallback(
    (index: number, field: keyof FeatureCard, value: string) => {
      updateField("home", (home) => {
        const cards = [...home.featureCards];
        cards[index] = { ...cards[index], [field]: value };
        return { ...home, featureCards: cards };
      });
    },
    [updateField],
  );

  const addCard = useCallback(() => {
    updateField("home", (home) => ({
      ...home,
      featureCards: [...home.featureCards, { title: "", description: "", icon: "integration" }],
    }));
  }, [updateField]);

  const removeCard = useCallback(
    (index: number) => {
      updateField("home", (home) => {
        const cards = [...home.featureCards];
        cards.splice(index, 1);
        return { ...home, featureCards: cards };
      });
    },
    [updateField],
  );

  return { updateCard, addCard, removeCard };
}
