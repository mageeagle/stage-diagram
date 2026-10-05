import { format } from "date-fns";
import { type ChannelListReport, type ChannelRow } from "./channel-list-report-generator";

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

export function exportToCsv(title: string, subtitle: string, report: ChannelListReport, customFilename?: string): void {
  const exportDate = format(new Date(), "yyyy-MM-dd");

  const lines: string[] = [];

  // Metadata rows
  lines.push(`"Title","${title}"`);
  lines.push(`"Subtitle","${subtitle}"`);
  lines.push(`"Export Date","${exportDate}"`);
  lines.push("");

  // CSV header
  lines.push("Number,Name,Section");

  for (const row of report.inputs) {
    lines.push(`"${row.number ?? ""}","${row.name}","Inputs"`);
  }
  for (const row of report.outputs) {
    lines.push(`"${row.number ?? ""}","${row.name}","Outputs"`);
  }

  const csvContent = lines.join("\n");
  const filename = customFilename || `${title || "channel-list"}.csv`;
  downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
}

export function exportToJson(
  title: string,
  subtitle: string,
  preparedBy: string,
  report: ChannelListReport,
  customFilename?: string,
): void {
  const exportDate = format(new Date(), "yyyy-MM-dd");

  const toEntry = (row: ChannelRow) => {
    const entry: { number?: string; name: string } = { name: row.name };
    if (row.number !== undefined) entry.number = row.number;
    return entry;
  };

  const exportData: Record<string, unknown> = {};
  if (title) exportData.title = title;
  if (subtitle) exportData.subtitle = subtitle;
  exportData.preparedBy = preparedBy;
  exportData.exportDate = exportDate;
  exportData.inputs = report.inputs.map(toEntry);
  exportData.outputs = report.outputs.map(toEntry);

  const jsonContent = JSON.stringify(exportData, null, 2);
  const filename = customFilename || `${title || "channel-list"}.json`;
  downloadFile(jsonContent, filename, "application/json");
}
