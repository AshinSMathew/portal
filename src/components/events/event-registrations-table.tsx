"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Users, Loader2 } from "lucide-react";

export interface Registration {
  id: string;
  role: string;
  registeredAt: string;
  student: {
    id: string;
    name: string;
    department: string;
    batch: string;
    iecdId: string;
  };
  attended: boolean;
}

export interface EventRegistrationsTableProps {
  eventId: string;
  eventTitle?: string;
  eventType?: string;
  venue?: string | null;
  startDatetime?: string;
  initialRegistrations?: Registration[];
}

export function EventRegistrationsTable({
  eventId,
  eventTitle = "Event",
  eventType = "Event",
  venue,
  startDatetime,
  initialRegistrations,
}: EventRegistrationsTableProps) {
  const [registrations, setRegistrations] = useState<Registration[]>(
    initialRegistrations || []
  );
  const [loading, setLoading] = useState(!initialRegistrations);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const res = await fetch(`/api/events/${eventId}/registrations`);
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data.registrations || []);
        }
      } catch (error) {
        console.error("Failed to fetch registrations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRegistrations();
  }, [eventId]);

  const downloadPDF = async () => {
    if (registrations.length === 0) return;
    setDownloading(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 800]);
      const { height } = page.getSize();

      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const drawHeader = (p: typeof page) => {
        p.drawText(eventTitle, {
          x: 50,
          y: height - 60,
          size: 18,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.18),
        });

        const eventInfo = `Type: ${eventType.replace("_", " ").toUpperCase()}   |   Venue: ${venue || "N/A"}`;
        p.drawText(eventInfo, {
          x: 50,
          y: height - 80,
          size: 9,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });

        const dateFormatted = startDatetime
          ? `Date: ${new Date(startDatetime).toLocaleDateString("en-IN")}   |   Time: ${new Date(startDatetime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
          : "";
        if (dateFormatted) {
          p.drawText(dateFormatted, {
            x: 50,
            y: height - 95,
            size: 9,
            font: fontRegular,
            color: rgb(0.4, 0.4, 0.4),
          });
        }

        p.drawText("Registered Attendees List", {
          x: 50,
          y: height - 130,
          size: 12,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.18),
        });

        const tableTop = height - 150;
        p.drawLine({
          start: { x: 50, y: tableTop },
          end: { x: 550, y: tableTop },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });

        const headers = ["Name", "Department", "Batch", "Status"];
        const colWidths = [180, 110, 100, 110];
        const startX = 50;

        let currentX = startX;
        for (let i = 0; i < headers.length; i++) {
          p.drawText(headers[i], {
            x: currentX,
            y: tableTop - 12,
            size: 9,
            font: fontBold,
            color: rgb(0.2, 0.2, 0.2),
          });
          currentX += colWidths[i];
        }

        p.drawLine({
          start: { x: 50, y: tableTop - 20 },
          end: { x: 550, y: tableTop - 20 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });
      };

      drawHeader(page);

      const colWidths = [180, 110, 100, 110];
      const startX = 50;
      let currentY = height - 190;

      for (let index = 0; index < registrations.length; index++) {
        const reg = registrations[index];

        if (currentY < 50) {
          page = pdfDoc.addPage([600, 800]);
          drawHeader(page);
          currentY = height - 190;
        }

        let currentX = startX;

        // Name
        page.drawText(reg.student.name, {
          x: currentX,
          y: currentY,
          size: 9,
          font: fontRegular,
          color: rgb(0.1, 0.1, 0.1),
        });
        currentX += colWidths[0];

        // Dept
        page.drawText(reg.student.department, {
          x: currentX,
          y: currentY,
          size: 9,
          font: fontRegular,
          color: rgb(0.3, 0.3, 0.3),
        });
        currentX += colWidths[1];

        // Batch
        page.drawText(reg.student.batch, {
          x: currentX,
          y: currentY,
          size: 9,
          font: fontRegular,
          color: rgb(0.3, 0.3, 0.3),
        });
        currentX += colWidths[2];

        // Status
        const statusText = reg.attended ? "Attended" : "Registered";
        page.drawText(statusText, {
          x: currentX,
          y: currentY,
          size: 9,
          font: fontBold,
          color: reg.attended ? rgb(0.1, 0.6, 0.2) : rgb(0.5, 0.5, 0.5),
        });

        currentY -= 20;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${eventTitle.replace(/\s+/g, "_")}_Attendance.pdf`;
      link.click();
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] border border-gray-100/80 p-8 shadow-sm font-['Hanken_Grotesk'] text-[#1A0D0C] space-y-4">
        <div className="h-6 bg-gray-200/60 rounded-full w-48 animate-pulse" />
        <div className="h-32 bg-gray-200/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] border border-gray-100/80 p-8 shadow-sm font-['Hanken_Grotesk'] text-[#1A0D0C] space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A0D0C]">
              Registered Students
            </h3>
            <p className="text-xs font-medium text-gray-400">
              {registrations.length} student{registrations.length === 1 ? "" : "s"} enrolled
            </p>
          </div>
        </div>

        {registrations.length > 0 && (
          <Button
            onClick={downloadPDF}
            disabled={downloading}
            className="h-9.5 px-4 rounded-full bg-[#100A0A] hover:bg-[#2A2020] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>Download PDF</span>
          </Button>
        )}
      </div>

      {registrations.length === 0 ? (
        <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-xs font-medium">
            No student registrations recorded yet for this event.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100/80">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 text-[#1A0D0C] font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">IECD ID</th>
                <th className="px-5 py-3.5">Dept & Year</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 bg-white">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[#1A0D0C]">
                    {reg.student.name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-[11px]">
                    {reg.student.iecdId}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-600">
                    {reg.student.department} ({reg.student.batch})
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        reg.role === "volunteer"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}
                    >
                      {reg.role || "participant"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {reg.attended ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                        Present ✓
                      </span>
                    ) : (
                      <span className="text-gray-400 font-medium text-[11px]">
                        Not Marked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
