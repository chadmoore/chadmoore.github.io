/**
 * useTabDragReorder — drag-to-reorder tab buttons in the admin panel.
 */
import { useState, useCallback, useMemo } from "react";
import type { ContentData } from "@/lib/contentData";
import type { Tab } from "../types";
import { TAB_LABELS } from "../types";

/** Tabs that are pinned (not draggable, don't affect nav order). */
const PINNED_TABS = new Set<Tab>(["site", "skills", "import"]);

export function useTabDragReorder(
  data: ContentData | null,
  updateField: <K extends keyof ContentData>(
    section: K,
    updater: (prev: ContentData[K]) => ContentData[K],
  ) => void,
) {
  const [dragTab, setDragTab] = useState<Tab | null>(null);
  const [dragOverTab, setDragOverTab] = useState<Tab | null>(null);

  /** Tab order: "site" pinned first, then in navOrder from content data. */
  const tabOrder: Tab[] = useMemo(() => {
    const order: Tab[] = ["site"];
    const navOrder = data?.site.navOrder ?? ["home", "about", "projects", "blog", "cv"];
    for (const key of navOrder) {
      if (key in TAB_LABELS && !PINNED_TABS.has(key as Tab)) order.push(key as Tab);
    }
    // Append pinned non-site tabs after nav tabs
    order.push("skills", "import");
    // Safety: append any remaining tabs missing from navOrder
    for (const key of Object.keys(TAB_LABELS) as Tab[]) {
      if (!order.includes(key)) order.push(key);
    }
    return order;
  }, [data?.site.navOrder]);

  const handleDragStart = useCallback(
    (tab: Tab) => (e: React.DragEvent) => {
      if (PINNED_TABS.has(tab)) return;
      setDragTab(tab);
      e.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleDragOver = useCallback(
    (tab: Tab) => (e: React.DragEvent) => {
      if (PINNED_TABS.has(tab)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverTab(tab);
    },
    [],
  );

  const handleDrop = useCallback(
    (targetTab: Tab) => (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragTab || dragTab === targetTab || !data) return;
      if (PINNED_TABS.has(targetTab) || PINNED_TABS.has(dragTab)) return;

      const navOrder = [...(data.site.navOrder ?? ["home", "about", "projects", "blog", "cv"])];
      const fromIndex = navOrder.indexOf(dragTab);
      const toIndex = navOrder.indexOf(targetTab);
      if (fromIndex === -1 || toIndex === -1) return;

      navOrder.splice(fromIndex, 1);
      navOrder.splice(toIndex, 0, dragTab);

      updateField("site", (site) => ({ ...site, navOrder }));
      setDragTab(null);
      setDragOverTab(null);
    },
    [dragTab, data, updateField],
  );

  const handleDragEnd = useCallback(() => {
    setDragTab(null);
    setDragOverTab(null);
  }, []);

  const clearDragOver = useCallback(() => setDragOverTab(null), []);

  return {
    tabOrder,
    dragTab,
    dragOverTab,
    PINNED_TABS,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    clearDragOver,
  };
}
