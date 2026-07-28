import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { eventRegistrations, events, studentProfiles } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;
  const body = await request.json().catch(() => ({}));
  const role = (body.role as string) || "participant";

  // Get student profile
  let [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  const execomRoles = [
    "ceo", "cto", "to", "cfo", "fo", "cco", "co", "cio", "io", "cmo", "mo", "coo", "oo", "cso", "so", "cvo", "vo", "cwit", "wit"
  ];

  if (!profile) {
    const userRole = (session.user as Record<string, unknown>).role as string;
    if (execomRoles.includes(userRole || "")) {
      try {
        const { generateIEDCId } = await import("@/lib/iedc-id");
        const { generateQRSecret, generateQRDataURL } = await import("@/lib/qr");
        
        const qrSecret = generateQRSecret();
        const iecdId = await generateIEDCId("EX", new Date().getFullYear());
        
        const [newProfile] = await db
          .insert(studentProfiles)
          .values({
            userId: session.user.id,
            iecdId,
            name: session.user.name || "Execom User",
            admissionNumber: `EXE-${session.user.id.slice(0, 8)}`,
            department: "EX",
            batch: "EXECOM",
            phone: "",
            qrHmacSecret: qrSecret,
          })
          .returning();
          
        const qrCodeUrl = await generateQRDataURL(newProfile.id, iecdId, qrSecret);
        
        const [updatedProfile] = await db
          .update(studentProfiles)
          .set({ qrCodeUrl })
          .where(eq(studentProfiles.id, newProfile.id))
          .returning();
          
        profile = updatedProfile;
      } catch (error) {
        console.error("Failed to auto-create profile for Execom user:", error);
        return NextResponse.json(
          { error: "Failed to create student profile for Execom user" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }
  }

  // Check event exists and is published
  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event || event.status !== "published") {
    return NextResponse.json(
      { error: "Event not available for registration" },
      { status: 400 }
    );
  }

  // Check registration limit
  if (event.registrationLimit) {
    const regCount = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));

    if (regCount[0].count >= event.registrationLimit) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 });
    }
  }

  // Check deadline
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return NextResponse.json(
      { error: "Registration deadline has passed" },
      { status: 400 }
    );
  }

  // Check if already registered
  const existing = await db
    .select()
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.studentId, profile.id)
      )
    );

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Already registered for this event" },
      { status: 409 }
    );
  }

  const [registration] = await db
    .insert(eventRegistrations)
    .values({
      eventId,
      studentId: profile.id,
      role: role as "participant" | "volunteer",
    })
    .returning();

  return NextResponse.json(registration, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await db
    .delete(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.studentId, profile.id)
      )
    );

  return NextResponse.json({ message: "Registration cancelled" });
}
