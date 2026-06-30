"use client";

import { DiagramCanvas } from "@/components/diagram/DiagramCanvas";
import { StagePlanCanvas } from "@/components/diagram/StagePlanCanvas";
import { PropertyInspector } from "@/components/inspector/PropertyInspector";
import { useStore } from "@/store/useStore";
import { useStagePlanStore } from "@/store/useStagePlanStore";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { NodeListModal } from "@/components/diagram/NodeListModal";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { HelpModal } from "@/components/help/HelpModal";
import { SaveAsDialog } from "@/components/settings/SaveAsDialog";
import { useShallow } from "zustand/shallow";

export default function Home() {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isNodeListModalOpen,
    setIsNodeListModalOpen,
    isHelpModalOpen,
    setIsHelpModalOpen,
    isSaveAsDialogOpen,
    saveAsSuggestedName,
    saveAsExtension,
    saveAsOnConfirm,
    saveAsOnClose,
    closeSaveAsDialog,
  } = useStore(
    useShallow((state) => ({
      setPendingPosition: state.setPendingPosition,
      setIsModalOpen: state.setIsModalOpen,
      isSettingsModalOpen: state.isSettingsModalOpen,
      setIsSettingsModalOpen: state.setIsSettingsModalOpen,
      isNodeListModalOpen: state.isNodeListModalOpen,
      setIsNodeListModalOpen: state.setIsNodeListModalOpen,
      isHelpModalOpen: state.isHelpModalOpen,
      setIsHelpModalOpen: state.setIsHelpModalOpen,
      isSaveAsDialogOpen: state.isSaveAsDialogOpen,
      saveAsSuggestedName: state.saveAsSuggestedName,
      saveAsExtension: state.saveAsExtension,
      saveAsOnConfirm: state.saveAsOnConfirm,
      saveAsOnClose: state.saveAsOnClose,
      closeSaveAsDialog: state.closeSaveAsDialog,
    })),
  );

  const isStagePlanEnabled = useStagePlanStore(
    (state) => state.isStagePlanEnabled,
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-black">
      <main className="relative flex-1">
        {isStagePlanEnabled ? null : <DiagramCanvas />}
        {isStagePlanEnabled ? <StagePlanCanvas /> : null}
        <Toolbar />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />

        <NodeListModal
          isOpen={isNodeListModalOpen}
          onClose={() => setIsNodeListModalOpen(false)}
        />

        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />

        <SaveAsDialog
          isOpen={isSaveAsDialogOpen}
          suggestedName={saveAsSuggestedName}
          extension={saveAsExtension}
          onConfirm={saveAsOnConfirm ?? (() => {})}
          onClose={closeSaveAsDialog}
        />
      </main>

      <aside className="h-full">
        <PropertyInspector />
      </aside>
    </div>
  );
}
