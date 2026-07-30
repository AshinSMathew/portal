"use client";

import { Loader2 } from "lucide-react";
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
      <DialogContent className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center sm:max-w-sm">
        <DialogTitle className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
          Official IEDC QR Code
        </DialogTitle>
        <DialogDescription className="sr-only">
          Scanning this QR code registers attendance at IEDC events.
        </DialogDescription>
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        ) : qrUrl ? (
          <img
            src={qrUrl}
            alt="Official QR Code"
            className="h-72 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-inner"
          />
        ) : (
          <p className="text-sm text-slate-400">Failed to load QR</p>
        )}
        <p className="mt-4 max-w-70 text-xs leading-relaxed text-slate-500">
          Scan this QR code at any IEDC event to log your attendance.
        </p>
      </DialogContent>
    </Dialog>
  );
}