"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { IScannerControls } from "@zxing/browser";

interface ScanResult {
  success: boolean;
  message: string;
  studentName?: string;
  iecdId?: string;
}

export default function ScanPage() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const prevDeviceIdRef = useRef("");

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch("/api/events?status=all&limit=50");
      const data = await res.json();
      setEvents(
        (data.events || []).filter(
          (e: { status: string | null }) =>
            e.status === "published" || e.status === "ongoing"
        )
      );
    }
    fetchEvents();
  }, []);

  const processQRCode = useCallback(
    async (qrData: string) => {
      if (processing || !selectedEvent) return;
      setProcessing(true);
      try {
        const res = await fetch("/api/attendance/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: selectedEvent, qrData }),
        });
        const data = await res.json();

        setLastResult({
          success: data.success,
          message: data.message,
          studentName: data.studentName,
          iecdId: data.iecdId,
        });

        if (data.success) {
          setScanCount((prev) => prev + 1);
        }
      } catch {
        setLastResult({
          success: false,
          message: "Failed to connect to server",
        });
      }

      // Cool down to prevent double scans
      setTimeout(() => {
        setProcessing(false);
      }, 2000);
    },
    [processing, selectedEvent]
  );

  const startScanning = useCallback(async () => {
    if (!videoRef.current || !selectedEvent) return;
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const codeReader = new BrowserQRCodeReader();

      const videoDevices = await BrowserQRCodeReader.listVideoInputDevices();
      setDevices(videoDevices);

      let deviceId = selectedDeviceId;
      if (!deviceId && videoDevices.length > 0) {
        const backCam = videoDevices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("rear") ||
            d.label.toLowerCase().includes("environment")
        );
        deviceId = backCam ? backCam.deviceId : videoDevices[0].deviceId;
        setSelectedDeviceId(deviceId);
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? {
              deviceId: { exact: deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
      };

      const controls = await codeReader.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result) => {
          if (result && !processing) {
            processQRCode(result.getText());
          }
        }
      );
      controlsRef.current = controls;
      setScanning(true);
      setLastResult(null);
    } catch {
      alert(
        "Unable to access camera. Please grant camera permissions or select a different camera source."
      );
    }
  }, [selectedEvent, selectedDeviceId, processQRCode, processing]);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
  }, []);

  // Hot-swap camera source when dropdown changes
  useEffect(() => {
    if (prevDeviceIdRef.current !== selectedDeviceId && controlsRef.current) {
      prevDeviceIdRef.current = selectedDeviceId;
      stopScanning();
      const timer = setTimeout(() => {
        startScanning();
      }, 500);
      return () => clearTimeout(timer);
    }
    prevDeviceIdRef.current = selectedDeviceId;
  }, [selectedDeviceId, startScanning, stopScanning]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">QR Scanner</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Scan student QR codes to mark attendance
        </p>
      </div>

      {/* Event selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <Select
          value={selectedEvent}
          onValueChange={(value) => {
            setSelectedEvent(value);
            if (scanning) stopScanning();
          }}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select event to scan for" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Camera Selection Dropdown */}
      {devices.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Select Camera Source
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2 bg-white text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
          >
            {devices.map((device, i) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Camera view */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="aspect-square relative bg-gray-900">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white">
              <Camera className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-sm text-gray-400 mb-4">
                {selectedEvent
                  ? "Point your camera at a student's QR code. Ensure good lighting."
                  : "Select an event first"}
              </p>
              <Button
                onClick={startScanning}
                disabled={!selectedEvent}
                className="rounded-xl bg-white text-[#1a1a2e] hover:bg-gray-100"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </div>
          )}

          {/* Scan overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-white/50 rounded-2xl relative">
                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-xl" />
                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-xl" />
                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-xl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-xl" />
              </div>
            </div>
          )}

          {processing && (
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
              <Loader2 className="w-3 h-3 animate-spin mr-2" /> Processing...
            </div>
          )}
        </div>

        {scanning && (
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Scanned: <span className="font-bold text-[#1a1a2e]">{scanCount}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={stopScanning}
            >
              Stop
            </Button>
          </div>
        )}
      </div>

      {/* Last result */}
      {lastResult && (
        <div
          className={`rounded-2xl border p-4 flex items-center gap-3 ${
            lastResult.success
              ? "bg-green-50 border-green-100"
              : "bg-red-50 border-red-100"
          }`}
        >
          {lastResult.success ? (
            <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500 shrink-0" />
          )}
          <div>
            <p
              className={`font-medium text-sm ${
                lastResult.success ? "text-green-700" : "text-red-700"
              }`}
            >
              {lastResult.message}
            </p>
            {lastResult.studentName && (
              <p className="text-xs text-gray-500 mt-0.5">
                {lastResult.studentName} • {lastResult.iecdId}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
