import { X, List, FileDown, FileSpreadsheet, FileJson, ChevronDown, ChevronUp } from "lucide-react";
import { type NodeListHeaderProps } from "../node-list-modal-types";
import { useStore } from "@/store/useStore";

export const NodeListHeader = ({
  onClose,
  onExport,
  title,
  subtitle,
  preparedBy,
  exportMenuOpen,
  setExportMenuOpen,
}: NodeListHeaderProps & {
  exportMenuOpen: boolean;
  setExportMenuOpen: (open: boolean) => void;
}) => {
   const updateTitle = useStore((s) => s.updateRiderListTitle);
   const updateSubtitle = useStore((s) => s.updateRiderListSubtitle);
   const updatePreparedBy = useStore((s) => s.updateRiderListPreparedBy);
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
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExportMenuOpen(!exportMenuOpen);
                }}
                className="cursor-pointer rounded-md flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <FileDown size={18} />
                Export
                {exportMenuOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {exportMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-md bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport?.("pdf");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-t-md"
                  >
                    <FileDown size={16} />
                    Export PDF
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport?.("csv");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <FileSpreadsheet size={16} />
                    Export CSV
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport?.("json");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-b-md"
                  >
                    <FileJson size={16} />
                    Export JSON
                  </button>
                </div>
              )}
            </div>
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
