import React, { useRef, useCallback, useState } from "react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { Settings, Undo, Redo, Download, Upload, List, HelpCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { exportProject, importProject } from "@/utils/projectIO";
import { Tooltip } from "@/components/tooltip/Tooltip";

interface ToolbarButton {
  key: string;
  title: string;
  onClick: () => void;
}

export const Toolbar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const setIsSettingsModalOpen = useStore((state) => state.setIsSettingsModalOpen);
  const setIsNodeListModalOpen = useStore((state) => state.setIsNodeListModalOpen);
  const setIsHelpModalOpen = useStore((state) => state.setIsHelpModalOpen);
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

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const loadedFile = e.target.files?.[0];
      if (!loadedFile) return;

      try {
        const state = await importProject(loadedFile);
        useStore.getState().restoreProjectState(state);
      } catch (error) {
        console.error("Failed to import project:", error);
      }
    },
    []
  );

  const onHover = (key: string) => () => setHoveredKey(key);

  const onLeave = () => setHoveredKey(null);

  const getHoverState = (key: string) => hoveredKey === key;

  const buttons: ToolbarButton[] = [
    {
      key: "import",
      title: "Import Project",
      onClick: () => fileInputRef.current?.click(),
    },
    {
      key: "export",
      title: "Export Project",
      onClick: handleExport,
    },
    {
      key: "node-list",
      title: "Node List",
      onClick: () => setIsNodeListModalOpen(true),
    },
    {
      key: "undo",
      title: "Undo",
      onClick: undo,
    },
    {
      key: "redo",
      title: "Redo",
      onClick: redo,
    },
  ];

  const additionalButtons: ToolbarButton[] = [
    {
      key: "settings",
      title: "Settings",
      onClick: () => setIsSettingsModalOpen(true),
    },
    {
      key: "help",
      title: "Help",
      onClick: () => setIsHelpModalOpen(true),
    },
  ];

  const buttonStyle = "cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10";

  return (
    <div className="absolute top-4 right-4 flex flex-col items-center gap-1 z-10">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <div className="flex items-center gap-1">
        {buttons.map((button) => (
          <div key={button.key} className="relative">
            <Tooltip
              position="bottom"
              isVisible={getHoverState(button.key)}
              content={button.title}
              className="absolute top-full mt-2"
            />
            <button
              onMouseEnter={onHover(button.key)}
              onMouseLeave={onLeave}
              onClick={button.onClick}
              className={buttonStyle}
              title={button.title}
            >
              {button.key === "import" && <Upload size={20} />}
              {button.key === "export" && <Download size={20} />}
              {button.key === "node-list" && <List size={20} />}
              {button.key === "undo" && <Undo size={20} />}
              {button.key === "redo" && <Redo size={20} />}
            </button>
          </div>
        ))}
        <ThemeSwitcher />
        <div className="flex items-center gap-1">
          {additionalButtons.map((button) => (
          <div key={button.key} className="relative">
              <Tooltip
                position="bottom"
                isVisible={getHoverState(button.key)}
                content={button.title}
                className="absolute top-full mt-2"
              />
              <button
                onMouseEnter={onHover(button.key)}
                onMouseLeave={onLeave}
                onClick={button.onClick}
                className={buttonStyle}
                title={button.title}
              >
                {button.key === "settings" && <Settings size={20} />}
                {button.key === "help" && <HelpCircle size={20} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
