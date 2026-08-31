"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useStagePlanStore } from "../../store/useStagePlanStore";
import { CableTypeList } from "./CableTypeList";
import { NodeColorList } from "./NodeColorList";
import { LocationList } from "./LocationList";
import { TypeList } from "./TypeList";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertyInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    />
  </div >
);

const PropertySection = ({
  title,
  hideTitle,
  onToggleHideTitle,
  hideDate,
  onToggleHideDate,
  properties,
  extraToggles,
}: {
  title: string;
  hideTitle: boolean;
  onToggleHideTitle: () => void;
  hideDate: boolean;
  onToggleHideDate: () => void;
  properties: {
    label: string;
    value: string;
    onChange: (val: string) => void;
  }[];
  extraToggles?: {
    id: string;
    label: string;
    checked: boolean;
    onToggle: () => void;
  }[];
}) => {
  const safeId = (id: string) => id.replace(/\s+/g, "-").toLowerCase();
  const titleId = safeId(title);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
        {title}
      </h3>
      <div className="grid min-h-[76px] grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${titleId}-hide-title`}
            className="w-4 h-4 cursor-pointer"
            checked={hideTitle}
            onChange={onToggleHideTitle}
          />
          <label htmlFor={`${titleId}-hide-title`} className="text-sm font-medium cursor-pointer">
            Hide Title
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${titleId}-hide-date`}
            className="w-4 h-4 cursor-pointer"
            checked={hideDate}
            onChange={onToggleHideDate}
          />
          <label htmlFor={`${titleId}-hide-date`} className="text-sm font-medium cursor-pointer">
            Hide Date
          </label>
        </div>
        {extraToggles?.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${titleId}-${t.id}`}
              className="w-4 h-4 cursor-pointer"
              checked={t.checked}
              onChange={t.onToggle}
            />
            <label
              htmlFor={`${titleId}-${t.id}`}
              className="text-sm font-medium cursor-pointer"
            >
              {t.label}
            </label>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {properties.map((prop) => (
          <PropertyInput key={prop.label} {...prop} />
        ))}
      </div>
    </div>
  );
};

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const riderListTitle = useStore((s) => s.riderListTitle);
  const riderListSubtitle = useStore((s) => s.riderListSubtitle);
  const riderListPreparedBy = useStore((s) => s.riderListPreparedBy);
  const updateRiderListTitle = useStore((s) => s.updateRiderListTitle);
  const updateRiderListSubtitle = useStore((s) => s.updateRiderListSubtitle);
  const updateRiderListPreparedBy = useStore((s) => s.updateRiderListPreparedBy);
  const canvasTitle = useStore((s) => s.canvasTitle);
  const canvasSubtitle = useStore((s) => s.canvasSubtitle);
  const canvasPreparedBy = useStore((s) => s.canvasPreparedBy);
  const updateCanvasTitle = useStore((s) => s.updateCanvasTitle);
  const updateCanvasSubtitle = useStore((s) => s.updateCanvasSubtitle);
  const updateCanvasPreparedBy = useStore((s) => s.updateCanvasPreparedBy);
  const hideTitle = useStore((s) => s.hideTitle);
  const hideRiderTitle = useStore((s) => s.hideRiderTitle);
  const toggleHideTitle = useStore((s) => s.toggleHideTitle);
  const toggleHideRiderTitle = useStore((s) => s.toggleHideRiderTitle);
  const hideDate = useStore((s) => s.hideDate);
  const hideRiderDate = useStore((s) => s.hideRiderDate);
  const toggleHideDate = useStore((s) => s.toggleHideDate);
  const toggleHideRiderDate = useStore((s) => s.toggleHideRiderDate);
  const hideLegend = useStore((s) => s.hideLegend);
  const toggleHideLegend = useStore((s) => s.toggleHideLegend);
  const hideCableLabels = useStore((s) => s.hideCableLabels);
  const toggleHideCableLabels = useStore((s) => s.toggleHideCableLabels);
  const hideDetailsSignalFlow = useStore((s) => s.hideDetailsSignalFlow);
  const toggleHideDetailsSignalFlow = useStore((s) => s.toggleHideDetailsSignalFlow);
  const edgeRounding = useStore((s) => s.edgeRounding);
  const setEdgeRounding = useStore((s) => s.setEdgeRounding);
  const defaultLineType = useStore((s) => s.defaultLineType);
  const setDefaultLineType = useStore((s) => s.setDefaultLineType);
  const defaultLabelFontSize = useStore((s) => s.defaultLabelFontSize);
  const defaultDetailsFontSize = useStore((s) => s.defaultDetailsFontSize);
  const setDefaultLabelFontSize = useStore((s) => s.setDefaultLabelFontSize);
  const setDefaultDetailsFontSize = useStore((s) => s.setDefaultDetailsFontSize);
  const [activeTab, setActiveTab] = useState<"lists" | "properties">("lists");

  const stagePlanTitle = useStagePlanStore((s) => s.title);
  const stagePlanSubtitle = useStagePlanStore((s) => s.subtitle);
  const stagePlanPreparedBy = useStagePlanStore((s) => s.preparedBy);
  const updateStagePlanTitle = useStagePlanStore((s) => s.updateTitle);
  const updateStagePlanSubtitle = useStagePlanStore((s) => s.updateSubtitle);
  const updateStagePlanPreparedBy = useStagePlanStore((s) => s.updatePreparedBy);
  const hideStagePlanTitle = useStagePlanStore((s) => s.hideStagePlanTitle);
  const toggleHideStagePlanTitle = useStagePlanStore((s) => s.toggleHideStagePlanTitle);
  const hideStagePlanDate = useStagePlanStore((s) => s.hideStagePlanDate);
  const toggleHideStagePlanDate = useStagePlanStore((s) => s.toggleHideStagePlanDate);
  const hideDetailsStagePlan = useStagePlanStore((s) => s.hideDetailsStagePlan);
  const toggleHideDetailsStagePlan = useStagePlanStore((s) => s.toggleHideDetailsStagePlan);
  const stagePlanDefaultLabelFontSize = useStagePlanStore((s) => s.defaultLabelFontSize);
  const stagePlanDefaultDetailsFontSize = useStagePlanStore((s) => s.defaultDetailsFontSize);
  const stagePlanSetDefaultLabelFontSize = useStagePlanStore((s) => s.setDefaultLabelFontSize);
  const stagePlanSetDefaultDetailsFontSize = useStagePlanStore((s) => s.setDefaultDetailsFontSize);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
          {(
            [
              { id: "lists", label: "Categories" },
              { id: "properties", label: "Properties" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px cursor-pointer border-b-2 pb-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-blue-500 text-zinc-900 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "lists" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TypeList />
            <LocationList />
            <CableTypeList />
            <NodeColorList />
          </div>
        ) : (
          <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PropertySection
              title="Rider List"
              hideTitle={hideRiderTitle}
              onToggleHideTitle={toggleHideRiderTitle}
              hideDate={hideRiderDate}
              onToggleHideDate={toggleHideRiderDate}
              properties={[
                { label: "Title", value: riderListTitle, onChange: updateRiderListTitle },
                { label: "Subtitle", value: riderListSubtitle, onChange: updateRiderListSubtitle },
                { label: "Prepared By", value: riderListPreparedBy, onChange: updateRiderListPreparedBy },
              ]}
            />
            <PropertySection
              title="Signal Flow"
              hideTitle={hideTitle}
              onToggleHideTitle={toggleHideTitle}
              hideDate={hideDate}
              onToggleHideDate={toggleHideDate}
              properties={[
                { label: "Title", value: canvasTitle, onChange: updateCanvasTitle },
                { label: "Subtitle", value: canvasSubtitle, onChange: updateCanvasSubtitle },
                { label: "Prepared By", value: canvasPreparedBy, onChange: updateCanvasPreparedBy },
              ]}
              extraToggles={[
                {
                  id: "hide-legend",
                  label: "Hide Legend",
                  checked: hideLegend,
                  onToggle: toggleHideLegend,
                },
                {
                  id: "hide-cable-labels",
                  label: "Hide Cable Labels",
                  checked: hideCableLabels,
                  onToggle: toggleHideCableLabels,
                },
                {
                  id: "hide-details",
                  label: "Hide Details",
                  checked: hideDetailsSignalFlow,
                  onToggle: toggleHideDetailsSignalFlow,
                },
              ]}
            />
            <PropertySection
              title="Stage Plan"
              hideTitle={hideStagePlanTitle}
              onToggleHideTitle={toggleHideStagePlanTitle}
              hideDate={hideStagePlanDate}
              onToggleHideDate={toggleHideStagePlanDate}
              properties={[
                { label: "Title", value: stagePlanTitle, onChange: updateStagePlanTitle },
                { label: "Subtitle", value: stagePlanSubtitle, onChange: updateStagePlanSubtitle },
                { label: "Prepared By", value: stagePlanPreparedBy, onChange: updateStagePlanPreparedBy },
              ]}
              extraToggles={[
                {
                  id: "hide-details",
                  label: "Hide Details",
                  checked: hideDetailsStagePlan,
                  onToggle: toggleHideDetailsStagePlan,
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-y-2 md:grid-cols-3 md:gap-x-8">
          {/* Edge Routing Section */}
          <div className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
              Edge Routing
            </h3>
            <div className="flex items-center gap-2">
              <label htmlFor="edge-rounding" className="text-sm font-medium cursor-pointer">
                Corner radius
              </label>
              <input
                id="edge-rounding"
                type="number"
                min={0}
                max={24}
                value={edgeRounding}
                onChange={(e) => setEdgeRounding(Number(e.target.value))}
                className="w-16 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <label htmlFor="default-line-type" className="text-sm font-medium cursor-pointer">
                Default line type
              </label>
              <select
                id="default-line-type"
                value={defaultLineType}
                onChange={(e) => setDefaultLineType(e.target.value)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="labeledSmoothstep">SmoothStep</option>
                <option value="labeledStep">Step</option>
                <option value="labeledStraight">Straight</option>
                <option value="labeledBezier">Bezier</option>
              </select>
            </div>
          </div>

          {/* Default Font Sizes Section */}
          <div className="border-t border-zinc-200 pt-8 dark:border-zinc-800 md:col-span-2">
            <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
              Default Font Sizes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1">
                <label htmlFor="sf-default-label-font-size" className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Signal Flow Label (px)
                </label>
                <input
                  id="sf-default-label-font-size"
                  type="number"
                  min={8}
                  max={48}
                  value={defaultLabelFontSize}
                  onChange={(e) => setDefaultLabelFontSize(Math.max(8, Math.min(48, Number(e.target.value))))}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sf-default-details-font-size" className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Signal Flow Details (px)
                </label>
                <input
                  id="sf-default-details-font-size"
                  type="number"
                  min={8}
                  max={48}
                  value={defaultDetailsFontSize}
                  onChange={(e) => setDefaultDetailsFontSize(Math.max(8, Math.min(48, Number(e.target.value))))}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sp-default-label-font-size" className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Stage Plan Label (px)
                </label>
                <input
                  id="sp-default-label-font-size"
                  type="number"
                  min={8}
                  max={48}
                  value={stagePlanDefaultLabelFontSize}
                  onChange={(e) => stagePlanSetDefaultLabelFontSize(Math.max(8, Math.min(48, Number(e.target.value))))}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sp-default-details-font-size" className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Stage Plan Details (px)
                </label>
                <input
                  id="sp-default-details-font-size"
                  type="number"
                  min={8}
                  max={48}
                  value={stagePlanDefaultDetailsFontSize}
                  onChange={(e) => stagePlanSetDefaultDetailsFontSize(Math.max(8, Math.min(48, Number(e.target.value))))}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
          </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
