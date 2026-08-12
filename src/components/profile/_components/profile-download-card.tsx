"use client";

import React, { forwardRef, useEffect, useState } from "react";
import { ProfileData, getDepartmentLabel, DEFAULT_AVATAR } from "./id-card";

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
    const nameUpper = profile.name ? profile.name.toUpperCase() : "STUDENT NAME";

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

    return (
      <div
        ref={ref}
        style={{ width: "1080px", height: "1350px" }}
        className="relative flex flex-col items-center justify-center overflow-hidden bg-[#070606] font-['Hanken_Grotesk'] text-white select-none"
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800;900&display=swap');
          * { font-family: 'Hanken Grotesk', sans-serif !important; }
        `}</style>

        {/* Ambient Glows */}
        <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-[600px] w-[600px] rounded-full bg-red-600/25 blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-amber-600/15 blur-[160px] pointer-events-none" />

        {/* 1. Curvy Background Banner: width: 2486.574px; height: 357.41px; transform: rotate(15.291deg); */}
        <div
          style={{
            width: "2486.574px",
            height: "357.41px",
            transform: "rotate(15.291deg)",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none overflow-hidden"
        >
          <div className="flex whitespace-nowrap text-[80px] font-black tracking-[0.2em] uppercase text-white/15 font-['Hanken_Grotesk']">
            STUDENT ID CARD  •  STUDENT ID CARD  •  STUDENT ID CARD  •  STUDENT ID CARD
          </div>
        </div>

        {/* 2. Diagonal User Name Watermark: width: 1778.677px; height: 702.556px; transform: rotate(-4.079deg); fill: rgba(255, 255, 255, 0.47) */}
        <div
          style={{
            width: "1778.677px",
            height: "702.556px",
            transform: "rotate(-4.079deg)",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none overflow-hidden z-0"
        >
          <div
            style={{ color: "rgba(255, 255, 255, 0.47)" }}
            className="text-[130px] font-black tracking-tighter uppercase whitespace-nowrap font-['Hanken_Grotesk'] leading-tight drop-shadow-sm select-none"
          >
            {nameUpper}
          </div>
          <div
            style={{ color: "rgba(255, 255, 255, 0.47)" }}
            className="text-[130px] font-black tracking-tighter uppercase whitespace-nowrap font-['Hanken_Grotesk'] leading-tight drop-shadow-sm select-none mt-2"
          >
            {nameUpper}
          </div>
        </div>

        {/* 3. Centered Outer ID Card Container */}
        <div className="relative z-10 w-[500px] overflow-hidden rounded-[44px] border border-[#e8594c]/40 bg-[#0c0908] font-['Hanken_Grotesk'] shadow-[0px_30px_90px_-15px_rgba(0,0,0,0.9),0_0_45px_rgba(232,89,76,0.2)] flex flex-col">
          {/* Top ID Pill */}
          <div className="absolute left-1/2 top-0 z-20 flex h-9 -translate-x-1/2 items-center justify-center rounded-b-[20px] bg-gradient-to-b from-red-600 to-red-800 px-8 font-semibold text-white shadow-md">
            <span className="text-xs font-bold tracking-widest">{iecdId}</span>
          </div>

          {/* Graphic Banner */}
          <div className="relative mx-3 mt-3 h-64 shrink-0 overflow-hidden rounded-[36px] bg-red-950">
            <img
              src={BACKGROUND_PATTERN}
              alt="Background pattern"
              className="absolute inset-0 size-full object-cover opacity-90"
              crossOrigin="anonymous"
            />

            {/* Shape Cutout */}
            <div className="absolute bottom-0 left-1/2 h-10 w-60 -translate-x-1/2">
              <img
                src={RECTANGLE_CUTOUT}
                alt="Shape Cutout"
                className="size-full object-contain"
                crossOrigin="anonymous"
              />
            </div>

            {/* Glowing Avatar */}
            <div className="absolute left-1/2 top-9 h-36 w-36 -translate-x-1/2 rounded-full border-4 border-amber-500/90 bg-black p-1 shadow-2xl">
              <img
                src={avatar || DEFAULT_AVATAR}
                alt={profile.name}
                className="size-full rounded-full object-cover"
                onError={(e) => {
                  const t = e.currentTarget;
                  if (t.src !== DEFAULT_AVATAR) {
                    t.onerror = null;
                    t.src = DEFAULT_AVATAR;
                  }
                }}
              />
              <div className="absolute -right-1 top-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
                {role}
              </div>
            </div>
          </div>

          {/* Main Card Information (Strictly Contained) */}
          <div className="px-8 pt-3 text-center">
            <p className="text-xs font-semibold tracking-wider text-white/80 uppercase">
              {year}
            </p>

            <div className="mt-2 inline-block rounded-full bg-[#342624] px-4 py-1">
              <span className="text-xs font-medium text-white/90">{role}</span>
            </div>

            {/* User Name */}
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white drop-shadow-md font-['Hanken_Grotesk'] leading-tight break-words max-w-full">
              {profile.name}
            </h1>
            <p className="mt-1 text-xs font-normal text-white/70">
              {profile.designation || "Student"} • {getDepartmentLabel(profile.department)}
            </p>
            {profile.bio && (
              <p className="mx-auto mt-2 max-w-xs text-xs font-light leading-relaxed text-white/90 line-clamp-2 italic">
                "{profile.bio}"
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="px-8 pb-7 pt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#1e1614] p-3 text-center">
                <p className="text-[11px] font-medium text-white/60">Points</p>
                <p className="mt-0.5 text-2xl font-bold text-white">
                  {profile.totalPoints ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#1e1614] p-3 text-center">
                <p className="text-[11px] font-medium text-white/60">Github repos</p>
                <p className="mt-0.5 text-2xl font-bold text-white">
                  {repos ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#1e1614] p-3 text-center">
                <p className="truncate text-[11px] font-medium text-white/60">
                  Events
                </p>
                <p className="mt-0.5 text-2xl font-bold text-white">
                  {profile.eventsAttended ?? 0}
                </p>
              </div>
            </div>

            {/* Card Share Button Pill */}
            <div className="mt-5 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-6 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-md tracking-wider">
                <span>IEDC SJCET • STUDENT ID CARD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text below Card */}
        <p className="relative z-10 mt-6 text-xs font-bold tracking-[0.25em] text-white/50 uppercase font-['Hanken_Grotesk']">
          IEDC 2026 SJCET • TECH TEAM
        </p>
      </div>
    );
  }
);

ProfileDownloadCard.displayName = "ProfileDownloadCard";
