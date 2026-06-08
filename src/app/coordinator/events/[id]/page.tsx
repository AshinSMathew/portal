"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  TrendingUp,
  UserCheck,
  Loader2,
} from "lucide-react";
import { updateEventSchema } from "@/lib/validators";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  venue: string | null;
  startDatetime: string;
  endDatetime: string;
  status: string | null;
  participationPoints: number | null;
  volunteerPoints: number | null;
  registrationLimit: number | null;
  registrationCount: number;
  attendanceCount: number;
}

export default function CoordinatorEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        if (res.ok) {
          setEvent(await res.json());
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
          className="mt-4 rounded-xl"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  const start = new Date(event.startDatetime);
  const end = new Date(event.endDatetime);

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    published: "bg-blue-50 text-blue-700",
    ongoing: "bg-green-50 text-green-700",
    completed: "bg-purple-50 text-purple-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to events
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="capitalize mb-3">
              {event.eventType.replace("_", " ")}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
              {event.title}
            </h1>
          </div>
          <Badge
            variant="secondary"
            className={`capitalize shrink-0 ${statusColors[event.status || "draft"]}`}
          >
            {event.status}
          </Badge>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {start.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium">
              {start.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {end.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {event.venue && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium">{event.venue}</p>
            </div>
          )}

          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium">
              {event.registrationCount} registered
              {event.registrationLimit
                ? ` / ${event.registrationLimit} max`
                : ""}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mt-6">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-medium">
            <TrendingUp className="w-4 h-4" />+
            {event.participationPoints} pts (Participant)
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-sm font-medium">
            <TrendingUp className="w-4 h-4" />+
            {event.volunteerPoints} pts (Volunteer)
          </div>
          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-xl text-sm font-medium">
            <UserCheck className="w-4 h-4" />
            {event.attendanceCount} attended
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-[#1a1a2e] mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* Status actions */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="font-semibold text-[#1a1a2e] mb-3">Manage Status</h3>
          {message && (
            <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-blue-50 text-blue-700 border border-blue-100">
              {message}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {["draft", "published", "ongoing", "completed", "cancelled"]
              .filter((s) => s !== event.status)
              .map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className="rounded-xl capitalize"
                  disabled={updating}
                  onClick={() => updateStatus(status)}
                >
                  {updating ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : null}
                  {status}
                </Button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
