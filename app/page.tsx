'use client';

import { DiagramCanvas } from '@/components/diagram/DiagramCanvas';
import { PropertyInspector } from '@/components/inspector/PropertyInspector';
import { useStore } from '@/store/useStore';
import { Plus, Settings } from 'lucide-react';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

export default function Home() {
  const { setPendingPosition, setIsModalOpen, isSettingsModalOpen, setIsSettingsModalOpen } = useStore();

  const handleAddNode = () => {
    setPendingPosition({ x: 100, y: 100 });
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-black">
      <main className="relative flex-1">
        <DiagramCanvas />
        
        <button
          onClick={handleAddNode}
          className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Node
        </button>

        <div className="absolute top-4 right-4 flex items-center gap-2 z-[10000]">
          <ThemeSwitcher />
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="rounded-md bg-white p-2 text-zinc-600 shadow-md hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>

        <SettingsModal 
          isOpen={isSettingsModalOpen} 
          onClose={() => setIsSettingsModalOpen(false)} 
        />
      </main>

      <aside className="h-full">
        <PropertyInspector />
      </aside>
    </div>
  );
}

