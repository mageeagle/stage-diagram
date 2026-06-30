import { useStore } from "../store/useStore";

export function useSaveAs(suggestedName: string) {
  const setSaveAsDialog = useStore((state) => state.setSaveAsDialog);
  const closeSaveAsDialog = useStore((state) => state.closeSaveAsDialog);

  return (extension: string, onConfirm: (filename: string) => void) => {
    setSaveAsDialog(suggestedName, extension, onConfirm, closeSaveAsDialog);
  };
}
