"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  Code2,
  Share2,
  FolderGit2,
  ExternalLink,
  Edit3,
  Save,
  Loader2,
  X,
  User,
  Phone,
  Building,
  Briefcase,
  FileText,
} from "lucide-react";

export interface ProfileData {
  name: string;
  role?: string;
  email?: string;
  iecdId?: string;
  admissionNumber?: string;
  department?: string;
  batch?: string;
  designation?: string;
  phone: string | null;
  bio?: string | null;
  skills?: string[];
  interests?: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  behanceUrl?: string | null;
  portfolioUrl?: string | null;
  qrCodeUrl?: string | null;
  totalPoints?: number | null;
  eventsAttended?: number | null;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface IdCardProps {
  profile: ProfileData;
  avatar: string;
  editing?: boolean;
  editData?: Partial<ProfileData>;
  setEditData?: React.Dispatch<React.SetStateAction<Partial<ProfileData>>>;
  onSave?: () => void;
  onCancel?: () => void;
  onStartEdit?: () => void;
  saving?: boolean;
}

const BACKGROUND_PATTERN = "/profile/background.png";
const RECTANGLE_CUTOUT = "/profile/rectangle.png";

function GithubContributionChart({
  githubUsername,
  contributions,
  totalContributions,
}: {
  githubUsername: string;
  contributions: ContributionDay[] | null;
  totalContributions: number | null;
}) {
  if (!githubUsername) {
    return (
      <div className="py-6 text-center text-xs text-white/40">
        Add your GitHub username in Edit Profile to display your live activity graph.
      </div>
    );
  }

  const levelColors = [
    "#161b22", // Level 0
    "#0e4429", // Level 1
    "#006d32", // Level 2
    "#26a641", // Level 3
    "#39d353", // Level 4
  ];

  let weeks: ContributionDay[][] = [];
  if (contributions && contributions.length > 0) {
    let currentWeek: ContributionDay[] = [];
    contributions.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    if (weeks.length > 52) {
      weeks = weeks.slice(weeks.length - 52);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
          GitHub Contributions
        </p>
        <div className="flex items-center gap-3">
          {totalContributions !== null && (
            <span className="text-[11px] font-medium text-white/70">
              {totalContributions} contributions
            </span>
          )}
          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs font-medium text-[#39d353] hover:underline"
          >
            @{githubUsername}
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] p-3 shadow-inner">
        {weeks.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${weeks.length * 13} 91`}
              className="h-auto w-full max-w-full"
              style={{ minHeight: "80px" }}
            >
              {weeks.map((week, colIdx) => (
                <g key={colIdx} transform={`translate(${colIdx * 13}, 0)`}>
                  {week.map((day, rowIdx) => (
                    <rect
                      key={day.date || rowIdx}
                      x="0"
                      y={rowIdx * 13}
                      width="10"
                      height="10"
                      rx="2"
                      ry="2"
                      fill={levelColors[Math.min(day.level || 0, 4)]}
                    >
                      <title>{`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}</title>
                    </rect>
                  ))}
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden p-1">
            <img
              src={`https://ghchart.rshah.org/39d353/${githubUsername}`}
              alt={`${githubUsername}'s GitHub Contributions`}
              className="h-auto w-full rounded-lg filter contrast-125"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://github-readme-activity-graph.vercel.app/graph?username=${githubUsername}&theme=github-compact`;
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function IdCard({
  profile,
  avatar,
  editing = false,
  editData = {},
  setEditData,
  onSave,
  onCancel,
  onStartEdit,
  saving = false,
}: IdCardProps) {
  const role = profile.role || "Student";
  const year = profile.batch || "3rd Year";

  const [githubRepos, setGithubRepos] = useState<number | null>(null);
  const [totalContributions, setTotalContributions] = useState<number | null>(null);
  const [contributions, setContributions] = useState<ContributionDay[] | null>(null);

  const getUsername = (value?: string | null) => {
    if (!value) return "";
    return value.trim().replace(/^https?:\/\/(www\.)?[^\/]+\//, "").replace(/\/$/, "");
  };

  const githubUsername = getUsername(profile.githubUrl);
  const behanceUsername = getUsername(profile.behanceUrl);

  useEffect(() => {
    if (!githubUsername) {
      setGithubRepos(null);
      setTotalContributions(null);
      setContributions(null);
      return;
    }

    const fetchGithubData = async () => {
      try {
        const userRes = await fetch(`https://api.github.com/users/${githubUsername}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setGithubRepos(userData.public_repos);
        }

        const contribRes = await fetch(`https://github-contributions-api.jogruber.de/v4/${githubUsername}?y=last`);
        if (contribRes.ok) {
          const contribData = await contribRes.json();
          const total = Object.values(contribData.total || {}).reduce(
            (acc: number, curr: any) => acc + (typeof curr === "number" ? curr : 0),
            0
          );
          setTotalContributions(total as number);
          if (Array.isArray(contribData.contributions)) {
            setContributions(contribData.contributions);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live GitHub stats:", err);
      }
    };

    fetchGithubData();
  }, [githubUsername]);

  const cleanUsername = (val?: string | null) => {
    if (!val) return "";
    return val.trim().replace(/^https?:\/\/(www\.)?[^\/]+\//, "").replace(/\/$/, "");
  };

  return (
    <div className="relative flex w-180 max-w-[95vw] flex-col overflow-hidden rounded-[44px] border border-[#e8594c]/30 bg-[#0c0908] font-['Hanken_Grotesk'] text-white shadow-[0px_25px_70px_-15px_rgba(0,0,0,0.6)] transition-all">
      {/* 1. Graphic Banner */}
      <div className="relative mx-3 mt-3 h-64 shrink-0 overflow-hidden rounded-[36px] bg-red-950">
        <img
          src={BACKGROUND_PATTERN}
          alt="Background pattern"
          className="absolute inset-0 size-full object-cover opacity-90"
        />

        {/* Rectangle Cutout */}
        <div className="absolute bottom-0 left-1/2 h-10 w-60 -translate-x-1/2">
          <img
            src={RECTANGLE_CUTOUT}
            alt="Shape Cutout"
            className="size-full object-contain"
          />
        </div>

        {/* Avatar in Glowing Ring with Yellow Student Badge */}
        <div className="absolute left-1/2 top-9 h-36 w-36 -translate-x-1/2 rounded-full border-4 border-amber-500/90 bg-black p-1 shadow-2xl">
          <img
            src={avatar}
            alt={profile.name}
            className="size-full rounded-full object-cover"
          />
          <div className="absolute -right-1 top-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
            {role}
          </div>
        </div>
      </div>

      {/* 2. Top ID Pill */}
      <div className="absolute left-1/2 top-3 flex h-9.5 -translate-x-1/2 items-center justify-center rounded-b-[20px] bg-linear-to-b from-red-600 to-red-800 px-8 font-semibold text-white shadow-md">
        <span className="text-sm tracking-wide">
          {profile.iecdId || "IEDC-2025-CSE-00001"}
        </span>
      </div>

      {/* 3. Main Info */}
      <div className="px-8 pt-3 text-center">
        <p className="text-sm font-semibold tracking-wide text-white/80">
          {year}
        </p>

        <div className="mt-2.5 inline-block rounded-full bg-[#342624] px-5 py-1">
          <span className="text-xs font-medium text-white/90">{role}</span>
        </div>

        <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-white">
          {profile.name}
        </h1>
        <p className="mt-1 text-xs font-light text-white/60">
          {profile.designation || "Student"} • {profile.department || "N/A"}
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm font-light leading-relaxed text-white/90">
          {profile.bio || "No bio added yet"}
        </p>

        {/* Edit Button inside Profile Card */}
        {onStartEdit && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={onStartEdit}
              className="flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white/20 hover:border-white/40"
            >
              <span>{editing ? "Cancel Edit" : "Edit Profile"}</span>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/50">
                {editing ? <X className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 4. CONTENT AREA: VIEW MODE OR INLINE EDIT MODE */}
      {!editing ? (
        <div className="px-8 pb-8 pt-4 space-y-6">
          {/* Live Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/5 bg-[#1e1614] p-3.5 text-center">
              <p className="text-xs font-normal text-white/60">Points</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {profile.totalPoints ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#1e1614] p-3.5 text-center">
              <p className="text-xs font-normal text-white/60">GitHub Repos</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {githubUsername ? (githubRepos ?? "...") : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#1e1614] p-3.5 text-center">
              <p className="truncate text-xs font-normal text-white/60">
                Events Attended
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {profile.eventsAttended ?? 0}
              </p>
            </div>
          </div>

          {/* Social Links Grid */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              Profiles & Links
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {githubUsername ? (
                <a
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#161211] p-3 text-xs text-white transition hover:border-white/30 hover:bg-[#221b19]"
                >
                  <Code2 className="h-4 w-4 shrink-0 text-white" />
                  <span className="truncate font-medium">GitHub</span>
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#161211]/50 p-3 text-xs text-white/30">
                  <Code2 className="h-4 w-4" />
                  <span>GitHub</span>
                </div>
              )}

              {profile.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#161211] p-3 text-xs text-white transition hover:border-white/30 hover:bg-[#221b19]"
                >
                  <Share2 className="h-4 w-4 shrink-0 text-blue-400" />
                  <span className="truncate font-medium">LinkedIn</span>
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#161211]/50 p-3 text-xs text-white/30">
                  <Share2 className="h-4 w-4" />
                  <span>LinkedIn</span>
                </div>
              )}

              {behanceUsername ? (
                <a
                  href={`https://behance.net/${behanceUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#161211] p-3 text-xs text-white transition hover:border-white/30 hover:bg-[#221b19]"
                >
                  <FolderGit2 className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span className="truncate font-medium">Behance</span>
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#161211]/50 p-3 text-xs text-white/30">
                  <FolderGit2 className="h-4 w-4" />
                  <span>Behance</span>
                </div>
              )}

              {profile.portfolioUrl ? (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#161211] p-3 text-xs text-white transition hover:border-white/30 hover:bg-[#221b19]"
                >
                  <Globe className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="truncate font-medium">Portfolio</span>
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#161211]/50 p-3 text-xs text-white/30">
                  <Globe className="h-4 w-4" />
                  <span>Portfolio</span>
                </div>
              )}
            </div>
          </div>

          {/* GitHub Contribution Chart */}
          <GithubContributionChart
            githubUsername={githubUsername}
            contributions={contributions}
            totalContributions={totalContributions}
          />
        </div>
      ) : (
        /* INLINE EDIT FORM INSIDE THE CARD */
        <div className="px-8 pb-8 pt-4 space-y-4 font-['Hanken_Grotesk']">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Edit Profile Information</h2>
              <p className="text-xs text-white/50">Update your details directly inside the card</p>
            </div>
            <button
              onClick={onCancel}
              className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
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
            <div className="space-y-1">
              <label className="text-white/70 font-medium">Department</label>
              <input
                type="text"
                value={editData.department ?? ""}
                onChange={(e) =>
                  setEditData?.((p) => ({ ...p, department: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-[#161211] p-2.5 text-white outline-none focus:border-red-500"
                placeholder="e.g. CSE"
              />
            </div>

            {/* Designation */}
            <div className="space-y-1">
              <label className="text-white/70 font-medium">Designation</label>
              <input
                type="text"
                value={editData.designation ?? ""}
                onChange={(e) =>
                  setEditData?.((p) => ({ ...p, designation: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-[#161211] p-2.5 text-white outline-none focus:border-red-500"
                placeholder="e.g. Student / Member"
              />
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
              className="flex items-center gap-2 rounded-xl bg-linear-to-r from-red-600 to-red-700 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:from-red-500 hover:to-red-600 disabled:opacity-50"
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
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
