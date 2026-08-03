"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, QrCode, LogOut, ExternalLink, ArrowLeft } from "lucide-react";
import { IdCard, ProfileData } from "./_components/id-card";
import { QrDialog } from "./_components/qr-dialog";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [modalQrUrl, setModalQrUrl] = useState("");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/student/profile");
        if (res.ok) setProfile(await res.json());
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const openQR = async () => {
    setQrLoading(true);
    setIsQRModalOpen(true);
    try {
      const res = await fetch("/api/student/qr");
      if (res.ok) {
        const { qrDataUrl } = await res.json();
        setModalQrUrl(qrDataUrl);
      }
    } catch (err) {
      console.error("Failed to load QR code", err);
    } finally {
      setQrLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setProfile(await res.json());
        setEditing(false);
        setEditData({});
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = () => {
    if (!profile) return;
    if (editing) {
      setEditing(false);
      setEditData({});
    } else {
      setEditing(true);
      setEditData({
        name: profile.name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        department: profile.department || "",
        designation: profile.designation || "",
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        behanceUrl: profile.behanceUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
      });
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile?.name || "User"}'s Profile`, url });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-white font-['Hanken_Grotesk'] text-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-white font-['Hanken_Grotesk'] text-slate-800">
        <p className="text-xl font-medium text-slate-600">Profile not found</p>
      </div>
    );
  }

  const avatar = session?.user?.image || "/profile/avatar.png";

  return (
    <div className="relative min-h-screen w-full bg-white/10 font-['Hanken_Grotesk'] text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Actions Bar */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between py-2">
        <button
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/student/dashboard");
            }
          }}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={openQR}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
          >
            <QrCode className="h-4 w-4" /> My QR
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      {/* Main Profile Card Area */}
      <div className="my-auto flex w-full flex-col items-center justify-center py-4">
        <IdCard
          profile={profile}
          avatar={avatar}
          editing={editing}
          editData={editData}
          setEditData={setEditData}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
          onStartEdit={handleStartEdit}
          saving={saving}
        />

        {/* Share Profile Action Outside Card */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2.5 rounded-full border border-red-500/30 bg-linear-to-r from-red-600 to-red-700 px-6 py-3 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:from-red-500 hover:to-red-600 hover:shadow-red-900/30"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{copied ? "Link Copied!" : "Share Profile"}</span>
          </button>
        </div>
      </div>

      {/* QR Dialog Component */}
      <QrDialog
        isOpen={isQRModalOpen}
        onOpenChange={setIsQRModalOpen}
        loading={qrLoading}
        qrUrl={modalQrUrl}
      />
    </div>
  );
}
