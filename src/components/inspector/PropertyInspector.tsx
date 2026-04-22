'use client';

import { useStore } from '@/store/useStore';
import { TemplateList } from './TemplateList';
import { PropertiesPanel } from './PropertiesPanel';
import { EdgePropertiesPanel } from './EdgePropertiesPanel';

export const PropertyInspector = () => {
  const selectedNodeIds = useStore((state) => state.selectedNodeIds);
  const selectedEdgeIds = useStore((state) => state.selectedEdgeIds);

  if (selectedNodeIds.length > 0) {
    return <PropertiesPanel />;
  }

  if (selectedEdgeIds.length > 0) {
    return <EdgePropertiesPanel />;
  }

  return <TemplateList />;
};
