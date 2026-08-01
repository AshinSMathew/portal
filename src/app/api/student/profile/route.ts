import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { studentProfiles, facultyProfiles, users, eventRegistrations, projects, certificates } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { updateProfileSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>).role as string;

  if (role === "student") {
    let [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, session.user.id));

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const [[eventsRes], [projectsRes], [certsRes]] = await Promise.all([
      db.select({ count: count() }).from(eventRegistrations).where(eq(eventRegistrations.studentId, profile.id)),
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

    const [updated] = await db
      .update(studentProfiles)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(studentProfiles.userId, session.user.id))
      .returning();

    const { id, userId, qrHmacSecret, qrCodeUrl, isDeleted, ...safe } = updated;
    return NextResponse.json({ ...safe, role });

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