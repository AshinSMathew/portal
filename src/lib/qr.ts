import crypto from "crypto";
import QRCode from "qrcode";

interface QRPayload {
  uid: string;
  iid: string;
  ts: number; // 30-second window slot
  h: string;  // HMAC truncated to 24 hex chars
}

export const QR_WINDOW_SECONDS = 30;

const ACCEPTED_WINDOWS = 2;

export function currentWindowSlot(): number {
  return Math.floor(Date.now() / 1000 / QR_WINDOW_SECONDS);
}

export function secondsUntilNextWindow(): number {
  const elapsed = Math.floor(Date.now() / 1000) % QR_WINDOW_SECONDS;
  return QR_WINDOW_SECONDS - elapsed;
}

export function generateQRSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hmacForWindow(userId: string, iecdId: string, secret: string, slot: number): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${userId}:${iecdId}:${slot}`)
    .digest("hex")
    .substring(0, 24);
}

export function buildDynamicQRPayload(userId: string, iecdId: string, secret: string): string {
  const ts = currentWindowSlot();
  const h = hmacForWindow(userId, iecdId, secret, ts);
  const payload: QRPayload = { uid: userId, iid: iecdId, ts, h };
  return JSON.stringify(payload);
}

export async function generateDynamicQRDataURL(
  userId: string,
  iecdId: string,
  secret: string
): Promise<string> {
  return QRCode.toDataURL(buildDynamicQRPayload(userId, iecdId, secret), {
    errorCorrectionLevel: "H",
    width: 400,
    margin: 3,
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });
}

export function verifyDynamicQRPayload(
  rawPayload: string,
  storedSecret: string
): { valid: boolean; userId?: string; iecdId?: string } {
  try {
    const payload: QRPayload = JSON.parse(rawPayload);
    if (!payload.uid || !payload.iid || !payload.ts || !payload.h) return { valid: false };

    const now = currentWindowSlot();

    for (let i = 0; i < ACCEPTED_WINDOWS; i++) {
      const slot = now - i;
      if (slot !== payload.ts) continue;

      const expected = hmacForWindow(payload.uid, payload.iid, storedSecret, slot);
      const isValid = crypto.timingSafeEqual(
        Buffer.from(payload.h, "hex"),
        Buffer.from(expected, "hex")
      );
      if (isValid) return { valid: true, userId: payload.uid, iecdId: payload.iid };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export function buildQRPayload(userId: string, iecdId: string, secret: string): string {
  return buildDynamicQRPayload(userId, iecdId, secret);
}

export async function generateQRDataURL(userId: string, iecdId: string, secret: string): Promise<string> {
  return generateDynamicQRDataURL(userId, iecdId, secret);
}
export function verifyQRPayload(rawPayload: string, storedSecret: string) {
  return verifyDynamicQRPayload(rawPayload, storedSecret);
}