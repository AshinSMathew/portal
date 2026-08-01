"use client";

import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface QrDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  qrUrl: string;
}

export function QrDialog({
  isOpen,
  onOpenChange,
  loading,
  qrUrl,
}: QrDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md bg-[#0C0908] border border-[#e8594c]/30 rounded-[36px] p-7 shadow-[0px_25px_70px_-15px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center text-center font-['Hanken_Grotesk'] text-white overflow-hidden relative">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all z-20"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="z-10 flex flex-col items-center">
          <span className="px-3.5 py-1 rounded-full bg-gradient-to-b from-[#FF0000] to-[#990000] text-white text-[10px] font-bold tracking-widest uppercase shadow-md mb-3">
            IEDC SJCET • ATTENDANCE
          </span>
          <DialogTitle className="text-2xl font-bold text-white tracking-tight mb-1">
            Official Attendance QR
          </DialogTitle>
          <DialogDescription className="text-xs text-white/70 mb-5 leading-relaxed max-w-[280px]">
            Show this QR code to the coordinator to log your attendance at IEDC events.
          </DialogDescription>

          <div className="p-3 bg-white rounded-[24px] shadow-2xl border border-white/20 my-1">
            {loading ? (
              <div className="w-56 h-56 flex flex-col items-center justify-center bg-gray-50 rounded-xl gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF0000]" />
                <span className="text-xs text-gray-500 font-medium">Generating QR...</span>
              </div>
            ) : qrUrl ? (
              <img
                src={qrUrl}
                alt="Official QR Code"
                className="w-56 h-56 md:w-64 md:h-64 rounded-xl object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 text-xs">
                Failed to load QR code
              </div>
            )}
          </div>

          <p className="text-[11px] text-white/50 mt-4 leading-relaxed max-w-[260px]">
            Scan at event check-in to record your participation and claim points.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}