import jsPDF from "jspdf";
import { type ChannelListReport, type ChannelRow } from "./channel-list-report-generator";
import { format } from "date-fns";

export function exportToPdf(
  title: string,
  subtitle: string,
  preparedBy: string,
  report: ChannelListReport,
  customFilename?: string
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;

  const drawText = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    fontStyle: "normal" | "bold" = "normal",
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.text(text, x, y);
  };

  // Title
  drawText(title || "Channel List", margin + 5, currentY, 18, "bold");
  currentY += 5;

  // Subtitle
  if (subtitle) {
    drawText(`${subtitle}`, margin + 5, currentY, 10);
    currentY += 5;
  }
  // Prepared By
  if (preparedBy) {
    drawText(`Prepared by: ${preparedBy}`, margin + 5, currentY, 10);
    currentY += 5;
  }
  drawText(format(new Date(), "yyyy.MM.dd"), margin + 5, currentY, 10);
  currentY += 25;

  const renderSection = (label: string, rows: ChannelRow[]) => {
    currentY += 5;
    if (currentY > 270) {
      doc.addPage();
      currentY = margin;
    }
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, currentY - 5, contentWidth, 8, "F");
    drawText(label, margin + 5, currentY, 10, "bold");
    currentY += 10;

    rows.forEach((row) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = margin;
      }
      const number = row.number ?? "";
      drawText(number, margin + 5, currentY, 10);
      drawText(row.name, margin + 5 + doc.getTextWidth(`${number} `), currentY, 10);
      currentY += 8;
    });
  };

  renderSection("Inputs", report.inputs);
  renderSection("Outputs", report.outputs);

  doc.save(customFilename || "channel-list-report.pdf");
}
