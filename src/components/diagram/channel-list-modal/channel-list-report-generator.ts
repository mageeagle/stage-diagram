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
  numbered.sort(
    (a, b) => parseTrailingNumber(a.number!) - parseTrailingNumber(b.number!),
  );
  return [...numbered, ...unnumbered];
}

function expandNode(node: Node<CustomNodeData>): ChannelRow[] {
  const qty = node.data.quantity ?? 1;
  if (node.data.channelNumber != null) {
    const prefix = node.data.channelPrefix ?? "";
    const rows: ChannelRow[] = [];
    for (let n = node.data.channelNumber; n < node.data.channelNumber + qty; n++) {
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

  const build = (predicate: (node: Node<CustomNodeData>) => boolean): ChannelRow[] => {
    const rows: ChannelRow[] = [];
    visibleNodes.forEach((node) => {
      if (predicate(node)) rows.push(...expandNode(node));
    });
    return sortRows(rows);
  };

  return {
    inputs: build((node) => node.data.isInput === true),
    outputs: build((node) => node.data.isOutput === true),
  };
}
