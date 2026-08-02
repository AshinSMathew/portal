import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { studentProfiles, facultyProfiles, users, eventAttendance, projects, certificates } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { updateProfileSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetIecdId = searchParams.get("iecdId");

  const role = (session.user as Record<string, unknown>).role as string;

  if (targetIecdId) {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.iecdId, targetIecdId));

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const [[eventsRes], [projectsRes], [certsRes]] = await Promise.all([
      db.select({ count: count() }).from(eventAttendance).where(eq(eventAttendance.studentId, profile.id)),
      db.select({ count: count() }).from(projects).where(eq(projects.submittedBy, profile.id)),
      db.select({ count: count() }).from(certificates).where(eq(certificates.studentId, profile.id)),
    ]);

    const { id, userId, qrHmacSecret, isDeleted, ...safe } = profile;
    return NextResponse.json({
      ...safe,
      role: "student",
      eventsParticipatedCount: Number(eventsRes?.count || 0),
      projectsCount: Number(projectsRes?.count || 0),
      certificatesCount: Number(certsRes?.count || 0),
    });
  }

  if (role === "student") {
    let [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, session.user.id));

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const [[eventsRes], [projectsRes], [certsRes]] = await Promise.all([
      db.select({ count: count() }).from(eventAttendance).where(eq(eventAttendance.studentId, profile.id)),
      db.select({ count: count() }).from(projects).where(eq(projects.submittedBy, profile.id)),
      db.select({ count: count() }).from(certificates).where(eq(certificates.studentId, profile.id)),
    ]);

    const { id, userId, qrHmacSecret, isDeleted, ...safe } = profile;
    return NextResponse.json({
      ...safe,
      role,
      eventsParticipatedCount: Number(eventsRes?.count || 0),
      projectsCount: Number(projectsRes?.count || 0),
      certificatesCount: Number(certsRes?.count || 0),
    });

  } else if (role === "faculty") {
    let [profile] = await db
      .select()
      .from(facultyProfiles)
      .where(eq(facultyProfiles.userId, session.user.id));

    if (!profile) {
      [profile] = await db
        .insert(facultyProfiles)
        .values({ userId: session.user.id, name: session.user.name, phone: "", department: "", designation: "" })
        .returning();
    }

    const { id, userId, ...safe } = profile;
    return NextResponse.json({ ...safe, role, email: session.user.email });

  } else {
    // Execom roles or fallback
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    return NextResponse.json({
      name: user?.name || session.user.name,
      email: user?.email || session.user.email,
      role,
    });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>).role as string;
  const body = await request.json();

  if (role === "student") {
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { designation, ...dataToUpdate } = parsed.data;

    if (typeof dataToUpdate.department === "string") {
      dataToUpdate.department = dataToUpdate.department.trim().slice(0, 100);
    }

    // Normalize URLs
    if (typeof dataToUpdate.githubUrl === "string") {
      const val = dataToUpdate.githubUrl.trim();
      if (val) {
        dataToUpdate.githubUrl = val.startsWith("http://") || val.startsWith("https://")
          ? val
          : `https://github.com/${val.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/^@/, "")}`;
      } else {
        dataToUpdate.githubUrl = null;
      }
    }

    if (typeof dataToUpdate.linkedinUrl === "string") {
      const val = dataToUpdate.linkedinUrl.trim();
      if (val) {
        dataToUpdate.linkedinUrl = val.startsWith("http://") || val.startsWith("https://")
          ? val
          : `https://linkedin.com/in/${val.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "").replace(/^@/, "")}`;
      } else {
        dataToUpdate.linkedinUrl = null;
      }
    }

    if (typeof dataToUpdate.portfolioUrl === "string") {
      const val = dataToUpdate.portfolioUrl.trim();
      if (val) {
        dataToUpdate.portfolioUrl = val.startsWith("http://") || val.startsWith("https://")
          ? val
          : `https://${val}`;
      } else {
        dataToUpdate.portfolioUrl = null;
      }
    }

    if (dataToUpdate.name && dataToUpdate.name.trim()) {
      await db
        .update(users)
        .set({ name: dataToUpdate.name.trim() })
        .where(eq(users.id, session.user.id));
    }

    const [updated] = await db
      .update(studentProfiles)
      .set({ ...dataToUpdate, updatedAt: new Date() })
      .where(eq(studentProfiles.userId, session.user.id))
      .returning();

    const [[eventsRes], [projectsRes], [certsRes]] = await Promise.all([
      db.select({ count: count() }).from(eventAttendance).where(eq(eventAttendance.studentId, updated.id)),
      db.select({ count: count() }).from(projects).where(eq(projects.submittedBy, updated.id)),
      db.select({ count: count() }).from(certificates).where(eq(certificates.studentId, updated.id)),
    ]);

    const { id, userId, qrHmacSecret, qrCodeUrl, isDeleted, ...safe } = updated;
    return NextResponse.json({
      ...safe,
      role,
      eventsParticipatedCount: Number(eventsRes?.count || 0),
      projectsCount: Number(projectsRes?.count || 0),
      certificatesCount: Number(certsRes?.count || 0),
    });

  } else if (role === "faculty") {
    const updateData: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim().length >= 2) updateData.name = body.name.trim();
    if (typeof body.phone === "string") updateData.phone = body.phone.trim() || null;
    if (typeof body.department === "string") updateData.department = body.department.trim() || null;
    if (typeof body.designation === "string") updateData.designation = body.designation.trim() || null;

    const [updated] = await db
      .update(facultyProfiles)
      .set(updateData)
      .where(eq(facultyProfiles.userId, session.user.id))
      .returning();

    const { id, userId, ...safe } = updated;
    return NextResponse.json({ ...safe, role, email: session.user.email });

  } else {
    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      await db.update(users).set({ name: body.name.trim() }).where(eq(users.id, session.user.id));
    }
    return NextResponse.json({ message: "Profile updated" });
  }
}