"use client";

import React, { forwardRef, useEffect, useState } from "react";
import { ProfileData, getDepartmentLabel } from "./id-card";

interface ProfileDownloadCardProps {
  profile: ProfileData;
  avatar: string;
  githubRepos?: number | null;
}

const BACKGROUND_PATTERN = "/profile/background.png";
const RECTANGLE_CUTOUT = "/profile/Rectangle.png";

export const ProfileDownloadCard = forwardRef<HTMLDivElement, ProfileDownloadCardProps>(
  ({ profile, avatar, githubRepos: initialGithubRepos }, ref) => {
    const role = profile.role || "Student";
    const year = profile.batch || "3rd Year";
    const iecdId = profile.iecdId || "IEDC-2025-CSE-00001";
    const nameUpper = profile.name ? profile.name.toUpperCase() : "STUDENT";

    const [repos, setRepos] = useState<number | null>(initialGithubRepos ?? null);

    useEffect(() => {
      if (initialGithubRepos !== undefined && initialGithubRepos !== null) {
        setRepos(initialGithubRepos);
        return;
      }

      if (!profile.githubUrl) return;

      const getUsername = (value?: string | null) => {
        if (!value) return "";
        return value.trim().replace(/^https?:\/\/(www\.)?[^\/]+\//, "").replace(/\/$/, "");
      };

      const username = getUsername(profile.githubUrl);
      if (!username) return;

      let active = true;
      fetch(`https://api.github.com/users/${username}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data && typeof data.public_repos === "number") {
            setRepos(data.public_repos);
          }
        })
        .catch(() => {});

      return () => {
        active = false;
      };
    }, [profile.githubUrl, initialGithubRepos]);

    // Generate repeating diagonal background watermark lines
    const watermarkText = `${nameUpper}  •  STUDENT ID CARD  •  `;
    const watermarkRows = Array.from({ length: 14 });

    return (
      <div
        ref={ref}
        style={{ width: "800px", height: "1000px" }}
        className="relative flex flex-col items-center justify-center overflow-hidden bg-[#070606] font-['Hanken_Grotesk'] text-white select-none"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-[500px] w-[500px] rounded-full bg-red-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-amber-600/10 blur-[140px] pointer-events-none" />

        {/* Diagonal Watermark Background Layer */}
        <div className="absolute inset-0 flex flex-col justify-center gap-12 rotate-[-32deg] scale-150 opacity-15 pointer-events-none overflow-hidden">
          {watermarkRows.map((_, i) => (
            <div
              key={i}
              className="flex whitespace-nowrap text-3xl font-black tracking-widest text-white/80 uppercase font-mono"
              style={{
                transform: `translateX(${(i % 2 === 0 ? -120 : 40)}px)`,
              }}
            >
              {watermarkText.repeat(8)}
            </div>
          ))}
        </div>

        {/* Outer ID Card Container */}
        <div className="relative z-10 w-[440px] overflow-hidden rounded-[38px] border border-[#e8594c]/40 bg-[#0c0908] font-['Hanken_Grotesk'] shadow-[0px_25px_70px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(232,89,76,0.15)] flex flex-col">
          {/* Top ID Pill */}
          <div className="absolute left-1/2 top-0 z-20 flex h-8 -translate-x-1/2 items-center justify-center rounded-b-[18px] bg-gradient-to-b from-red-600 to-red-800 px-6 font-semibold text-white shadow-md">
            <span className="text-xs tracking-wider">{iecdId}</span>
          </div>

          {/* Graphic Banner */}
          <div className="relative mx-2.5 mt-2.5 h-56 shrink-0 overflow-hidden rounded-[32px] bg-red-950">
            <img
              src={BACKGROUND_PATTERN}
              alt="Background pattern"
              className="absolute inset-0 size-full object-cover opacity-90"
              crossOrigin="anonymous"
            />

            {/* Shape Cutout */}
            <div className="absolute bottom-0 left-1/2 h-9 w-52 -translate-x-1/2">
              <img
                src={RECTANGLE_CUTOUT}
                alt="Shape Cutout"
                className="size-full object-contain"
                crossOrigin="anonymous"
              />
            </div>

            {/* Glowing Avatar */}
            <div className="absolute left-1/2 top-8 h-32 w-32 -translate-x-1/2 rounded-full border-4 border-amber-500/90 bg-black p-1 shadow-2xl">
              <img
                src={avatar}
                alt={profile.name}
                className="size-full rounded-full object-cover"
              />
              <div className="absolute -right-1 top-1 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black shadow-md">
                {role}
              </div>
            </div>
          </div>

          {/* Main Info */}
          <div className="px-6 pt-2.5 text-center">
            <p className="text-xs font-semibold tracking-wide text-white/80">
              {year}
            </p>

            <div className="mt-2 inline-block rounded-full bg-[#342624] px-4 py-0.5">
              <span className="text-[11px] font-medium text-white/90">{role}</span>
            </div>

            {/* Name */}
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white drop-shadow-sm font-['Hanken_Grotesk']">
              {profile.name}
            </h1>
            <p className="mt-0.5 text-[11px] font-light text-white/60">
              {profile.designation || "Student"} • {getDepartmentLabel(profile.department)}
            </p>
            {profile.bio && (
              <p className="mx-auto mt-1.5 max-w-xs text-xs font-light leading-relaxed text-white/85 line-clamp-2">
                "{profile.bio}"
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="px-6 pb-6 pt-3">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-white/10 bg-[#1e1614] p-2.5 text-center">
                <p className="text-[10px] font-normal text-white/60">Points</p>
                <p className="mt-0.5 text-xl font-bold text-white">
                  {profile.totalPoints ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#1e1614] p-2.5 text-center">
                <p className="text-[10px] font-normal text-white/60">Github repos</p>
                <p className="mt-0.5 text-xl font-bold text-white">
                  {repos ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#1e1614] p-2.5 text-center">
                <p className="truncate text-[10px] font-normal text-white/60">
                  Event partic...
                </p>
                <p className="mt-0.5 text-xl font-bold text-white">
                  {profile.eventsAttended ?? 0}
                </p>
              </div>
            </div>

            {/* Card Share Button Pill */}
            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-6 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                <span>IEDC SJCET • STUDENT ID CARD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text below Card */}
        <p className="relative z-10 mt-5 text-xs font-medium tracking-widest text-white/40 uppercase">
          IEDC 2026 SJCET • TECH TEAM
        </p>
      </div>
    );
  }
);

ProfileDownloadCard.displayName = "ProfileDownloadCard";
