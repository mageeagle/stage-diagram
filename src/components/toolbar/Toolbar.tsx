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
  Plus,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useStagePlanStore } from "@/store/useStagePlanStore";
import { exportProject, importProject } from "@/utils/projectIO";
import { Tooltip } from "@/components/tooltip/Tooltip";

interface ToolbarButton {
  key: string;
  title: string;
  onClick: () => void;
  icon: React.JSX.Element;
}
const Button = ({ button }: { button: ToolbarButton }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const onHover = (key: string) => () => setHoveredKey(key);

  const onLeave = () => setHoveredKey(null);

  const getHoverState = (key: string) => hoveredKey === key;
  const buttonStyle =
    "cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10";

  return (
    <div key={button.key} className="relative">
      <Tooltip
        position="bottom"
        isVisible={getHoverState(button.key)}
        content={button.title}
        className="absolute top-full mt-2"
      />
      {button.key !== "theme" ? (
        <button
          onMouseEnter={onHover(button.key)}
          onMouseLeave={onLeave}
          onClick={button.onClick}
          className={buttonStyle}
          title={button.title}
        >
          {button.icon}
        </button>
      ) : (
        <div onMouseEnter={onHover(button.key)} onMouseLeave={onLeave}>
          {button.icon}
        </div>
      )}
    </div>
  );
};
export const Toolbar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setIsSettingsModalOpen = useStore(
    (state) => state.setIsSettingsModalOpen,
  );
  const setIsNodeListModalOpen = useStore(
    (state) => state.setIsNodeListModalOpen,
  );
  const setIsHelpModalOpen = useStore((state) => state.setIsHelpModalOpen);
  const setIsModalOpen = useStore((state) => state.setIsModalOpen);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const isStagePlanEnabled = useStagePlanStore(
    (state) => state.isStagePlanEnabled,
  );
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
      riderListTitle,
      riderListSubtitle,
      riderListPreparedBy,
      canvasTitle,
      canvasSubtitle,
      canvasPreparedBy,
    } = useStore.getState();

    const {
      title: stagePlanTitle,
      subtitle: stagePlanSubtitle,
      preparedBy: stagePlanPreparedBy,
    } = useStagePlanStore.getState();

    exportProject({
      templates,
      nodes,
      edges,
      types,
      locations,
      cableTypes,
      riderListTitle,
      riderListSubtitle,
      riderListPreparedBy,
      canvasTitle,
      canvasSubtitle,
      canvasPreparedBy,
      stagePlanTitle,
      stagePlanSubtitle,
      stagePlanPreparedBy,
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

  const importFunction = () => {
    fileInputRef.current?.click();
  };

  const frontButtons: ToolbarButton[] = [
    {
      key: "undo",
      title: "Undo",
      onClick: handleUndo,
      icon: <Undo size={20} />,
    },
    {
      key: "redo",
      title: "Redo",
      onClick: handleRedo,
      icon: <Redo size={20} />,
    },
    {
      key: "node-list",
      title: "List",
      onClick: () => setIsNodeListModalOpen(true),
      icon: <List size={20} />,
    },
    {
      key: "stage-plan",
      title: "Stage Plan",
      onClick: () => setIsStagePlanEnabled(!isStagePlanEnabled),
      icon: <Layers size={20} />,
    },
  ];
  const buttons: ToolbarButton[] = [
    {
      key: "export",
      title: "Export Project",
      onClick: handleExport,
      icon: <Download size={20} />,
    },
    {
      key: "settings",
      title: "Settings",
      onClick: () => setIsSettingsModalOpen(true),
      icon: <Settings size={20} />,
    },
    {
      key: "theme",
      title: "Theme",
      onClick: () => {},
      icon: <ThemeSwitcher />,
    },
    {
      key: "help",
      title: "Info",
      onClick: () => setIsHelpModalOpen(true),
      icon: <HelpCircle size={20} />,
    },
  ];

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
        {!isStagePlanEnabled && (
          <Button
            button={{
              key: "add",
              title: "Add Node",
              onClick: () => setIsModalOpen(true),
              icon: <Plus size={20} />,
            }}
          />
        )}
        {frontButtons.map((button) => (
          <Button key={button.key} button={button} />
        ))}
        <Button
          button={{
            key: "import",
            title: "Import Project",
            onClick: importFunction,
            icon: <Upload size={20} />,
          }}
        />
        {buttons.map((button) => (
          <Button key={button.key} button={button} />
        ))}
      </div>
    </div>
  );
};
