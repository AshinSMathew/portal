"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  ExternalLink,
  GitBranch,
  MessageSquare,
  RotateCcw,
  Pencil,
  Loader2,
  Search,
  Plus,
  ArrowUpRight,
  Sparkles,
  Code2,
  Layers,
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

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"browse" | "my">("browse");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    githubUrl: "",
    demoUrl: "",
    tags: "",
  });
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitError, setResubmitError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const url =
        activeTab === "browse"
          ? "/api/projects?status=approved&limit=30"
          : "/api/projects?my=true";
      const res = await fetch(url);
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
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeTab]);

  const filteredProjects = projects.filter((project) => {
    const title = project.title.toLowerCase();
    const desc = (project.description || "").toLowerCase();
    const tags = (project.tags || []).join(" ").toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    return !query || title.includes(query) || desc.includes(query) || tags.includes(query);
  });

  const openEditModal = (project: ProjectData) => {
    setEditingProject(project);
    setEditForm({
      title: project.title || "",
      description: project.description || "",
      githubUrl: project.githubUrl || "",
      demoUrl: project.demoUrl || "",
      tags: (project.tags || []).join(", "),
    });
    setResubmitError("");
  };

  const closeEditModal = () => {
    setEditingProject(null);
    setResubmitError("");
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setResubmitting(true);
    setResubmitError("");

    try {
      const body = {
        title: editForm.title,
        description: editForm.description,
        githubUrl: editForm.githubUrl,
        demoUrl: editForm.demoUrl,
        tags: editForm.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        closeEditModal();
        fetchProjects();
      } else {
        const data = await res.json();
        setResubmitError(data.error || "Failed to resubmit project");
      }
    } catch {
      setResubmitError("Something went wrong while updating project");
    } finally {
      setResubmitting(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-semibold px-3 py-0.5 shrink-0">
            Approved
          </span>
        );
      case "changes_requested":
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-300/80 rounded-full text-xs font-semibold px-3 py-0.5 shrink-0">
            Changes Requested
          </span>
        );
      case "rejected":
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200/80 rounded-full text-xs font-semibold px-3 py-0.5 shrink-0">
            Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full text-xs font-semibold px-3 py-0.5 shrink-0">
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 font-['Hanken_Grotesk'] text-[#1A0D0C] pb-16">
      {/* Hero Header Banner */}
      <div className="relative w-full max-w-[1014px] min-h-[203px] bg-white rounded-[38px] border border-gray-100/80 p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[240.16px] h-[37.24px] rounded-bl-[65px] bg-gradient-to-b from-[#FF0000] to-[#990000] flex items-center justify-center text-white font-['Hanken_Grotesk'] text-[15.2px] font-semibold tracking-[-0.456px] z-10 shadow-sm">
          IEDC SJCET INNOVATION
        </div>

        <div className="space-y-1 pt-2 md:pt-0 max-w-xl">
          <h1 className="text-[36px] sm:text-[46px] font-semibold text-[#1A0D0C] tracking-[-1.38px] leading-tight">
            Projects
          </h1>
          <p className="text-[16px] sm:text-[20px] font-semibold text-[#B0B0B0] tracking-[-0.6px] leading-snug">
            Browse community projects and showcase your latest technical innovations
          </p>
        </div>

        {/* Submit Action Button */}
        <div className="shrink-0 pt-2 md:pt-0">
          <Link
            href="/student/projects/submit"
            className="flex items-center justify-between w-[175px] h-[44px] pl-[22px] pr-[10px] py-[6px] rounded-[31px] text-white text-[15px] font-semibold tracking-[-0.45px] transition-transform active:scale-95 shadow-sm shrink-0"
            style={{
              background:
                "radial-gradient(133.5% 127.27% at 48.91% 127.27%, rgba(89, 7, 8, 0.23) 0%, rgba(102, 102, 102, 0.00) 100%), #0F0A0A",
            }}
          >
            <span>Submit Project</span>
            <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-black" />
            </span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="max-w-[1014px] space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <button
              onClick={() => setActiveTab("browse")}
              className={cn(
                "inline-flex items-center justify-center px-5 py-1.5 rounded-[26.92px] border text-[13.026px] font-medium tracking-[-0.391px] whitespace-nowrap transition-all duration-200 cursor-pointer h-[36px]",
                activeTab === "browse"
                  ? "bg-[#100A0A] border-[#A5A5A5] text-white shadow-sm"
                  : "bg-[#E2E2E2] border-[#A5A5A5] text-[#3C3C3C] hover:bg-gray-200"
              )}
            >
              Browse Projects
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={cn(
                "inline-flex items-center justify-center px-5 py-1.5 rounded-[26.92px] border text-[13.026px] font-medium tracking-[-0.391px] whitespace-nowrap transition-all duration-200 cursor-pointer h-[36px]",
                activeTab === "my"
                  ? "bg-[#100A0A] border-[#A5A5A5] text-white shadow-sm"
                  : "bg-[#E2E2E2] border-[#A5A5A5] text-[#3C3C3C] hover:bg-gray-200"
              )}
            >
              My Submissions
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-[280px] shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[36px] pl-10 pr-4 rounded-[26.92px] bg-white border border-gray-200 text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#1A0D0C] transition-colors shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid / Skeleton / Empty States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1014px] pt-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-full h-[240px] bg-white rounded-[32px] border border-gray-100/80 p-6 animate-pulse flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="h-6 bg-gray-100 rounded-xl w-2/3" />
                <div className="h-4 bg-gray-100 rounded-lg w-full" />
                <div className="h-4 bg-gray-100 rounded-lg w-4/5" />
              </div>
              <div className="h-8 bg-gray-100 rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1014px] pt-2">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="w-full bg-white rounded-[32px] border border-gray-100/90 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden space-y-4"
            >
              <div className="space-y-3">
                {/* Top header row */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-[#1A0D0C] text-lg leading-snug group-hover:text-[#990000] transition-colors">
                    {project.title}
                  </h3>
                  {activeTab === "my" && getStatusBadge(project.status)}
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                )}

                {/* Execom Review Feedback Box */}
                {activeTab === "my" && project.reviewComment && (
                  <div className="p-4 rounded-[20px] bg-[#FAE9CF]/60 border border-[#EAE3D2] text-xs text-amber-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <MessageSquare className="w-3.5 h-3.5" /> Execom Review Feedback:
                    </div>
                    <p className="leading-relaxed pl-5 text-amber-900/90">
                      {project.reviewComment}
                    </p>
                  </div>
                )}

                {/* Tags list */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold text-gray-600 bg-gray-100/80 px-3 py-1 rounded-full border border-gray-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100/80 mt-auto gap-3">
                <div className="flex items-center gap-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#1A0D0C] font-semibold transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200/60"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#1A0D0C] font-semibold transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200/60"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live Demo
                    </a>
                  )}
                </div>

                {activeTab === "my" &&
                  (project.status === "changes_requested" ||
                    project.status === "rejected" ||
                    project.status === "pending") && (
                    <button
                      onClick={() => openEditModal(project)}
                      className="h-[34px] px-4 rounded-full bg-[#1A0D0C] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit &amp; Resubmit</span>
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="max-w-[1014px] bg-white rounded-[38px] border border-gray-100/80 p-12 md:p-16 text-center shadow-sm flex flex-col items-center justify-center my-4">
          <div className="w-20 h-20 rounded-full bg-[#FAE9CF] flex items-center justify-center mb-5 text-[#990000] shadow-inner">
            <FolderOpen className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-semibold text-[#1A0D0C] tracking-tight">
            {activeTab === "browse" ? "No Approved Projects Found" : "No Submissions Yet"}
          </h3>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mt-2 leading-relaxed">
            {activeTab === "browse"
              ? searchQuery
                ? "No projects matched your search query. Try searching for something else."
                : "Be the first student to submit and showcase your technical project!"
              : "You haven't submitted any projects yet. Share your project with the IEDC SJCET community."}
          </p>

          <Link
            href="/student/projects/submit"
            className="mt-6 inline-flex items-center justify-between w-[175px] h-[40px] pl-[20px] pr-[8px] py-[5px] rounded-[31px] text-white text-[14px] font-semibold tracking-[-0.45px] transition-transform active:scale-95 shadow-sm"
            style={{
              background:
                "radial-gradient(133.5% 127.27% at 48.91% 127.27%, rgba(89, 7, 8, 0.23) 0%, rgba(102, 102, 102, 0.00) 100%), #0F0A0A",
            }}
          >
            <span>Submit Project</span>
            <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-black" />
            </span>
          </Link>
        </div>
      )}

      {/* Edit & Resubmit Modal Dialog */}
      <Dialog open={!!editingProject} onOpenChange={closeEditModal}>
        <DialogContent className="sm:max-w-lg rounded-[32px] p-6 sm:p-8 bg-white border border-gray-100 shadow-2xl space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1A0D0C] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#990000]" /> Edit &amp; Resubmit Project
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Update your project details according to Execom review feedback and submit for re-evaluation.
            </DialogDescription>
          </DialogHeader>

          {editingProject?.reviewComment && (
            <div className="p-4 rounded-[20px] bg-[#FAE9CF]/60 border border-[#EAE3D2] text-xs text-amber-950 space-y-1">
              <span className="font-bold block text-amber-900">Execom Feedback:</span>
              <p className="leading-relaxed">{editingProject.reviewComment}</p>
            </div>
          )}

          <form onSubmit={handleResubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A0D0C]">Project Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="rounded-2xl text-xs h-[42px]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A0D0C]">Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="rounded-2xl text-xs resize-none p-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1A0D0C]">GitHub URL</Label>
                <Input
                  value={editForm.githubUrl}
                  onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                  className="rounded-2xl text-xs h-[42px]"
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1A0D0C]">Demo URL</Label>
                <Input
                  value={editForm.demoUrl}
                  onChange={(e) => setEditForm({ ...editForm, demoUrl: e.target.value })}
                  className="rounded-2xl text-xs h-[42px]"
                  placeholder="https://demo.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A0D0C]">Tags (comma-separated)</Label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                className="rounded-2xl text-xs h-[42px]"
                placeholder="React, IoT, AI"
              />
            </div>

            {resubmitError && (
              <p className="text-xs text-red-600 font-semibold">{resubmitError}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditModal}
                className="rounded-full text-xs px-5 h-[38px]"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={resubmitting}
                className="h-[38px] px-6 rounded-full text-white text-xs font-semibold transition-transform active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(133.5% 127.27% at 48.91% 127.27%, rgba(89, 7, 8, 0.23) 0%, rgba(102, 102, 102, 0.00) 100%), #0F0A0A",
                }}
              >
                {resubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Resubmitting...
                  </>
                ) : (
                  "Resubmit for Review"
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mobile Floating Action Button */}
      <Link href="/student/projects/submit" className="md:hidden fixed bottom-20 right-4 z-40">
        <div
          className="rounded-full w-14 h-14 text-white shadow-xl flex items-center justify-center cursor-pointer transition-transform active:scale-95"
          style={{
            background:
              "radial-gradient(133.5% 127.27% at 48.91% 127.27%, rgba(89, 7, 8, 0.23) 0%, rgba(102, 102, 102, 0.00) 100%), #0F0A0A",
          }}
        >
          <Plus className="w-6 h-6 text-white" />
        </div>
      </Link>

      <div className="max-w-[1014px] pt-12 flex justify-end">
        <p className="w-[242px] h-[26px] text-[#AAA] text-right font-['Hanken_Grotesk'] text-[16px] font-normal leading-[94.331%] tracking-[-0.48px]">
          IEDC 2026 SJCET - TECH TEAM
        </p>
      </div>
    </div>
  );
}