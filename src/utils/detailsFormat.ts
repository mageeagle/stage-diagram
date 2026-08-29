// Lightweight markup for node details.
// Stored as plain text:
//   **bold**  *italic*  __underline__   (inline, per line)
//   "- item"  line prefix -> bulleted list item
//   "N. item" line prefix -> numbered list item (always stored as "1. ",
//                numbering is computed at render time so deleting an
//                item never requires rewriting other lines)
//   "\n" separates lines.

export type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "bold" | "italic" | "underline"; children: InlineToken[] };

export type DetailsBlock =
  | { kind: "text"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

const LIST_PREFIX = /^\d+\. /;

export function parseDetails(value: string): DetailsBlock[] {
  const blocks: DetailsBlock[] = [];
  const lines = value.split("\n");
  let i = 0;
  while (i < lines.length) {
    if (/^- /.test(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ kind: "ul", items });
    } else if (LIST_PREFIX.test(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && LIST_PREFIX.test(lines[i])) {
        items.push(lines[i].replace(LIST_PREFIX, ""));
        i++;
      }
      blocks.push({ kind: "ol", items });
    } else {
      blocks.push({ kind: "text", text: lines[i] });
      i++;
    }
  }
  return blocks;
}

export function parseInline(line: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pushText = (t: string) => {
    if (!t) return;
    const last = tokens[tokens.length - 1];
    if (last && last.kind === "text") last.text += t;
    else tokens.push({ kind: "text", text: t });
  };
  let pos = 0;
  while (pos < line.length) {
    const rest = line.slice(pos);
    // Find the earliest marker start; on a tie the longer marker wins
    // because it is checked first and only strict "<" replaces best.
    let best: { mark: string; idx: number } | null = null;
    for (const mark of ["**", "__", "*"]) {
      const idx = rest.indexOf(mark);
      if (idx !== -1 && (!best || idx < best.idx)) best = { mark, idx };
    }
    if (!best) {
      pushText(rest);
      break;
    }
    pushText(rest.slice(0, best.idx));
    const closeIdx = rest.indexOf(best.mark, best.idx + best.mark.length);
    if (closeIdx !== -1) {
      const inner = rest.slice(best.idx + best.mark.length, closeIdx);
      const kind =
        best.mark === "**" ? "bold" : best.mark === "__" ? "underline" : "italic";
      tokens.push({ kind, children: parseInline(inner) });
      pos = pos + closeIdx + best.mark.length;
    } else {
      // Unpaired marker: render as literal text.
      pushText(best.mark);
      pos = pos + best.idx + best.mark.length;
    }
  }
  return tokens;
}

// Wrap/unwrap the [start,end) selection with an inline marker.
export function toggleInlineMarker(
  text: string,
  start: number,
  end: number,
  marker: string,
): { text: string; start: number; end: number } {
  const sel = text.slice(start, end);
  if (
    sel.length >= marker.length * 2 &&
    sel.startsWith(marker) &&
    sel.endsWith(marker)
  ) {
    const inner = sel.slice(marker.length, sel.length - marker.length);
    return {
      text: text.slice(0, start) + inner + text.slice(end),
      start,
      end: start + inner.length,
    };
  }
  return {
    text: text.slice(0, start) + marker + sel + marker + text.slice(end),
    start: start + marker.length,
    end: end + marker.length,
  };
}

function withoutListPrefix(line: string): string {
  if (LIST_PREFIX.test(line)) return line.replace(LIST_PREFIX, "");
  if (/^- /.test(line)) return line.slice(2);
  return line;
}

// Toggle a list prefix ("- " or "1. ") on every line the [start,end)
// range touches. If all touched lines already have that exact prefix the
// prefix is removed; otherwise it is added (replacing any other list
// prefix).
export function toggleLinePrefix(
  text: string,
  start: number,
  end: number,
  prefix: "- " | "1. ",
): string {
  const lines = text.split("\n");
  const starts: number[] = [0];
  for (let i = 0; i < lines.length; i++) {
    starts.push(starts[i] + lines[i].length + 1);
  }
  const lineAt = (o: number) => {
    let i = 0;
    while (i < lines.length - 1 && starts[i + 1] <= o) i++;
    return i;
  };
  const from = lineAt(Math.min(start, text.length));
  const to = lineAt(
    end > start
      ? Math.min(Math.max(start, end - 1), text.length)
      : Math.min(start, text.length),
  );
  const touched = lines.slice(from, to + 1);
  const allPrefixed = touched.every((l) => l.startsWith(prefix));
  return lines
    .map((line, i) => {
      if (i < from || i > to) return line;
      const bare = withoutListPrefix(line);
      return allPrefixed ? bare : prefix + bare;
    })
    .join("\n");
}
