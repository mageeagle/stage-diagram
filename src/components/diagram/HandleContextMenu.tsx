"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const menuItemClasses =
  "block w-full cursor-pointer px-3 py-1.5 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-700";

export const HandleContextMenu = () => {
  const handleMenu = useStore((s) => s.handleMenu);
  const closeHandleMenu = useStore((s) => s.closeHandleMenu);
  const selectEdgesForHandle = useStore((s) => s.selectEdgesForHandle);
  const selectEdgesForSide = useStore((s) => s.selectEdgesForSide);
  const menuRef = useRef<HTMLDivElement>(null);
  const dismissedByPressRef = useRef(false);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      dismissedByPressRef.current = false;
      const menu = useStore.getState().handleMenu;
      if (!menu) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        dismissedByPressRef.current = true;
        closeHandleMenu();
      }
    };
    // Capture phase: swallow the contextmenu belonging to the press that
    // dismissed the menu, so right-clicking a node/handle does not reopen it.
    const onContextMenuCapture = (event: MouseEvent) => {
      if (!dismissedByPressRef.current) return;
      dismissedByPressRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeHandleMenu();
      }
    };
    // Capture phase: React Flow stops in-canvas press propagation before it
    // bubbles to document, so a bubbling listener never sees in-canvas clicks.
    // Capturing at document fires before the event descends into the canvas.
    document.addEventListener("mousedown", onMouseDown, true);
    document.addEventListener("contextmenu", onContextMenuCapture, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown, true);
      document.removeEventListener("contextmenu", onContextMenuCapture, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeHandleMenu]);

  if (!handleMenu) return null;

  const items: { label: string; onSelect: (shiftKey: boolean) => void }[] = [];
  if (handleMenu.handleId) {
    items.push({
      label: "Select edges on this handle",
      onSelect: (shiftKey) =>
        selectEdgesForHandle(
          handleMenu.nodeId,
          handleMenu.handleId!,
          !!handleMenu.isInput,
          shiftKey,
        ),
    });
  }
  items.push(
    {
      label: "Select all input edges",
      onSelect: (shiftKey) =>
        selectEdgesForSide(handleMenu.nodeId, "input", shiftKey),
    },
    {
      label: "Select all output edges",
      onSelect: (shiftKey) =>
        selectEdgesForSide(handleMenu.nodeId, "output", shiftKey),
    },
  );

  const menuWidth = 220;
  const menuHeight = items.length * 32 + 16;
  const left = Math.max(0, Math.min(handleMenu.x, window.innerWidth - menuWidth));
  const top = Math.max(0, Math.min(handleMenu.y, window.innerHeight - menuHeight));

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 rounded-md border border-stone-300 bg-white py-2 shadow-lg dark:border-stone-600 dark:bg-zinc-900"
      style={{ left, top }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={cn(menuItemClasses)}
          onClick={(event) => {
            event.stopPropagation();
            item.onSelect(event.shiftKey);
            closeHandleMenu();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
};
