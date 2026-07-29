"use client";

import { ProfileData } from "./id-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

interface EditProfileDrawerProps {
  editData: Partial<ProfileData>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<ProfileData>>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

export function EditProfileDrawer({
  editData,
  setEditData,
  onSave,
  onCancel,
  saving,
}: EditProfileDrawerProps) {
  return (
    <div className="mt-8 w-112.5 max-w-[92vw] space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-slate-900">Edit Profile</h2>

      <div className="space-y-1.5">
        <Label className="text-xs text-slate-600">Name</Label>
        <Input
          value={editData.name ?? ""}
          onChange={(e) =>
            setEditData((p) => ({ ...p, name: e.target.value }))
          }
          className="rounded-xl border-slate-300 bg-white text-slate-900"
          placeholder="Your Name"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-slate-600">Bio</Label>
        <Textarea
          value={editData.bio ?? ""}
          onChange={(e) => setEditData((p) => ({ ...p, bio: e.target.value }))}
          rows={3}
          className="resize-none rounded-xl border-slate-300 bg-white text-slate-900"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">Phone</Label>
          <Input
            value={editData.phone ?? ""}
            onChange={(e) =>
              setEditData((p) => ({ ...p, phone: e.target.value }))
            }
            className="rounded-xl border-slate-300 bg-white text-slate-900"
            placeholder="+91 9876543210"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">Department</Label>
          <Input
            value={editData.department ?? ""}
            onChange={(e) =>
              setEditData((p) => ({ ...p, department: e.target.value }))
            }
            className="rounded-xl border-slate-300 bg-white text-slate-900"
            placeholder="e.g. CSE"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-[#e8594c] text-white hover:bg-[#ff5900]"
        >
          {saving ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1 h-4 w-4" />
          )}
          Save Changes
        </Button>
        <Button
          variant="outline"
          className="rounded-xl border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}