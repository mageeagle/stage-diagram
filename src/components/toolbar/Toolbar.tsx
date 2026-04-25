import { useRef } from "react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { Settings, Undo, Redo, Download, Upload, List } from "lucide-react";
import { useStore } from "@/store/useStore";
import { exportProject, importProject } from "@/utils/projectIO";

export const Toolbar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setIsSettingsModalOpen = useStore((state) => state.setIsSettingsModalOpen);
  const setIsNodeListModalOpen = useStore((state) => state.setIsNodeListModalOpen);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);

  const handleExport = () => {
    const {
      templates,
      nodes,
      edges,
      types,
      locations,
      cableTypes,
      title,
      preparedBy,
    } = useStore.getState();

    exportProject({
      templates,
      nodes,
      edges,
      types,
      locations,
      cableTypes,
      title,
      preparedBy,
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const loadedFile = e.target.files?.[0];
    if (!loadedFile) return;

    try {
      const state = await importProject(loadedFile);
      useStore.getState().restoreProjectState(state);
    } catch (error) {
      console.error("Failed to import project:", error);
    }
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
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
        title="Node List"
      >
        <List size={20} />
      </button>
      <button
        onClick={undo}
        className="cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10"
        title="Undo"
      >
        <Undo size={20} />
      </button>
      <button
        onClick={redo}
        className="cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10"
        title="Redo"
      >
        <Redo size={20} />
      </button>
      <ThemeSwitcher />
      <button
        onClick={() => setIsSettingsModalOpen(true)}
        className="cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10"
        title="Settings"
      >
        <Settings size={20} />
      </button>
    </div>
  );
};
