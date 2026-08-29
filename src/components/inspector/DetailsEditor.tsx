"use client";

import { useEffect, useRef } from "react";
import type {
  ClipboardEvent as ReactClipboardEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleInlineMarker, toggleLinePrefix } from "@/utils/detailsFormat";

interface DetailsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface Segment {
  node: Node;
  start: number;
  end: number;
}

// Flat DOM model: text segments and zero-length BR markers, in order.
function segmentsOf(root: HTMLElement): Segment[] {
  const segs: Segment[] = [];
  let pos = 0;
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length ?? 0;
      segs.push({ node, start: pos, end: pos + len });
      pos += len;
    } else if (node instanceof Element && node.tagName === "BR") {
      segs.push({ node, start: pos, end: pos + 1 });
      pos += 1;
    } else if (node instanceof Element) {
      node.childNodes.forEach(walk);
    }
  };
  root.childNodes.forEach(walk);
  return segs;
}

function serialize(el: HTMLElement): string {
  let out = "";
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? "";
    } else if (node instanceof Element) {
      if (node.tagName === "BR") out += "\n";
      else node.childNodes.forEach(walk);
    }
  };
  el.childNodes.forEach(walk);
  return out;
}

function rebuild(el: HTMLElement, value: string) {
  el.innerHTML = "";
  const lines = value.split("\n");
  lines.forEach((line, i) => {
    if (i > 0) el.appendChild(document.createElement("br"));
    if (line) el.appendChild(document.createTextNode(line));
  });
}

function pointOffset(
  root: HTMLElement,
  container: Node,
  offset: number,
): number {
  const segs = segmentsOf(root);
  if (container.nodeType === Node.TEXT_NODE) {
    const seg = segs.find((s) => s.node === container);
    return seg ? seg.start + offset : 0;
  }
  // Element container: offset k means "after child k-1"; 0 = before all.
  if (offset <= 0) return 0;
  const child = container.childNodes[
    Math.min(offset, container.childNodes.length) - 1
  ];
  if (!child) return 0;
  if (
    child.nodeType === Node.TEXT_NODE ||
    (child instanceof Element && child.tagName === "BR")
  ) {
    const seg = segs.find((s) => s.node === child);
    return seg ? seg.end : 0;
  }
  // Element child: "after it" = its end.
  return pointOffset(root, child, child.childNodes.length);
}

function caretOffset(el: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  return pointOffset(el, sel.anchorNode!, sel.anchorOffset);
}

function setCaret(el: HTMLElement, offset: number) {
  const range = document.createRange();
  let placed = false;
  for (const seg of segmentsOf(el)) {
    if (seg.node.nodeType === Node.TEXT_NODE) {
      if (offset >= seg.start && offset <= seg.end) {
        range.setStart(seg.node, offset - seg.start);
        range.collapse(true);
        placed = true;
        break;
      }
    } else if (offset === seg.start) {
      range.setStartBefore(seg.node);
      range.collapse(true);
      placed = true;
      break;
    } else if (offset === seg.end) {
      range.setStartAfter(seg.node);
      range.collapse(true);
      placed = true;
      break;
    }
  }
  if (!placed) {
    range.selectNodeContents(el);
    range.collapse(false);
  }
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function selectRange(el: HTMLElement, start: number, end: number) {
  const range = document.createRange();
  const segs = segmentsOf(el).filter((s) => s.node.nodeType === Node.TEXT_NODE);
  const find = (o: number) =>
    segs.find((seg) => o >= seg.start && o <= seg.end) ?? null;
  const ss = find(start);
  const se = find(end);
  if (ss) range.setStart(ss.node, start - ss.start);
  else range.setStart(el, 0);
  if (se) range.setEnd(se.node, end - se.start);
  else range.setEnd(el, el.childNodes.length);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
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
  const ref = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef<string | null>(null);

  // Rebuild from outside only while the editor is not focused.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement !== el && value !== lastValueRef.current) {
      lastValueRef.current = value;
      rebuild(el, value);
    }
  }, [value]);

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    if (value !== lastValueRef.current) {
      // External change while focused (e.g. undo): source of truth wins.
      lastValueRef.current = value;
      rebuild(el, value);
      return;
    }
    const next = serialize(el);
    const off = caretOffset(el);
    lastValueRef.current = next;
    rebuild(el, next);
    setCaret(el, off);
    if (next !== value) onChange(next);
  };

  const selectionBounds = (): [number, number] | null => {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return null;
    if (!el.contains(sel.anchorNode)) return null;
    const a = pointOffset(el, sel.anchorNode!, sel.anchorOffset);
    const b = pointOffset(el, sel.focusNode!, sel.focusOffset);
    return [Math.min(a, b), Math.max(a, b)];
  };

  const applyInline = (marker: string) => {
    const el = ref.current;
    const bounds = selectionBounds();
    if (!el || !bounds) return;
    const [s, e] = bounds;
    if (s === e) return; // no selection: do nothing
    const res = toggleInlineMarker(serialize(el), s, e, marker);
    lastValueRef.current = res.text;
    rebuild(el, res.text);
    selectRange(el, res.start, res.end);
    onChange(res.text);
  };

  const applyList = (prefix: "- " | "1. ") => {
    const el = ref.current;
    const bounds = selectionBounds();
    if (!el || !bounds) return;
    const [s, e] = bounds;
    const next = toggleLinePrefix(serialize(el), s, e, prefix);
    lastValueRef.current = next;
    rebuild(el, next);
    setCaret(el, Math.min(e, next.length));
    onChange(next);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const br = document.createElement("br");
    range.insertNode(br);
    const caret = document.createRange();
    caret.setStartAfter(br);
    caret.collapse(true);
    sel.removeAllRanges();
    sel.addRange(caret);
    commit();
  };

  const onPaste = (e: ReactClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plain = e.clipboardData.getData("text/plain").replace(/\r\n?/g, "\n");
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(plain));
    commit();
  };

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
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        onInput={commit}
        onBlur={commit}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        data-placeholder="Add details…"
        className={cn(
          "min-h-[80px] max-h-40 overflow-y-auto px-2 py-1 text-sm",
          "whitespace-pre-wrap outline-none dark:bg-transparent",
          "empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)]",
        )}
      />
    </div>
  );
};
