"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Users } from "lucide-react";
import { Registration } from "../types";

interface RegistrationsTableProps {
  registrations: Registration[];
  onDownloadPDF: () => Promise<void>;
}

export function RegistrationsTable({ registrations, onDownloadPDF }: RegistrationsTableProps) {
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
            onClick={onDownloadPDF}
            className="h-[38px] px-4 rounded-full bg-[#100A0A] hover:bg-[#2A2020] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF</span>
          </Button>
        )}
      </div>

      {registrations.length === 0 ? (
        <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-xs font-medium">No student registrations recorded yet for this event.</p>
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
                  <td className="px-5 py-3.5 font-bold text-[#1A0D0C]">{reg.student.name}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-[11px]">{reg.student.iecdId}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-600">
                    {reg.student.department} ({reg.student.batch})
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${reg.role === "volunteer"
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
                      <span className="text-gray-400 font-medium text-[11px]">Not Marked</span>
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