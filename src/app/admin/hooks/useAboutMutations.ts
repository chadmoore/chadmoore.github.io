/**
 * useAboutMutations — CRUD for about-page intro paragraphs.
 */
import { useCallback } from "react";
import type { ContentData } from "@/lib/contentData";

export function useAboutMutations(
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void,
) {
  const updateIntroParagraph = useCallback(
    (index: number, value: string) => {
      updateField("about", (about) => {
        const intro = [...about.intro];
        intro[index] = value;
        return { ...about, intro };
      });
    },
    [updateField],
  );

  const addIntroParagraph = useCallback(() => {
    updateField("about", (about) => ({
      ...about,
      intro: [...about.intro, ""],
    }));
  }, [updateField]);

  const removeIntroParagraph = useCallback(
    (index: number) => {
      updateField("about", (about) => {
        const intro = [...about.intro];
        intro.splice(index, 1);
        return { ...about, intro };
      });
    },
    [updateField],
  );

  return { updateIntroParagraph, addIntroParagraph, removeIntroParagraph };
}
