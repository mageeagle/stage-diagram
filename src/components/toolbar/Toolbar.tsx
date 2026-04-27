import { useRef, useCallback, useState } from "react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import {
  Settings,
  Undo,
  Redo,
  Download,
  Upload,
  List,
  HelpCircle,
  Layers,
  Trash2,
  RotateCw,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useStagePlanStore } from "@/store/useStagePlanStore";
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

  const setIsSettingsModalOpen = useStore(
    (state) => state.setIsSettingsModalOpen,
  );
  const setIsNodeListModalOpen = useStore(
    (state) => state.setIsNodeListModalOpen,
  );
  const setIsHelpModalOpen = useStore((state) => state.setIsHelpModalOpen);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const isStagePlanEnabled = useStagePlanStore((state) => state.isStagePlanEnabled);
  const setIsStagePlanEnabled = useStagePlanStore(
    (state) => state.setIsStagePlanEnabled,
  );
  const spUndo = useStagePlanStore((state) => state.undo);
  const spRedo = useStagePlanStore((state) => state.redo);

  const handleUndo = () => (isStagePlanEnabled ? spUndo() : undo());
  const handleRedo = () => (isStagePlanEnabled ? spRedo() : redo());

  const handleExport = () => {
    const {
      templates,
      nodes,
      edges,
      types,
      locations,
      cableTypes,
      title,
      subtitle,
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
      subtitle,
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
    [],
  );

  const onHover = (key: string) => () => setHoveredKey(key);

  const onLeave = () => setHoveredKey(null);

  const getHoverState = (key: string) => hoveredKey === key;
  const importFunction = () => {
    fileInputRef.current?.click();
  };
  const buttons: ToolbarButton[] = [
    {
      key: "export",
      title: "Export Project",
      onClick: handleExport,
    },
    {
      key: "node-list",
      title: "List",
      onClick: () => setIsNodeListModalOpen(true),
    },
    {
      key: "undo",
      title: "Undo",
      onClick: handleUndo,
    },
    {
      key: "redo",
      title: "Redo",
      onClick: handleRedo,
    },
  ];

  const additionalButtons: ToolbarButton[] = [
    {
      key: "stage-plan",
      title: "Stage Plan",
      onClick: () => setIsStagePlanEnabled(!isStagePlanEnabled),
    },
    {
      key: "settings",
      title: "Settings",
      onClick: () => setIsSettingsModalOpen(true),
    },
    {
      key: "help",
      title: "Info",
      onClick: () => setIsHelpModalOpen(true),
    },
  ];

  const buttonStyle =
    "cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10";

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
        <div key={"import"} className="relative">
          <Tooltip
            position="bottom"
            isVisible={getHoverState("import")}
            content={"Import Project"}
            className="absolute top-full mt-2"
          />
          <button
            onMouseEnter={onHover("import")}
            onMouseLeave={onLeave}
            onClick={importFunction}
            className={buttonStyle}
            title={"Import Project"}
          >
            <Upload size={20} />
          </button>
        </div>
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
        <div
          className="relative"
          onMouseEnter={onHover("theme")}
          onMouseLeave={onLeave}
        >
          <Tooltip
            position="bottom"
            isVisible={getHoverState("theme")}
            content="Theme"
            className="absolute top-full mt-2"
          />
          <ThemeSwitcher />
        </div>
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
                {button.key === "stage-plan" && <Layers size={20} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
