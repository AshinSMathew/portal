import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";

export interface RegistrantExportData {
  slNo: number;
  name: string;
  admissionNumber: string;
  department: string;
  batch: string;
  iecdId: string;
  phone: string;
  role: string;
  attended: boolean;
}

export interface EventExportMeta {
  title: string;
  category?: string | null;
  startDatetime?: string | null;
  venue?: string | null;
  totalRegistrations: number;
  totalAttended?: number;
}

type AlignmentTypeValue = (typeof AlignmentType)[keyof typeof AlignmentType];

export async function generateRegistrationsDocx(
  eventMeta: EventExportMeta,
  registrants: RegistrantExportData[]
): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "IEDC SJCET PALAI",
                bold: true,
                size: 28,
                color: "D9383A",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "Event Registration Roster",
                bold: true,
                size: 22,
                color: "100A0A",
                font: "Calibri",
              }),
            ],
          }),

          // Event Metadata Box Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F8F9FA" },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Event: ", bold: true, size: 20 }),
                          new TextRun({ text: eventMeta.title, size: 20 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Category: ", bold: true, size: 20 }),
                          new TextRun({ text: eventMeta.category || "General", size: 20 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: "F8F9FA" },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Date: ", bold: true, size: 20 }),
                          new TextRun({
                            text: eventMeta.startDatetime
                              ? new Date(eventMeta.startDatetime).toLocaleString("en-IN")
                              : "N/A",
                            size: 20,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Venue: ", bold: true, size: 20 }),
                          new TextRun({ text: eventMeta.venue || "Campus Venue", size: 20 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: "F8F9FA" },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Total Registered: ", bold: true, size: 20 }),
                          new TextRun({ text: `${eventMeta.totalRegistrations}`, size: 20 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Attended: ", bold: true, size: 20 }),
                          new TextRun({
                            text: `${eventMeta.totalAttended ?? registrants.filter((r) => r.attended).length}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // Registrants Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header Row
              new TableRow({
                tableHeader: true,
                children: [
                  createHeaderCell("#", 5),
                  createHeaderCell("Student Name", 22),
                  createHeaderCell("Admission No", 14),
                  createHeaderCell("Dept", 10),
                  createHeaderCell("Batch / Year", 14),
                  createHeaderCell("IECD ID", 13),
                  createHeaderCell("Role", 11),
                  createHeaderCell("Status", 11),
                ],
              }),
              // Data Rows
              ...registrants.map((r) =>
                new TableRow({
                  children: [
                    createDataCell(String(r.slNo), AlignmentType.CENTER),
                    createDataCell(r.name || "N/A", AlignmentType.LEFT, true),
                    createDataCell(r.admissionNumber || "N/A", AlignmentType.CENTER),
                    createDataCell(r.department || "N/A", AlignmentType.CENTER),
                    createDataCell(r.batch || "N/A", AlignmentType.CENTER),
                    createDataCell(r.iecdId || "N/A", AlignmentType.CENTER),
                    createDataCell(r.role ? r.role.toUpperCase() : "PARTICIPANT", AlignmentType.CENTER),
                    createDataCell(
                      r.attended ? "ATTENDED" : "ABSENT",
                      AlignmentType.CENTER,
                      false,
                      r.attended ? "059669" : "DC2626"
                    ),
                  ],
                })
              ),
            ],
          }),

          new Paragraph({ text: "", spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Generated on ${new Date().toLocaleDateString("en-IN")} via IEDC Portal Telemetry`,
                italics: true,
                size: 16,
                color: "888888",
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

function createHeaderCell(text: string, widthPercentage: number): TableCell {
  return new TableCell({
    width: { size: widthPercentage, type: WidthType.PERCENTAGE },
    shading: { fill: "100A0A" },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold: true,
            color: "FFFFFF",
            size: 18,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

function createDataCell(
  text: string,
  alignment: AlignmentTypeValue = AlignmentType.LEFT,
  bold: boolean = false,
  color: string = "1A0D0C"
): TableCell {
  return new TableCell({
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    borders: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
    },
    children: [
      new Paragraph({
        alignment,
        children: [
          new TextRun({
            text,
            bold,
            color,
            size: 17,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}