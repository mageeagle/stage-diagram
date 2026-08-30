"use client";

import { useLayoutEffect, useRef } from "react";
import type {
  ClipboardEvent as ReactClipboardEvent,
  ReactNode,
} from "react";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleInlineMarker, toggleLinePrefix } from "@/utils/detailsFormat";

interface DetailsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
    >
      {children}
    </button>
  );
}

export const DetailsEditor = ({ value, onChange }: DetailsEditorProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const pendingSelRef = useRef<[number, number] | null>(null);

  // Restore selection after a programmatic edit (toolbar) re-renders value.
  useLayoutEffect(() => {
    const sel = pendingSelRef.current;
    if (!sel) return;
    pendingSelRef.current = null;
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(sel[0], sel[1]);
  }, [value]);

  const applyInline = (marker: string) => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    if (s === e) return; // no selection: do nothing
    const res = toggleInlineMarker(value, s, e, marker);
    pendingSelRef.current = [res.start, res.end];
    onChange(res.text);
  };

  const applyList = (prefix: "- " | "1. ") => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const next = toggleLinePrefix(value, s, e, prefix);
    const caret = Math.min(e, next.length);
    pendingSelRef.current = [caret, caret];
    onChange(next);
  };

  // Intercept paste to strip formatting and normalize line endings.
  const onPaste = (e: ReactClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const plain = e.clipboardData
      .getData("text/plain")
      .replace(/\r\n?/g, "\n");
    el.setRangeText(plain, el.selectionStart, el.selectionEnd, "end");
    onChange(el.value);
  };

  const lines = value.split("\n").length;

  return (
    <div className="border border-gray-300 rounded dark:border-gray-700">
      <div className="flex gap-1 p-1 border-b border-gray-300 dark:border-gray-700">
        <ToolbarButton onClick={() => applyInline("**")} title="Bold">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => applyInline("*")} title="Italic">
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => applyInline("__")} title="Underline">
          <Underline size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => applyList("- ")} title="Bulleted list">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => applyList("1. ")} title="Numbered list">
          <ListOrdered size={14} />
        </ToolbarButton>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        placeholder="Add details…"
        rows={Math.min(Math.max(lines, 3), 8)}
        className={cn(
          "w-full min-h-[80px] max-h-40 overflow-y-auto px-2 py-1 text-sm",
          "bg-transparent resize-none outline-none dark:bg-transparent",
        )}
      />
    </div>
  );
};
