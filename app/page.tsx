"use client";

import { DiagramCanvas } from "@/components/diagram/DiagramCanvas";
import { PropertyInspector } from "@/components/inspector/PropertyInspector";
import { useStore } from "@/store/useStore";
import { Plus, Settings, Undo, Redo } from "lucide-react";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

export default function Home() {
  const {
    setPendingPosition,
    setIsModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    undo,
    redo,
  } = useStore();

  const handleAddNode = () => {
    setPendingPosition({ x: 100, y: 100 });
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-black">
      <main className="relative flex-1">
        <DiagramCanvas />

        <button
          onClick={handleAddNode}
          className="cursor-pointer absolute bottom-4 left-12 flex items-center gap-2 rounded-full bg-blue-400 px-4 py-2 text-white shadow-lg hover:bg-blue-300 transition-colors"
        >
          <Plus size={20} />
          Add Node
        </button>

        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={undo}
            className="cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10"
          >
            <Undo size={20} />
          </button>
          <button
            onClick={redo}
            className="cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10"
          >
            <Redo size={20} />
          </button>
          <ThemeSwitcher />
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10"
          >
            <Settings size={20} />
          </button>
        </div>

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </main>

      <aside className="h-full">
        <PropertyInspector />
      </aside>
    </div>
  );
}
