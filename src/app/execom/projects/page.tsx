"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Loader2,
  FolderOpen,
  FolderGit2,
  Code2,
  Globe,
  ExternalLink,
  Search,
  RefreshCw,
  Sparkles,
  Clock,
  Tag,
  Filter,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  tags: string[];
  status: string | null;
  reviewComment?: string | null;
  submittedAt: string | null;
}

const STATUS_FILTERS = [
  { key: "pending", label: "Pending Review" },
  { key: "changes_requested", label: "Changes Requested" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All Projects" },
];

export default function ExecomProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [commentsMap, setCommentsMap] = useState<Record<string, string>>({});

  const fetchProjects = async (status: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects?status=${status}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        const rawList: Record<string, unknown>[] = data.projects || [];
        const formatted: ProjectData[] = rawList.map((p) => ({
          id: p.id as string,
          title: (p.title as string) || "Untitled Project",
          description: (p.description as string) || null,
          githubUrl: (p.githubUrl as string) || (p.github_url as string) || null,
          demoUrl: (p.demoUrl as string) || (p.demo_url as string) || null,
          tags: (p.tags as string[]) || [],
          status: (p.status as string) || "pending",
          reviewComment:
            (p.reviewComment as string) || (p.review_comment as string) || null,
          submittedAt:
            (p.submittedAt as string) || (p.submitted_at as string) || null,
        }));
        setProjects(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(activeStatus);
  }, [activeStatus]);

  async function reviewProject(
    id: string,
    status: "approved" | "rejected" | "changes_requested"
  ) {
    setReviewing(id);
    const comment = commentsMap[id] || "";
    try {
      const res = await fetch(`/api/projects/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewComment: comment }),
      });
      if (res.ok) {
        if (activeStatus === "all") {
          setProjects((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, status, reviewComment: comment || p.reviewComment }
                : p
            )
          );
        } else {
          setProjects((prev) => prev.filter((p) => p.id !== id));
        }
        setCommentsMap((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    } catch (error) {
      console.error("Review error:", error);
    } finally {
      setReviewing(null);
    }
  }

  const handleCommentChange = (id: string, text: string) => {
    setCommentsMap((prev) => ({ ...prev, [id]: text }));
  };

  const filteredProjects = projects.filter((project) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      project.title.toLowerCase().includes(q) ||
      (project.description || "").toLowerCase().includes(q) ||
      (project.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchesQuery;
  });

  const statusBadgeStyles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200/70 font-semibold",
    changes_requested: "bg-orange-50 text-orange-700 border-orange-200/70 font-semibold",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200/70 font-semibold",
    rejected: "bg-rose-50 text-rose-700 border-rose-200/70 font-semibold",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending Review",
    changes_requested: "Changes Requested",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <div className="w-full space-y-6 font-['Hanken_Grotesk'] text-[#1A0D0C] pb-16">
      <div className="w-full max-w-[1014px] min-h-[200px] rounded-[38px] bg-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden shadow-sm border border-gray-100/80 my-8 gap-6 group">
        <div className="z-10 max-w-xl space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-[#D9383A]/10 text-[#D9383A] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5" /> Project Incubator
            </span>
          </div>
          <h1 className="text-[36px] md:text-[46px] font-semibold text-[#1A0D0C] tracking-[-1.38px] leading-tight">
            Project Submissions Review
          </h1>
          <p className="text-[16px] md:text-[20px] font-semibold text-[#B0B0B0] tracking-[-0.6px] leading-snug">
            Evaluate, share feedback, request changes, or approve student innovation projects.
          </p>
        </div>

        <div className="z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchProjects(activeStatus)}
            disabled={loading}
            suppressHydrationWarning
            className="flex items-center justify-center h-[52px] px-6 gap-2.5 rounded-[31px] bg-[#100A0A] text-white text-[15px] font-normal tracking-[-0.5px] shadow-sm hover:bg-[#2A2020] active:scale-98 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4 text-[#D9383A]", loading && "animate-spin")} />
            <span>Refresh Projects</span>
          </button>
        </div>

        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#D9383A]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-[1014px] bg-white rounded-[32px] border border-gray-100 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {STATUS_FILTERS.map((tab) => {
            const isActive = activeStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveStatus(tab.key)}
                className={cn(
                  "inline-flex items-center justify-center px-4 py-1.5 rounded-[26.92px] border text-[13px] font-normal tracking-[-0.39px] whitespace-nowrap transition-all duration-200 cursor-pointer h-[36px]",
                  isActive
                    ? "bg-[#100A0A] border-[#A5A5A5] text-white shadow-sm"
                    : "bg-[#E2E2E2] border-[#A5A5A5] text-[#3C3C3C] hover:bg-gray-200"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search title, tags, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[42px] bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-4 text-xs text-[#1A0D0C] placeholder-gray-400 focus:outline-none focus:border-[#D9383A] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="max-w-[1014px] space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 bg-white rounded-[32px] border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-[32px] border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden space-y-5"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-[#1A0D0C] tracking-tight group-hover:text-[#D9383A] transition-colors">
                        {project.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "capitalize text-xs px-3 py-0.5 rounded-full border shadow-2xs flex items-center gap-1",
                          statusBadgeStyles[project.status || "pending"]
                        )}
                      >
                        <Sparkles className="w-3 h-3 opacity-70" />
                        <span>{statusLabels[project.status || "pending"] || project.status}</span>
                      </Badge>
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
                        {project.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gray-100 hover:bg-[#100A0A] hover:text-white text-gray-700 text-xs font-medium transition-all shadow-2xs"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>GitHub Repository</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}

                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-red-50 hover:bg-[#D9383A] hover:text-white text-[#D9383A] text-xs font-medium transition-all shadow-2xs"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}

                      {project.submittedAt && (
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1 ml-1">
                          <Clock className="w-3 h-3" />
                          Submitted {new Date(project.submittedAt).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </div>

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <Tag className="w-3.5 h-3.5 text-gray-400 mr-1" />
                        {project.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {project.reviewComment && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <MessageSquare className="w-3.5 h-3.5" /> Execom Feedback:
                    </div>
                    <p className="leading-relaxed pl-5">{project.reviewComment}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#D9383A]" /> Review Comment / Feedback for Student
                    </label>
                    <textarea
                      value={commentsMap[project.id] || ""}
                      onChange={(e) => handleCommentChange(project.id, e.target.value)}
                      placeholder="Add constructive notes or specific edit requests for the student..."
                      rows={2}
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl p-3 text-xs text-[#1A0D0C] placeholder-gray-400 focus:outline-none focus:border-[#D9383A] focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    {(project.status || "pending") !== "approved" && (
                      <Button
                        size="sm"
                        disabled={reviewing === project.id}
                        onClick={() => reviewProject(project.id, "approved")}
                        className="h-[40px] px-5 rounded-[31px] bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        {reviewing === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Approve</span>
                          </>
                        )}
                      </Button>
                    )}

                    {(project.status || "pending") !== "changes_requested" && (
                      <Button
                        size="sm"
                        disabled={reviewing === project.id}
                        onClick={() => reviewProject(project.id, "changes_requested")}
                        className="h-[40px] px-5 rounded-[31px] bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        {reviewing === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            <span>Request Changes</span>
                          </>
                        )}
                      </Button>
                    )}

                    {(project.status || "pending") !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={reviewing === project.id}
                        onClick={() => reviewProject(project.id, "rejected")}
                        className="h-[40px] px-5 rounded-[31px] border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 active:scale-98 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[38px] border border-gray-100 p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[#D9383A] flex items-center justify-center">
              <FolderOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-gray-800 font-bold text-lg">
                No {statusLabels[activeStatus] || activeStatus} projects found
              </p>
              <p className="text-gray-400 text-xs max-w-md">
                {activeStatus === "pending"
                  ? "All caught up! New student project submissions will appear here for review."
                  : `There are currently no projects with '${statusLabels[activeStatus] || activeStatus}' status.`}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1014px] pt-12 flex justify-end">
        <p className="w-[242px] h-[26px] text-[#AAA] text-right font-['Hanken_Grotesk'] text-[16px] font-normal leading-[94.331%] tracking-[-0.48px]">
          IEDC 2026 SJCET - TECH TEAM
        </p>
      </div>
    </div>
  );
}