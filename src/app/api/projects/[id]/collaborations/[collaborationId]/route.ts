import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { projects, studentProfiles, projectCollaborations, projectTeamMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

const updateStatusSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; collaborationId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, collaborationId } = await params;

  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Check project ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project || project.submittedBy !== profile.id) {
    return NextResponse.json(
      { error: "Forbidden: Only the project owner can accept or reject applications" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Status must be 'accepted' or 'rejected'" }, { status: 400 });
  }

  const newStatus = parsed.data.status;

  const [collaboration] = await db
    .select()
    .from(projectCollaborations)
    .where(
      and(
        eq(projectCollaborations.id, collaborationId),
        eq(projectCollaborations.projectId, projectId)
      )
    );

  if (!collaboration) {
    return NextResponse.json({ error: "Collaboration application not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(projectCollaborations)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(projectCollaborations.id, collaborationId))
    .returning();

  // If accepted, add student to projectTeamMembers as contributor
  if (newStatus === "accepted") {
    const [existingMember] = await db
      .select()
      .from(projectTeamMembers)
      .where(
        and(
          eq(projectTeamMembers.projectId, projectId),
          eq(projectTeamMembers.studentId, collaboration.applicantId)
        )
      );

    if (!existingMember) {
      await db.insert(projectTeamMembers).values({
        projectId,
        studentId: collaboration.applicantId,
        role: `${collaboration.domain} Contributor`,
      });
    }
  }

  return NextResponse.json(updated);
}