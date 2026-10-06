import { type Node } from "@xyflow/react";
import { type CustomNodeData } from "../../../types/diagram";

export type ChannelRow = { name: string; number?: string };

export type ChannelListReport = {
  inputs: ChannelRow[];
  outputs: ChannelRow[];
};

function parseTrailingNumber(value: string): number {
  const match = /(\d+)$/.exec(value);
  return match ? parseInt(match[1], 10) : Number.NaN;
}

function sortRows(rows: ChannelRow[]): ChannelRow[] {
  const numbered = rows.filter((row) => row.number !== undefined);
  const unnumbered = rows.filter((row) => row.number === undefined);
  numbered.sort((a, b) => {
    const pa = a.number!.replace(/\d+$/, "").toLowerCase();
    const pb = b.number!.replace(/\d+$/, "").toLowerCase();
    if (pa !== pb) return pa < pb ? -1 : 1;
    return parseTrailingNumber(a.number!) - parseTrailingNumber(b.number!);
  });
  return [...numbered, ...unnumbered];
}

type Direction = "input" | "output";

function expandNode(node: Node<CustomNodeData>, direction: Direction): ChannelRow[] {
  const qty = node.data.quantity ?? 1;
  const start =
    direction === "input" ? node.data.inputChannelNumber : node.data.outputChannelNumber;
  if (start != null) {
    const prefix =
      direction === "input"
        ? node.data.inputChannelPrefix ?? ""
        : node.data.outputChannelPrefix ?? "";
    const rows: ChannelRow[] = [];
    for (let n = start; n < start + qty; n++) {
      rows.push({ name: node.data.label, number: `${prefix}${n}` });
    }
    return rows;
  }
  return [{ name: node.data.label }];
}

export function generateChannelListReport(nodes: Node<CustomNodeData>[]): ChannelListReport {
  const visibleNodes = nodes.filter(
    (node) =>
      !(node.data?.hideFromList === true || node.data?.exportingHidden === true),
  );

  const build = (
    predicate: (node: Node<CustomNodeData>) => boolean,
    direction: Direction,
  ): ChannelRow[] => {
    const rows: ChannelRow[] = [];
    visibleNodes.forEach((node) => {
      if (predicate(node)) rows.push(...expandNode(node, direction));
    });
    return sortRows(rows);
  };

  return {
    inputs: build((node) => node.data.isInput === true, "input"),
    outputs: build((node) => node.data.isOutput === true, "output"),
  };
}
