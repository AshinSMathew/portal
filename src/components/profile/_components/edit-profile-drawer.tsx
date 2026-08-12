"use client";

import { ProfileData, DEPARTMENTS } from "./id-card";
import { Loader2, Save, X } from "lucide-react";

interface EditProfileDrawerProps {
  editData: Partial<ProfileData>;
  setEditData?: React.Dispatch<React.SetStateAction<Partial<ProfileData>>>;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
}

export function EditProfileDrawer({
  editData,
  setEditData,
  onSave,
  onCancel,
  saving = false,
}: EditProfileDrawerProps) {
  const cleanUsername = (val?: string | null) => {
    if (!val) return "";
    let clean = val.trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    clean = clean.replace(/^(github\.com|linkedin\.com\/in|linkedin\.com|behance\.net)\//i, "");
    return clean.replace(/^in\//i, "");
  };

  return (
    <div className="px-8 pb-8 pt-4 space-y-4 font-['Hanken_Grotesk'] text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-base font-bold text-white">Edit Profile Information</h2>
          <p className="text-xs text-white/50">Update your details directly inside the card</p>
        </div>
        <button
          onClick={onCancel}
          className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-white/70 font-medium">Full Name</label>
          <input
            type="text"
            value={editData.name ?? ""}
            onChange={(e) =>
              setEditData?.((p) => ({ ...p, name: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-[#161211] p-2.5 text-white outline-none focus:border-red-500"
            placeholder="Your Name"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-white/70 font-medium">Phone</label>
          <input
            type="text"
            value={editData.phone ?? ""}
            onChange={(e) =>
              setEditData?.((p) => ({ ...p, phone: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-[#161211] p-2.5 text-white outline-none focus:border-red-500"
            placeholder="+91 9876543210"
          />
        </div>

        {/* Department */}
        <div className="space-y-1 font-['Hanken_Grotesk']">
          <label className="text-white/70 font-medium">Department</label>
          <select
            value={(editData.department || "").toUpperCase()}
            onChange={(e) =>
              setEditData?.((p) => ({ ...p, department: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-[#161211] p-2.5 text-white outline-none focus:border-red-500 cursor-pointer font-['Hanken_Grotesk'] text-xs"
          >
            <option value="" disabled className="bg-[#161211] text-white/50">
              Select Department
            </option>
            {DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value} className="bg-[#161211] text-white">
                {d.label}
              </option>
            ))}
            {editData.department &&
              !DEPARTMENTS.some(
                (d) => d.value === (editData.department || "").toUpperCase()
              ) && (
                <option value={editData.department} className="bg-[#161211] text-white">
                  {editData.department.toUpperCase()}
                </option>
              )}
          </select>
        </div>

        {/* Bio (Full Width) */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-white/70 font-medium">Bio</label>
          <textarea
            value={editData.bio ?? ""}
            onChange={(e) =>
              setEditData?.((p) => ({ ...p, bio: e.target.value }))
            }
            rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#161211] p-2.5 text-white outline-none focus:border-red-500"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* GitHub */}
        <div className="space-y-1">
          <label className="text-white/70 font-medium">GitHub Username</label>
          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#161211]">
            <span className="flex items-center border-r border-white/10 bg-white/5 px-2.5 text-[10px] text-white/50 select-none">
              github.com/
            </span>
            <input
              type="text"
              value={cleanUsername(editData.githubUrl)}
              onChange={(e) =>
                setEditData?.((p) => ({ ...p, githubUrl: e.target.value }))
              }
              className="w-full bg-transparent p-2 text-xs text-white outline-none"
              placeholder="username"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div className="space-y-1">
          <label className="text-white/70 font-medium">LinkedIn Username</label>
          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#161211]">
            <span className="flex items-center border-r border-white/10 bg-white/5 px-2.5 text-[10px] text-white/50 select-none">
              linkedin.com/in/
            </span>
            <input
              type="text"
              value={cleanUsername(editData.linkedinUrl)}
              onChange={(e) =>
                setEditData?.((p) => ({ ...p, linkedinUrl: e.target.value }))
              }
              className="w-full bg-transparent p-2 text-xs text-white outline-none"
              placeholder="username"
            />
          </div>
        </div>

        {/* Behance */}
        <div className="space-y-1">
          <label className="text-white/70 font-medium">Behance Username</label>
          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#161211]">
            <span className="flex items-center border-r border-white/10 bg-white/5 px-2.5 text-[10px] text-white/50 select-none">
              behance.net/
            </span>
            <input
              type="text"
              value={cleanUsername(editData.behanceUrl)}
              onChange={(e) =>
                setEditData?.((p) => ({ ...p, behanceUrl: e.target.value }))
              }
              className="w-full bg-transparent p-2 text-xs text-white outline-none"
              placeholder="username"
            />
          </div>
        </div>

        {/* Portfolio */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-white/70 font-medium">Portfolio URL</label>
          <input
            type="text"
            value={editData.portfolioUrl ?? ""}
            onChange={(e) =>
              setEditData?.((p) => ({ ...p, portfolioUrl: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-[#161211] p-2.5 text-white outline-none focus:border-red-500"
            placeholder="https://yourportfolio.com"
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-linear-to-r from-red-600 to-red-700 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:from-red-500 hover:to-red-600 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>Save Changes</span>
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}