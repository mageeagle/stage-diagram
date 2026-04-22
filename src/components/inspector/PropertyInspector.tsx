'use client';

import { useStore } from '@/store/useStore';
import { TemplateList } from './TemplateList';
import { PropertiesPanel } from './PropertiesPanel';

export const PropertyInspector = () => {
  const selectedNodeIds = useStore((state) => state.selectedNodeIds);

  if (selectedNodeIds.length === 0) {
    return <TemplateList />;
  }

  return <PropertiesPanel />;
};
