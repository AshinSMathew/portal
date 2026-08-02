"use client";

import { useEffect, useState } from "react";
import {
  FolderGit2,
  Search,
  GitBranch,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  GraduationCap,
  RefreshCw,
  Trophy,
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
  studentName?: string | null;
  department?: string | null;
  admissionNumber?: string | null;
  iecdId?: string | null;
  batch?: string | null;
}

export default function FacultyProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects?limit=100&status=all");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects by status tab & search query
  const filteredProjects = projects.filter((project) => {
    const matchesStatus =
      activeStatusFilter === "all" ||
      (project.status || "pending").toLowerCase() === activeStatusFilter.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      project.title.toLowerCase().includes(q) ||
      (project.description || "").toLowerCase().includes(q) ||
      (project.studentName || "").toLowerCase().includes(q) ||
      (project.department || "").toLowerCase().includes(q) ||
      (project.admissionNumber || "").toLowerCase().includes(q) ||
      (project.iecdId || "").toLowerCase().includes(q) ||
      (project.tags || []).some((tag) => tag.toLowerCase().includes(q));

    return matchesStatus && matchesQuery;
  });

  const getStatusBadge = (status: string | null) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-['Hanken_Grotesk']">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case "changes_requested":
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold font-['Hanken_Grotesk']">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Changes Requested
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold font-['Hanken_Grotesk']">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold font-['Hanken_Grotesk']">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 font-['Hanken_Grotesk'] text-[#1A0D0C] pb-16">
      <div className="relative w-full max-w-[1014px] min-h-[203px] bg-white rounded-[38px] border border-gray-100/80 p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden font-['Hanken_Grotesk']">
        <div className="absolute top-0 right-0 w-[240.16px] h-[37.24px] rounded-bl-[65px] bg-gradient-to-b from-[#FF0000] to-[#990000] flex items-center justify-center text-white font-['Hanken_Grotesk'] text-[15.2px] font-semibold tracking-[-0.456px] z-10 shadow-sm">
          STUDENT INNOVATIONS
        </div>

        <div className="space-y-1 pt-2 md:pt-0 max-w-xl">
          <h1 className="text-[36px] sm:text-[46px] font-semibold text-[#1A0D0C] tracking-[-1.38px] leading-tight font-['Hanken_Grotesk']">
            Student Projects
          </h1>
          <p className="text-[16px] sm:text-[20px] font-semibold text-[#B0B0B0] tracking-[-0.6px] leading-snug font-['Hanken_Grotesk']">
            Review, monitor, and inspect student innovation submissions across campus
          </p>
        </div>

        {/* Total Submissions Pill & Refresh Action */}
        <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
          <div className="flex flex-col justify-end items-start w-[145px] h-[101px] p-[14px_20px_10px_20px] rounded-[20px] bg-[#1E1614] gap-[5px] shadow-sm font-['Hanken_Grotesk']">
            <span className="text-[#FFFFFF] text-[15px] font-normal tracking-[-0.5px] leading-none truncate max-w-full">
              Total Projects
            </span>
            <span className="text-[#FFFFFF] text-[38px] font-bold tracking-[-1.14px] leading-none">
              {projects.length}
            </span>
          </div>

          <button
            onClick={fetchProjects}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer disabled:opacity-50 font-['Hanken_Grotesk']"
            title="Refresh Projects"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & Live Search */}
      <div className="max-w-[1014px] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-['Hanken_Grotesk']">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none font-['Hanken_Grotesk']">
          {[
            { id: "all", label: "All Projects" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "changes_requested", label: "Changes Requested" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusFilter(tab.id)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer font-['Hanken_Grotesk']",
                activeStatusFilter === tab.id
                  ? "bg-[#1A0D0C] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-[320px] shrink-0 font-['Hanken_Grotesk']">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, students, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[44px] pl-11 pr-4 rounded-[22px] bg-white border border-gray-200/80 text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#1A0D0C] transition-colors shadow-xs font-['Hanken_Grotesk']"
          />
        </div>
      </div>

      {/* Projects Feed */}
      {loading ? (
        <div className="space-y-4 max-w-[1014px] font-['Hanken_Grotesk']">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-44 bg-white rounded-[32px] border border-gray-100/80 p-6 md:p-8 animate-pulse shadow-xs"
            />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="space-y-4 max-w-[1014px] font-['Hanken_Grotesk']">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-[32px] border border-gray-100/90 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 font-['Hanken_Grotesk']"
            >
              {/* Card Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-xl font-bold text-[#1A0D0C] tracking-tight font-['Hanken_Grotesk']">
                      {project.title}
                    </h3>
                    {project.iecdId && (
                      <span className="font-mono text-[11px] text-[#990000] bg-[#FF0000]/10 px-2.5 py-0.5 rounded-full font-bold border border-[#FF0000]/20">
                        {project.iecdId}
                      </span>
                    )}
                  </div>

                  {/* Submitter Info Line */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-500 font-medium font-['Hanken_Grotesk']">
                    {project.studentName && (
                      <span className="flex items-center gap-1 text-[#1A0D0C] font-semibold">
                        <User className="w-3.5 h-3.5 text-[#990000]" />
                        {project.studentName}
                      </span>
                    )}
                    {project.department && (
                      <span className="bg-gray-100 px-2.5 py-0.5 rounded-md text-[#1A0D0C] font-semibold">
                        Dept: {project.department}
                      </span>
                    )}
                    {project.admissionNumber && (
                      <span className="font-mono text-gray-500">
                        Adm: {project.admissionNumber}
                      </span>
                    )}
                    {project.batch && (
                      <span className="text-gray-400">
                        Batch: {project.batch}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {getStatusBadge(project.status)}
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-sm text-gray-600 leading-relaxed font-normal font-['Hanken_Grotesk']">
                  {project.description}
                </p>
              )}

              {/* Execom Review Feedback Block */}
              {project.reviewComment && (
                <div className="p-4 rounded-[20px] bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1 font-['Hanken_Grotesk']">
                  <span className="font-bold block text-amber-800">
                    Execom Review Feedback:
                  </span>
                  <p className="leading-relaxed">{project.reviewComment}</p>
                </div>
              )}

              {/* Bottom Metadata & Action Links */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-['Hanken_Grotesk']">
                <div className="flex flex-wrap items-center gap-2">
                  {project.tags && project.tags.length > 0 ? (
                    project.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-[#F6F5F3] text-[#1A0D0C] px-3 py-1 rounded-xl text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-[11px] italic">
                      No tags specified
                    </span>
                  )}
                </div>

                {/* Links & Timestamp */}
                <div className="flex items-center gap-4 shrink-0 font-['Hanken_Grotesk']">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#1A0D0C] hover:text-[#990000] transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Code Repository</span>
                    </a>
                  )}

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#1A0D0C] hover:text-[#990000] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}

                  {project.submittedAt && (
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(project.submittedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="max-w-[1014px] bg-white rounded-[38px] border border-gray-100/90 p-12 md:p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-3 font-['Hanken_Grotesk']">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-[#1A0D0C] font-['Hanken_Grotesk']">
            No projects found
          </h3>
          <p className="text-sm text-gray-400 max-w-md font-['Hanken_Grotesk']">
            No student project submissions match your selected filter or search query.
          </p>
        </div>
      )}

      {/* Footer Branding */}
      <div className="max-w-[1014px] pt-12 flex justify-end font-['Hanken_Grotesk']">
        <p className="w-[242px] h-[26px] text-[#AAA] text-right font-['Hanken_Grotesk'] text-[16px] font-normal leading-[94.331%] tracking-[-0.48px]">
          IEDC 2026 SJCET - TECH TEAM
        </p>
      </div>
    </div>
  );
}