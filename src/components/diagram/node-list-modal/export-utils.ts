import { format } from "date-fns";
import { type Report } from "./node-list-report-generator";

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportToCsv(title: string, subtitle: string, report: Report): void {
  const exportDate = format(new Date(), "yyyy-MM-dd");

  const lines: string[] = [];

  // Metadata rows
  lines.push(`"Title","${title}"`);
  lines.push(`"Subtitle","${subtitle}"`);
  lines.push(`"Export Date","${exportDate}"`);
  lines.push("");

  // CSV header
  lines.push("Name,Type,Location,Quantity,Category");

  // Nodes section
  let currentCategory = "";
  for (const row of report.nodesReport) {
    if (row.type === "header") {
      currentCategory = row.label;
      lines.push(`"${currentCategory}",,,,,`);
    } else if (row.type === "node") {
      const { name, type, location, quantity } = row.node;
      lines.push(`"${name}","${type || ""}","${location || ""}",${quantity},"${currentCategory}"`);
    }
  }

  // Cables section
  currentCategory = "Cables";
  for (const row of report.cablesReport) {
    if (row.type === "header") {
      currentCategory = row.label;
      lines.push(`"${currentCategory}",,,,,`);
    } else if (row.type === "summary") {
      lines.push(`"${row.label}","","",${row.value},"${currentCategory}"`);
    }
  }

  const csvContent = lines.join("\n");
  const filename = `${title || "node-list"}.csv`;
  downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
}

export function exportToJson(
  title: string,
  subtitle: string,
  preparedBy: string,
  report: Report,
  hideTitle: boolean,
  hideDate: boolean,
  showDetails: boolean,
): void {
  const exportDate = format(new Date(), "yyyy-MM-dd");

  const metadata: Record<string, string> = {};
  if (!hideTitle) {
    if (title) metadata.title = title;
  }
  if (subtitle) metadata.subtitle = subtitle;
  metadata.preparedBy = preparedBy;
  metadata.exportDate = exportDate;

  // Build nodesReport array
  const nodesReport: Record<string, string | number>[] = [];
  for (const row of report.nodesReport) {
    if (row.type === "node") {
      const { name, type, location, quantity } = row.node;
      const entry: Record<string, string | number> = {
        name,
        quantity,
      };
      if (showDetails) {
        if (type) entry.type = type;
        if (location) entry.location = location;
      }
      nodesReport.push(entry);
    }
  }

  // Build cablesReport array
  const cablesReport: Record<string, number>[] = [];
  for (const row of report.cablesReport) {
    if (row.type === "summary") {
      cablesReport.push({ [row.label]: row.value as number });
    }
  }

  // Build summary
  const summary = {
    totalItems: nodesReport.reduce((sum, n) => sum + (n.quantity as number), 0),
    totalCableTypes: cablesReport.length,
  };

  const exportData = {
    ...metadata,
    nodesReport,
    cablesReport,
    summary,
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const filename = `${title || "node-list"}.json`;
  downloadFile(jsonContent, filename, "application/json");
}

export { downloadFile };
