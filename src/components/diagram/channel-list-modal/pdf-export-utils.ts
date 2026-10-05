import jsPDF from "jspdf";
import { type ChannelListReport } from "./channel-list-report-generator";
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

  const columnX = [0, 1, 2, 3].map((i) => margin + 5 + i * (contentWidth / 4));

  const drawHeader = () => {
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, currentY - 5, contentWidth, 8, "F");
    drawText("Inputs", columnX[0], currentY, 10, "bold");
    drawText("Outputs", columnX[2], currentY, 10, "bold");
    currentY += 10;
  };

  currentY += 5;
  if (currentY > 270) {
    doc.addPage();
    currentY = margin;
  }
  drawHeader();

  const rowCount = Math.max(report.inputs.length, report.outputs.length);
  for (let i = 0; i < rowCount; i++) {
    if (currentY > 270) {
      doc.addPage();
      currentY = margin;
      drawHeader();
    }
    const input = report.inputs[i];
    const output = report.outputs[i];
    if (input) {
      drawText(input.number ?? "", columnX[0], currentY, 10);
      drawText(input.name, columnX[1], currentY, 10);
    }
    if (output) {
      drawText(output.number ?? "", columnX[2], currentY, 10);
      drawText(output.name, columnX[3], currentY, 10);
    }
    currentY += 8;
  }

  doc.save(customFilename || "channel-list-report.pdf");
}
