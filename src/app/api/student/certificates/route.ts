import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { certificates, studentProfiles, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find student profile
  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) {
    return NextResponse.json({ certificates: [] });
  }

  // Query certificates for student with left join on events
  const certsList = await db
    .select({
      id: certificates.id,
      certificateNumber: certificates.certificateNumber,
      certificateUrl: certificates.certificateUrl,
      issuedAt: certificates.issuedAt,
      eventId: certificates.eventId,
      eventTitle: events.title,
      eventType: events.eventType,
      eventVenue: events.venue,
      eventStartDatetime: events.startDatetime,
    })
    .from(certificates)
    .leftJoin(events, eq(certificates.eventId, events.id))
    .where(eq(certificates.studentId, profile.id))
    .orderBy(desc(certificates.issuedAt));

  return NextResponse.json({ certificates: certsList });
}