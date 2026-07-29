"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, Edit3, QrCode, LogOut } from "lucide-react";
import { IdCard, ProfileData } from "./_components/id-card";
import { EditProfileDrawer } from "./_components/edit-profile-drawer";
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
    setEditing(!editing);
    setEditData({
      name: profile.name || "",
      bio: profile.bio || "",
      phone: profile.phone || "",
      department: profile.department || "",
      designation: profile.designation || "",
      linkedinUrl: profile.linkedinUrl || "",
      githubUrl: profile.githubUrl || "",
      portfolioUrl: profile.portfolioUrl || "",
    });
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
    <div className="relative min-h-screen w-full bg-white/10 font-['Hanken_Grotesk'] text-slate-900">
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center px-4 py-12">
        {/* Actions Bar */}
        <div className="absolute right-6 top-6 z-20 flex gap-3">
          <button
            onClick={openQR}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
          >
            <QrCode className="h-4 w-4" /> My QR
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Card Presentation Component */}
        <IdCard profile={profile} avatar={avatar} />

        {/* Footer Nav Controls */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            back to home
          </button>
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <Edit3 className="h-4 w-4" /> edit profile
          </button>
        </div>

        {/* Edit Drawer Component */}
        {editing && (
          <EditProfileDrawer
            editData={editData}
            setEditData={setEditData}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
            saving={saving}
          />
        )}
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