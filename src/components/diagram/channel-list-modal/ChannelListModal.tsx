"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/store/useStore";
import { useSaveAs } from "@/hooks/useSaveAs";
import { type ExportFormat } from "../node-list-modal-types";
import { ChannelListHeader } from "./ChannelListHeader";
import { ChannelListColumn } from "./ChannelListColumn";
import { generateChannelListReport } from "./channel-list-report-generator";
import { exportToPdf } from "./pdf-export-utils";
import { exportToCsv, exportToJson } from "./export-utils";

export interface ChannelListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChannelListModal = ({ isOpen, onClose }: ChannelListModalProps) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const title = useStore((s) => s.channelListTitle);
  const subtitle = useStore((s) => s.channelListSubtitle);
  const preparedBy = useStore((s) => s.channelListPreparedBy);
  const nodes = useStore((s) => s.nodes);

  const doSaveAsExport = useSaveAs(title || "channel-list");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (exportMenuOpen) setExportMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [exportMenuOpen]);

  const handleExport = (format: ExportFormat) => {
    setExportMenuOpen(false);
    const extension = format === "pdf" ? "pdf" : format === "csv" ? "csv" : "json";
    doSaveAsExport(extension, (filename: string) => {
      const report = generateChannelListReport(nodes);
      switch (format) {
        case "pdf":
          exportToPdf(title, subtitle, preparedBy, report, filename);
          break;
        case "csv":
          exportToCsv(title, subtitle, report, filename);
          break;
        case "json":
          exportToJson(title, subtitle, preparedBy, report, filename);
          break;
      }
    });
  };

  if (!isOpen) return null;

  const report = generateChannelListReport(nodes);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-7xl rounded-lg bg-white shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <ChannelListHeader
          onClose={onClose}
          onExport={handleExport}
          title={title}
          subtitle={subtitle}
          preparedBy={preparedBy}
          exportMenuOpen={exportMenuOpen}
          setExportMenuOpen={setExportMenuOpen}
        />

        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <ChannelListColumn title="Inputs" rows={report.inputs} />
            <ChannelListColumn title="Outputs" rows={report.outputs} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
