import jsPDF from "jspdf";
import { Report, ReportRow } from "./node-list-report-generator";
import { format } from "date-fns";

export function exportToPdf(
  title: string,
  subtitle: string,
  preparedBy: string,
  report: Report,
  hideTitle: boolean,
  hideDate: boolean,
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
  if (!hideTitle) {
    // Title
    drawText(title || "Technical Rider", margin + 5, currentY, 18, "bold");
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
    if (!hideDate) {
      drawText(format(new Date(), "yyyy.MM.dd"), margin + 5, currentY, 10);
    }
    currentY += 25;
  }

  const renderRows = (rows: ReportRow[]) => {
    rows.forEach((row) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = margin;
      }

      switch (row.type) {
        case "header":
          currentY += 5;
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, currentY - 5, contentWidth, 8, "F");
          drawText(row.label, margin + 5, currentY, 10, "bold");
          currentY += 10;
          break;
        case "node":
          drawText(`${row.node.name}`, margin + 5, currentY, 10);

          let details = "";
          if (row.node.type) details += ` (${row.node.type})`;
          if (row.node.location) details += ` @ ${row.node.location}`;

          if (details) {
            drawText(
              details,
              margin + 5 + doc.getTextWidth(`${row.node.name} `),
              currentY,
              8,
            );
          }
          doc.setFontSize(10);
          doc.text(`${row.node.quantity}`, pageWidth - margin - 5, currentY, {
            align: "right",
          });
          currentY += 8;
          break;
        case "summary":
          drawText(`${row.label}`, margin + 5, currentY, 10);
          doc.text(`${row.value}`, pageWidth - margin - 5, currentY, {
            align: "right",
          });
          currentY += 8;
          break;
        case "separator":
          currentY += 2;
          break;
      }
    });
  };
  let count = 0;
  report.nodesReport.forEach((v) => {
    if (v.type === "header") count++;
  });
  if (count === 0) renderRows([{ type: "header", label: "Items" }]);
  // Nodes Report
  renderRows(report.nodesReport);

  // Cables Report
  if (report.cablesReport.length > 0) {
    currentY += 10;
    if (currentY > 270) {
      doc.addPage();
      currentY = margin;
    }
    renderRows(report.cablesReport);
  }

  doc.save("node-list-report.pdf");
}
