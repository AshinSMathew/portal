"use client";

import type { BadgeCriteria } from "@/lib/points";

interface BadgeCardProps {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria: BadgeCriteria;
  earnedAt: string | null;
  compact?: boolean;
}

const CRITERIA_LABELS: Record<string, (c: BadgeCriteria) => string> = {
  points: (c) => `${(c as { threshold: number }).threshold}+ points`,
  event_count: (c) => `${(c as { min: number }).min}+ events attended`,
  project_count: (c) => `${(c as { min: number }).min}+ approved projects`,
  volunteer_count: (c) => `${(c as { min: number }).min}+ times volunteered`,
  streak: (c) => `${(c as { min: number }).min}+ event streak`,
};

function getCriteriaLabel(criteria: BadgeCriteria): string {
  const fn = CRITERIA_LABELS[criteria.type];
  return fn ? fn(criteria) : "Special achievement";
}

function formatEarnedDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BadgeCard({ name, description, icon, criteria, earnedAt, compact }: BadgeCardProps) {
  const isEarned = !!earnedAt;

  if (compact) {
    return (
      <div
        className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 font-['Hanken_Grotesk'] ${isEarned
          ? "bg-white border border-gray-100/90 shadow-sm hover:shadow-md"
          : "bg-gray-50/50 border border-gray-100 opacity-60"
          }`}
      >
        <span
          className={`text-2xl transition-transform duration-300 ${isEarned ? "group-hover:scale-125" : "grayscale"
            }`}
        >
          {icon || "🏅"}
        </span>
        <span
          className={`text-[10px] font-bold text-center leading-tight font-['Hanken_Grotesk'] ${isEarned ? "text-[#1A0D0C]" : "text-gray-400"
            }`}
        >
          {name}
        </span>
        {isEarned && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-[26px] border p-5 transition-all duration-300 font-['Hanken_Grotesk'] ${isEarned
        ? "bg-white border-gray-100/90 shadow-sm hover:shadow-md"
        : "bg-gray-50/60 border-gray-100"
        }`}
    >
      {/* Earned glow effect */}
      {isEarned && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-400/10 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400/10 rounded-full blur-xl" />
        </div>
      )}

      <div className="relative z-10 flex items-start gap-4 font-['Hanken_Grotesk']">
        {/* Badge icon */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all duration-300 font-['Hanken_Grotesk'] ${isEarned
            ? "bg-[#FAF6EE] group-hover:scale-110 group-hover:rotate-3 shadow-xs"
            : "bg-gray-100 grayscale opacity-60"
            }`}
        >
          {icon || "🏅"}
        </div>

        {/* Badge info */}
        <div className="flex-1 min-w-0 font-['Hanken_Grotesk']">
          <div className="flex items-center gap-2 font-['Hanken_Grotesk']">
            <h3
              className={`font-bold text-sm truncate font-['Hanken_Grotesk'] ${isEarned ? "text-[#1A0D0C]" : "text-gray-400"
                }`}
            >
              {name}
            </h3>
            {isEarned && (
              <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold shrink-0 font-['Hanken_Grotesk']">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Unlocked
              </span>
            )}
          </div>

          <p
            className={`text-xs mt-0.5 leading-relaxed font-['Hanken_Grotesk'] ${isEarned ? "text-gray-600" : "text-gray-400"
              }`}
          >
            {description}
          </p>

          <div className="flex items-center gap-3 mt-2.5 font-['Hanken_Grotesk']">
            <span
              className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full font-['Hanken_Grotesk'] ${isEarned
                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                : "bg-gray-100 text-gray-400"
                }`}
            >
              {getCriteriaLabel(criteria)}
            </span>

            {isEarned && earnedAt && (
              <span className="text-[10px] text-gray-400 font-medium font-['Hanken_Grotesk']">
                Earned {formatEarnedDate(earnedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Lock icon for unearned */}
        {!isEarned && (
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}