"use client";

import { useStore } from "@/store/useStore";
import { TemplateList } from "./TemplateList";
import { PropertiesPanel } from "./PropertiesPanel";
import { EdgePropertiesPanel } from "./EdgePropertiesPanel";
import { StagePlanPropertiesPanel } from "./StagePlanPropertiesPanel";
import { useStagePlanStore } from "@/store/useStagePlanStore";

export const PropertyInspector = () => {
  const selectedNodeIds = useStore((state) => state.selectedNodeIds);
  const selectedEdgeIds = useStore((state) => state.selectedEdgeIds);

  const isStagePlanEnabled = useStagePlanStore((state) => state.isStagePlanEnabled);
  const stagePlanSelectedNodeIds = useStagePlanStore((state) => state.selectedNodeIds);

  if (isStagePlanEnabled && stagePlanSelectedNodeIds.length > 0) {
    return <StagePlanPropertiesPanel />;
  }

  if (selectedNodeIds.length > 0) {
    return <PropertiesPanel />;
  }

  if (selectedEdgeIds.length > 0 && selectedNodeIds.length === 0) {
    return <EdgePropertiesPanel />;
  }

  return <TemplateList />;
};
