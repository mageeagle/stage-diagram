import React from "react";
import { type NodeListContentProps } from "../node-list-modal-types";
import { NodeListItem } from "./NodeListItem";
import { generateNodeListReport } from "./node-list-report-generator";

export const NodeListContent = ({
  nodes,
  edges,
  groupBy,
  showDetails,
}: NodeListContentProps) => {
  const { nodesReport, cablesReport } = generateNodeListReport(nodes, groupBy, edges);

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {nodesReport.map((row, index) => {
        switch (row.type) {
          case "header":
            return (
              <div
                key={`header-${index}`}
                className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800"
              >
                {row.label}
              </div>
            );
          case "node":
            return (
              <NodeListItem
                key={`node-${index}`}
                node={row.node}
                groupBy={groupBy}
                showDetails={showDetails}
              />
            );
          case "summary":
            return (
              <NodeListItem
                key={`summary-${index}`}
                node={{
                  name: row.label,
                  quantity: typeof row.value === "number" ? row.value : 0,
                  hasPower: false,
                }}
                showDetails={false}
                groupBy="none"
              />
            );
          case "separator":
            return <div key={`sep-${index}`} className="border-b border-zinc-100 dark:border-zinc-800" />;
          default:
            return null;
        }
      })}
      {cablesReport.map((row, index) => {
        switch (row.type) {
          case "header":
            return (
              <div
                key={`cable-header-${index}`}
                className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800"
              >
                {row.label}
              </div>
            );
          case "summary":
            return (
              <NodeListItem
                key={`cable-summary-${index}`}
                node={{
                  name: row.label,
                  quantity: typeof row.value === "number" ? row.value : 0,
                  hasPower: false,
                }}
                showDetails={false}
                groupBy="none"
              />
            );
          case "separator":
            return <div key={`cable-sep-${index}`} className="border-b border-zinc-100 dark:border-zinc-800" />;
          default:
            return null;
        }
      })}
    </div>
  );
};
