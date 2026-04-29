"use client";

import { ContentBlock } from "./ContentBlock";
import { InnerTabs, type InnerTabSpec } from "@/features/browser/InnerTabs";
import { MaterialsView } from "@/features/browser/sofia/MaterialsView";
import { WorkoutsView } from "@/features/browser/sofia/WorkoutsView";
import { ExamsView } from "@/features/browser/sofia/ExamsView";
import { CalculatorsView } from "@/features/browser/sofia/CalculatorsView";
import { ProgressView } from "@/features/browser/sofia/ProgressView";
import { TasksView } from "@/features/browser/proxima/TasksView";
import { useBlocksStore } from "@/stores/useBlocksStore";
import {
  useBrowserStore,
  type SofiaTab,
  type ProximaTab,
} from "@/stores/useBrowserStore";
import { useModuleStore } from "@/stores/useModuleStore";
import { useHydrated } from "@/hooks/useHydrated";

const SOFIA_TABS: InnerTabSpec<SofiaTab>[] = [
  { id: "materials", label: "Материалы" },
  { id: "workouts", label: "Тренировки" },
  { id: "exams", label: "Экзамены" },
  { id: "calculators", label: "Калькуляторы" },
  { id: "progress", label: "Прогресс" },
];

const PROXIMA_TABS: InnerTabSpec<ProximaTab>[] = [
  { id: "tasks", label: "Задачи" },
];

export function BrowserBlock() {
  const hydrated = useHydrated();
  const collapsed = useBlocksStore((s) => s.collapsed.browser);
  const toggle = useBlocksStore((s) => s.toggle);
  const moduleId = useModuleStore((s) => s.module);
  const sofiaTab = useBrowserStore((s) => s.sofiaTab);
  const proximaTab = useBrowserStore((s) => s.proximaTab);
  const setSofiaTab = useBrowserStore((s) => s.setSofiaTab);
  const setProximaTab = useBrowserStore((s) => s.setProximaTab);

  // SSR-safe defaults
  const activeModule = hydrated ? moduleId : "sofia";

  return (
    <ContentBlock
      ariaLabel="Browser"
      collapsed={collapsed}
      onToggle={() => toggle("browser")}
    >
      {activeModule === "sofia" ? (
        <>
          <InnerTabs
            tabs={SOFIA_TABS}
            active={sofiaTab}
            onChange={setSofiaTab}
          />
          {sofiaTab === "materials" && <MaterialsView />}
          {sofiaTab === "workouts" && <WorkoutsView />}
          {sofiaTab === "exams" && <ExamsView />}
          {sofiaTab === "calculators" && <CalculatorsView />}
          {sofiaTab === "progress" && <ProgressView />}
        </>
      ) : (
        <>
          <InnerTabs
            tabs={PROXIMA_TABS}
            active={proximaTab}
            onChange={setProximaTab}
          />
          {proximaTab === "tasks" && <TasksView />}
        </>
      )}
    </ContentBlock>
  );
}
