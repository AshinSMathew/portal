import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateQRSecret, generateDynamicQRDataURL, secondsUntilNextWindow, QR_WINDOW_SECONDS } from "@/lib/qr";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select({ id: studentProfiles.id, iecdId: studentProfiles.iecdId, qrHmacSecret: studentProfiles.qrHmacSecret })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const qrDataUrl = await generateDynamicQRDataURL(profile.id, profile.iecdId, profile.qrHmacSecret);
  const expiresIn = secondsUntilNextWindow();

  return NextResponse.json(
    { qrDataUrl, expiresIn, windowSeconds: QR_WINDOW_SECONDS },
    { headers: { "Cache-Control": `private, max-age=${expiresIn}` } }
  );
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select({ id: studentProfiles.id, iecdId: studentProfiles.iecdId })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const newSecret = generateQRSecret();
  await db
    .update(studentProfiles)
    .set({ qrHmacSecret: newSecret, qrCodeUrl: null, updatedAt: new Date() })
    .where(eq(studentProfiles.id, profile.id));

  const qrDataUrl = await generateDynamicQRDataURL(profile.id, profile.iecdId, newSecret);
  return NextResponse.json({ qrDataUrl, message: "QR secret rotated — all previous codes invalidated" });
}