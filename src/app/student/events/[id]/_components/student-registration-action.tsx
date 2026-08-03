"use client";

import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, QrCode } from "lucide-react";
import Link from "next/link";

interface StudentRegistrationActionProps {
  eventId: string;
  registered: boolean;
  registeredRole?: string | null;
  registering: boolean;
  message: string;
  onRegister: () => Promise<void>;
}

export function StudentRegistrationAction({
  eventId,
  registered,
  registeredRole,
  registering,
  message,
  onRegister,
}: StudentRegistrationActionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <h3 className="font-semibold text-[#1a1a2e] mb-3">Registration</h3>
      {message && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            registered
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {message}
        </div>
      )}

      {registeredRole === "volunteer" ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-sm text-purple-700 font-semibold flex items-center gap-2 w-fit">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>Registered as Volunteer</span>
          </div>
          <Link href={`/execom/events/${eventId}/scan`}>
            <Button className="h-11 px-6 rounded-xl bg-[#100A0A] hover:bg-[#2a2a4e] text-white font-medium flex items-center gap-2 cursor-pointer shadow-sm">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan QR Code for Attendance</span>
            </Button>
          </Link>
        </div>
      ) : registered ? (
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold flex items-center gap-2 w-fit">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Registered ✓</span>
        </div>
      ) : (
        <Button
          onClick={onRegister}
          disabled={registering}
          className="w-full md:w-auto h-11 px-8 rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-medium cursor-pointer"
        >
          {registering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Register for Event
        </Button>
      )}
    </div>
  );
}
