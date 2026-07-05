"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { EventDetail, Registration } from "./types";
import { EventHeader } from "./_components/event-header";
import { StatusActions } from "./_components/status-actions";
import { RegistrationsTable } from "./_components/registrations-table";

export default function ExecomEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const [eventRes, regRes] = await Promise.all([
          fetch(`/api/events/${params.id}`),
          fetch(`/api/events/${params.id}/registrations`),
        ]);
        
        if (eventRes.ok) {
          setEvent(await eventRes.json());
        }
        if (regRes.ok) {
          const regData = await regRes.json();
          setRegistrations(regData.registrations || []);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    setMessage("");
    try {
      const res = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEvent((prev) => (prev ? { ...prev, ...updated } : prev));
        setMessage(`Status updated to ${newStatus}`);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const downloadPDF = async () => {
    if (!event) return;
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 800]);
      const { height } = page.getSize();
      
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const drawHeader = (p: typeof page) => {
        p.drawText(event.title, {
          x: 50,
          y: height - 60,
          size: 18,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.18),
        });

        const eventInfo = `Type: ${event.eventType.replace("_", " ").toUpperCase()}   |   Venue: ${event.venue || "N/A"}`;
        p.drawText(eventInfo, {
          x: 50,
          y: height - 80,
          size: 9,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });

        const dateStr = `Date: ${new Date(event.startDatetime).toLocaleDateString("en-IN")}   |   Time: ${new Date(event.startDatetime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
        p.drawText(dateStr, {
          x: 50,
          y: height - 95,
          size: 9,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });

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
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${event.title.replace(/\s+/g, "_")}_Attendance.pdf`;
      link.click();
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-3xl">
        <div className="h-6 bg-gray-200 rounded-xl w-32" />
        <div className="h-10 bg-gray-200 rounded-xl w-3/4" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 font-medium">Event not found</p>
        <Button
          variant="outline"
          className="mt-4 rounded-xl cursor-pointer"
          onClick={() => router.push("/execom/events")}
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button */}
      <Link
        href="/execom/events"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to events
      </Link>

      <EventHeader event={event} />

      <StatusActions
        event={event}
        updating={updating}
        message={message}
        onUpdateStatus={updateStatus}
      />

      <RegistrationsTable
        registrations={registrations}
        onDownloadPDF={downloadPDF}
      />
    </div>
  );
}
