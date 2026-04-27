import { X, List, FileDown } from "lucide-react";
import { type NodeListHeaderProps } from "../node-list-modal-types";
import { useStore } from "@/store/useStore";

export const NodeListHeader = ({
  onClose,
  onExport,
  title,
  subtitle,
  preparedBy,
}: NodeListHeaderProps) => {
   const updateTitle = useStore((s) => s.updateCanvasTitle);
   const updateSubtitle = useStore((s) => s.updateCanvasSubtitle);
   const updatePreparedBy = useStore((s) => s.updateCanvasPreparedBy);
  return (
    <div className=" p-6 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
            <List size={24} />
            List
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="cursor-pointer rounded-md flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <FileDown size={18} />
              Export PDF
            </button>
          )}
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 py-2">
        <input
          type="text"
          id="title-input"
          value={title}
          onChange={(e) => updateTitle(e.target.value)}
          className="flex-1 text-sm font-semibold border-b border-zinc-300 dark:border-zinc-700 bg-transparent focus:border-blue-500 dark:focus:border-blue-400 placeholder-zinc-400 dark:placeholder-zinc-600"
          placeholder="Technical Rider"
        />

        <input
          type="text"
          id="title-input"
          value={subtitle}
          onChange={(e) => updateSubtitle(e.target.value)}
          className="flex-1 text-sm border-b border-zinc-300 dark:border-zinc-700 bg-transparent focus:border-blue-500 dark:focus:border-blue-400 placeholder-zinc-400 dark:placeholder-zinc-600"
          placeholder="I go to school by bus"
        />

        <input
          type="text"
          id="prepared-by-input"
          value={preparedBy}
          onChange={(e) => updatePreparedBy(e.target.value)}
          className="flex-1 text-sm border-b border-zinc-300 dark:border-zinc-700 bg-transparent focus:border-blue-500 dark:focus:border-blue-400 placeholder-zinc-400 dark:placeholder-zinc-600"
          placeholder="Prepared by..."
        />
      </div>
    </div>
  );
};
