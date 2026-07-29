"use client";

const BACKGROUND_PATTERN = "/profile/background.png";
const RECTANGLE_CUTOUT = "/profile/rectangle.png";

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
  portfolioUrl?: string | null;
  qrCodeUrl?: string | null;
  totalPoints?: number | null;
  githubRepos?: number | null;
  eventsAttended?: number | null;
}

interface IdCardProps {
  profile: ProfileData;
  avatar: string;
}

export function IdCard({ profile, avatar }: IdCardProps) {
  const role = profile.role || "Student";
  const year = profile.batch || "3rd Year";

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ url });
    } else {
      navigator.clipboard?.writeText(url);
    }
  };

    const newLocal = "absolute left-8.5 top-[315px] rounded-full bg-[#342624] px-4 py-1";
  return (
    <div className="relative h-170.5 w-112.5 max-w-[92vw] overflow-hidden rounded-[50px] border border-[#e8594c]/30 bg-[#0c0908] text-white shadow-[0px_20px_60px_-15px_rgba(0,0,0,0.3)]">
      {/* Header Graphic Section */}
      <div className="relative mx-2 mt-2 h-71.75 overflow-hidden rounded-[43px] bg-red-950">
        <img
          src={BACKGROUND_PATTERN}
          alt="Background pattern"
          className="absolute inset-0 size-full object-cover opacity-90"
        />
        <div className="absolute bottom-0 left-1/2 h-10 w-50 -translate-x-1/2">
          <img
            src={RECTANGLE_CUTOUT}
            alt="Shape Cutout"
            className="size-full object-contain"
          />
        </div>
        <div className="absolute left-1/2 top-13.75 h-40 w-40 -translate-x-1/2 overflow-hidden rounded-full border-4 border-white bg-black shadow-lg">
          <img
            src={avatar}
            alt={profile.name}
            className="size-full rounded-full object-cover"
          />
        </div>
      </div>

      {/* Top ID Pill */}
      <div className="absolute left-1/2 top-2 flex h-9 -translate-x-1/2 items-center justify-center rounded-b-[20px] bg-linear-to-b from-red-600 to-red-800 px-6 font-semibold text-white shadow-md">
        <span className="text-sm tracking-wide">
          {profile.iecdId || "IEDC-2025-CSE-00001"}
        </span>
      </div>

      {/* Year Label */}
      <p className="absolute left-1/2 top-65 -translate-x-1/2 text-sm font-semibold tracking-wide text-white">
        {year}
      </p>

      {/* Role Pill */}
      <div className={newLocal}>
        <span className="text-xs font-medium text-white/90">{role}</span>
      </div>

      {/* Profile Info */}
      <div className="absolute left-8.5 top-86.25 right-8.5">
        <h1 className="truncate text-3xl font-bold tracking-tight text-white">
          {profile.name}
        </h1>
        <p className="mt-1 text-xs font-light text-white/60">
          {profile.designation || "Him/Himself"} - {profile.department || "N/A"}
        </p>
        <p className="mt-1 truncate text-sm font-light text-white/90">
          {profile.bio || "No bio yet"}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="absolute left-8.5 top-113.75 right-8.5 flex justify-between gap-3">
        <div className="flex-1 rounded-xl bg-[#1e1614] p-3 text-left">
          <p className="text-xs font-normal text-white/70">Points</p>
          <p className="text-2xl font-bold text-white">
            {profile.totalPoints ?? 150}
          </p>
        </div>
        <div className="flex-1 rounded-xl bg-[#1e1614] p-3 text-left">
          <p className="text-xs font-normal text-white/70">Github repos</p>
          <p className="text-2xl font-bold text-white">
            {profile.githubRepos ?? 50}
          </p>
        </div>
        <div className="flex-1 rounded-xl bg-[#1e1614] p-3 text-left">
          <p className="truncate text-xs font-normal text-white/70">
            Event partici..
          </p>
          <p className="text-2xl font-bold text-white">
            {profile.eventsAttended ?? 10}
          </p>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="absolute bottom-6 left-1/2 h-12.5 w-50 -translate-x-1/2 rounded-full bg-white text-base font-semibold text-black transition hover:bg-white/90"
      >
        Share my profile
      </button>
    </div>
  );
}