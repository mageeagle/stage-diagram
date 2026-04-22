"use client";

import { DiagramCanvas } from "@/components/diagram/DiagramCanvas";
import { PropertyInspector } from "@/components/inspector/PropertyInspector";
import { useStore } from "@/store/useStore";
import { Plus, Settings, Undo, Redo, Download, Upload, List } from "lucide-react";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { exportProject, importProject } from "@/utils/projectIO";
import { NodeListModal } from "@/components/diagram/NodeListModal";

export default function Home() {
  const {
    setPendingPosition,
    setIsModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isNodeListModalOpen,
    setIsNodeListModalOpen,
    undo,
    redo,
    nodes,
    edges,
    templates,
    types,
    locations,
    restoreProjectState,
  } = useStore();

  const handleAddNode = () => {
    setPendingPosition({ x: 100, y: 100 });
    setIsModalOpen(true);
  };

  const handleExport = () => {
    exportProject({ templates, nodes, edges, types, locations });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const loadedFile = e.target.files?.[0];
    if (loadedFile) {
      importProject(loadedFile).then((state) => restoreProjectState(state));
    }
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
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
            className="cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10"
            title="Import Project"
          >
            <Upload size={20} />
          </button>
          <button
            onClick={handleExport}
            className="cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10"
            title="Export Project"
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => setIsNodeListModalOpen(true)}
            className="cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10"
          >
            <List size={20} />
          </button>
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

        <NodeListModal
          isOpen={isNodeListModalOpen}
          onClose={() => setIsNodeListModalOpen(false)}
        />
      </main>

      <aside className="h-full">
        <PropertyInspector />
      </aside>
    </div>
  );
}
