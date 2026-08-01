"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
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
          ? "/api/projects?status=approved&limit=20"
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
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-xs font-semibold px-2.5 py-0.5 border shrink-0">
            Approved
          </Badge>
        );
      case "changes_requested":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-xs font-semibold px-2.5 py-0.5 border shrink-0">
            Changes Requested
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-xs font-semibold px-2.5 py-0.5 border shrink-0">
            Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs font-semibold px-2.5 py-0.5 border shrink-0">
            Pending Review
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
            Projects
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Browse community projects and submit your own
          </p>
        </div>
        <Link href="/student/projects/submit">
          <Button className="rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] hidden md:flex">
            Submit Project
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 border-b border-gray-100 pb-px">
        <button
          onClick={() => setActiveTab("browse")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer",
            activeTab === "browse"
              ? "border-[#1a1a2e] text-[#1a1a2e]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          Browse Projects
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer",
            activeTab === "my"
              ? "border-[#1a1a2e] text-[#1a1a2e]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          My Submissions
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-[#1a1a2e] text-base">
                    {project.title}
                  </h3>
                  {activeTab === "my" && getStatusBadge(project.status)}
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                )}

                {activeTab === "my" && project.reviewComment && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <MessageSquare className="w-3.5 h-3.5" /> Execom Review Feedback:
                    </div>
                    <p className="leading-relaxed pl-5">{project.reviewComment}</p>
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs rounded-lg"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#1a1a2e] font-medium transition-colors"
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
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#1a1a2e] font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Demo
                    </a>
                  )}
                </div>

                {activeTab === "my" &&
                  (project.status === "changes_requested" || project.status === "rejected" || project.status === "pending") && (
                    <Button
                      size="sm"
                      onClick={() => openEditModal(project)}
                      className="h-8 px-3 rounded-xl bg-gray-100 hover:bg-[#1a1a2e] text-gray-700 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit &amp; Resubmit</span>
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No projects yet</p>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === "browse" ? "Be the first to submit a project!" : "You haven't submitted any projects yet."}
          </p>
        </div>
      )}

      <Dialog open={!!editingProject} onOpenChange={closeEditModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6 bg-white space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a1a2e] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#D9383A]" /> Edit &amp; Resubmit Project
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Update project details according to Execom feedback and submit for re-evaluation.
            </DialogDescription>
          </DialogHeader>

          {editingProject?.reviewComment && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block text-amber-800">Execom Feedback:</span>
              <p>{editingProject.reviewComment}</p>
            </div>
          )}

          <form onSubmit={handleResubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Project Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="rounded-xl text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="rounded-xl text-sm resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">GitHub URL</Label>
                <Input
                  value={editForm.githubUrl}
                  onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                  className="rounded-xl text-sm"
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Demo URL</Label>
                <Input
                  value={editForm.demoUrl}
                  onChange={(e) => setEditForm({ ...editForm, demoUrl: e.target.value })}
                  className="rounded-xl text-sm"
                  placeholder="https://demo.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tags (comma-separated)</Label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                className="rounded-xl text-sm"
                placeholder="React, IoT, AI"
              />
            </div>

            {resubmitError && (
              <p className="text-xs text-red-600 font-medium">{resubmitError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditModal}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resubmitting}
                className="rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] text-xs font-semibold px-5"
              >
                {resubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Resubmitting...
                  </>
                ) : (
                  "Resubmit for Review"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mobile FAB */}
      <Link href="/student/projects/submit" className="md:hidden fixed bottom-20 right-4 z-40">
        <Button className="rounded-full w-14 h-14 bg-[#1a1a2e] hover:bg-[#2a2a4e] shadow-xl">
          <span className="text-xl">+</span>
        </Button>
      </Link>
    </div>
  );
}