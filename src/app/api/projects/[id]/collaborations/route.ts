import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { projects, studentProfiles, projectCollaborations, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { applyCollaborationSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Verify project existence and ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.submittedBy !== profile.id) {
    return NextResponse.json({ error: "Forbidden: Only project owner can view applicants" }, { status: 403 });
  }

  const collaborations = await db
    .select({
      id: projectCollaborations.id,
      projectId: projectCollaborations.projectId,
      applicantId: projectCollaborations.applicantId,
      domain: projectCollaborations.domain,
      message: projectCollaborations.message,
      status: projectCollaborations.status,
      appliedAt: projectCollaborations.appliedAt,
      applicant: {
        id: studentProfiles.id,
        name: studentProfiles.name,
        email: users.email,
        department: studentProfiles.department,
        batch: studentProfiles.batch,
        admissionNumber: studentProfiles.admissionNumber,
        iecdId: studentProfiles.iecdId,
        phone: studentProfiles.phone,
        bio: studentProfiles.bio,
        skills: studentProfiles.skills,
        interests: studentProfiles.interests,
        linkedinUrl: studentProfiles.linkedinUrl,
        githubUrl: studentProfiles.githubUrl,
        behanceUrl: studentProfiles.behanceUrl,
        portfolioUrl: studentProfiles.portfolioUrl,
        totalPoints: studentProfiles.totalPoints,
      },
    })
    .from(projectCollaborations)
    .innerJoin(studentProfiles, eq(projectCollaborations.applicantId, studentProfiles.id))
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(eq(projectCollaborations.projectId, projectId));

  return NextResponse.json({ collaborations });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  // Fetch project
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.submittedBy === profile.id) {
    return NextResponse.json(
      { error: "You cannot apply to contribute to your own project" },
      { status: 400 }
    );
  }

  if (!project.lookingForContributors) {
    return NextResponse.json(
      { error: "This project is not currently accepting contributors" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = applyCollaborationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { domain, message } = parsed.data;

  // Check if student has already applied for this domain
  const [existing] = await db
    .select()
    .from(projectCollaborations)
    .where(
      and(
        eq(projectCollaborations.projectId, projectId),
        eq(projectCollaborations.applicantId, profile.id),
        eq(projectCollaborations.domain, domain)
      )
    );

  if (existing) {
    return NextResponse.json(
      { error: `You have already applied for the ${domain} role on this project` },
      { status: 409 }
    );
  }

  const [collaboration] = await db
    .insert(projectCollaborations)
    .values({
      projectId,
      applicantId: profile.id,
      domain,
      message: message || null,
      status: "pending",
    })
    .returning();

  return NextResponse.json(collaboration, { status: 201 });
}
