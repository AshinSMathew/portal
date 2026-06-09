import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  const targetId = searchParams.get("id");

  if (targetId) {
    const profile = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, targetId));

    if (profile.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const publicProfile = { ...profile[0] };
    delete (publicProfile as Record<string, unknown>).qrHmacSecret;
    return NextResponse.json(publicProfile);
  }

  const profile = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (profile.length === 0) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile[0]);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  if (typeof body.linkedinUrl === "string") {
    let val = body.linkedinUrl.trim();
    if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
      if (val.includes("linkedin.com")) {
        val = `https://${val}`;
      } else {
        val = `https://linkedin.com/in/${val}`;
      }
    }
    body.linkedinUrl = val;
  }

  if (typeof body.githubUrl === "string") {
    let val = body.githubUrl.trim();
    if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
      if (val.includes("github.com")) {
        val = `https://${val}`;
      } else {
        val = `https://github.com/${val}`;
      }
    }
    body.githubUrl = val;
  }

  if (typeof body.portfolioUrl === "string") {
    let val = body.portfolioUrl.trim();
    if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
      val = `https://${val}`;
    }
    body.portfolioUrl = val;
  }

  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(studentProfiles)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(studentProfiles.userId, session.user.id))
    .returning();

  return NextResponse.json(updated);
}