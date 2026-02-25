/**
 * useSkillMutations — CRUD operations for CV skills.
 */
import { useCallback } from "react";
import type { ContentData } from "@/lib/contentData";
import type { Skill } from "@/lib/skills";

export function useSkillMutations(
  data: ContentData | null,
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void,
) {
  const updateSkill = useCallback(
    (category: string, index: number, field: keyof Skill, value: string) => {
      if (!data) return;
      updateField("cv", (cv) => {
        const skills = { ...cv.skills };
        const list = [...skills[category]];
        list[index] = { ...list[index], [field]: value };
        skills[category] = list;
        return { ...cv, skills };
      });
    },
    [data, updateField],
  );

  const removeSkill = useCallback(
    (category: string, index: number) => {
      if (!data) return;
      updateField("cv", (cv) => {
        const skills = { ...cv.skills };
        const list = [...skills[category]];
        list.splice(index, 1);
        skills[category] = list;
        return { ...cv, skills };
      });
    },
    [data, updateField],
  );

  const addSkill = useCallback(
    (category: string) => {
      if (!data) return;
      updateField("cv", (cv) => {
        const skills = { ...cv.skills };
        const list = [...skills[category]];
        list.push({ name: "", proficiency: "proficient" });
        skills[category] = list;
        return { ...cv, skills };
      });
    },
    [data, updateField],
  );

  const addCategory = useCallback(() => {
    const name = prompt("New category name:");
    if (!name || !data) return;
    updateField("cv", (cv) => {
      const skills = { ...cv.skills };
      skills[name] = [{ name: "", proficiency: "proficient" }];
      return { ...cv, skills };
    });
  }, [data, updateField]);

  const removeCategory = useCallback(
    (category: string) => {
      if (!data) return;
      if (!confirm(`Remove "${category}" and all its skills?`)) return;
      updateField("cv", (cv) => {
        const skills = { ...cv.skills };
        delete skills[category];
        return { ...cv, skills };
      });
    },
    [data, updateField],
  );

  return { updateSkill, removeSkill, addSkill, addCategory, removeCategory };
}
