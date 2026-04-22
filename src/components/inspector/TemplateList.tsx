'use client';

import { useState } from 'react';
import { cn } from "@/lib/utils";
import { useStore } from '@/store/useStore';
import { Trash2, Pencil } from 'lucide-react';
import { NodeTemplate } from '@/types/diagram';
import { TemplateEditModal } from '@/components/diagram/TemplateEditModal';

export const TemplateList = () => {
  const templates = useStore((state) => state.templates);
  const types = useStore((state) => state.types);
  const applyTemplate = useStore((state) => state.applyTemplate);
  const deleteTemplate = useStore((state) => state.deleteTemplate);
  const updateTemplate = useStore((state) => state.updateTemplate);

  const [editingTemplate, setEditingTemplate] = useState<NodeTemplate | null>(null);
  const [isTemplateEditModalOpen, setIsTemplateEditModalOpen] = useState(false);

  return (
    <>
      <div className={cn("w-64 h-full p-4 text-sm border-l flex flex-col", "bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700")}>
        <h2 className="font-bold text-lg mb-4 text-foreground">Templates</h2>
        <div className="space-y-2">
            {templates.length === 0 ? (
              <div className="italic text-center py-8">
                Select a node to edit properties or create a template
              </div >
            ) : (
              Object.entries(
                templates.reduce((acc, template) => {
                  const type = template.type || 'Uncategorized';
                  if (!acc[type]) {
                    acc[type] = [];
                  }
                  acc[type].push(template);
                  return acc;
                }, {} as Record<string, NodeTemplate[]>)
              ).map(([type, groupTemplates]) => (
                <div key={type} className="mb-4 last:mb-0">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-2 px-1">
                    {type}
                  </div >
                  <div className="space-y-2">
                    {groupTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center gap-1 w-full text-sm rounded border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <button
                          onClick={() => applyTemplate(template, { x: 0, y: 0 })}
                          className="flex-1 text-left px-3 py-2"
                        >
                          {template.name}
                        </button>
                        <div className="flex items-center">
                          <button
                             onClick={(e) => {
                               e.stopPropagation();
                               setEditingTemplate(template);
                               setIsTemplateEditModalOpen(true);
                             }}
                             className="p-2 text-zinc-500 hover:text-blue-500"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                             onClick={(e) => {
                               e.stopPropagation();
                               if (confirm(`Delete template "${template.name}"?`)) {
                                 deleteTemplate(template.id);
                               }
                             }}
                             className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
        </div>
      </div>
      {editingTemplate && (
        <TemplateEditModal
          key={editingTemplate.id}
          isOpen={isTemplateEditModalOpen}
          onClose={() => setIsTemplateEditModalOpen(false)}
          onSave={(t) => {
            updateTemplate(t);
            setIsTemplateEditModalOpen(false);
          }}
          template={editingTemplate}
          types={types}
        />
      )}
    </>
  );
};
