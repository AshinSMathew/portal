import crypto from "crypto";
import QRCode from "qrcode";

interface QRPayload {
  uid: string;
  iid: string;
  ts: number;
  h: string;
}

export const QR_WINDOW_SECONDS = 30;
const ACCEPTED_WINDOWS = 2;

export function currentWindowSlot(): number {
  return Math.floor(Date.now() / 1000 / QR_WINDOW_SECONDS);
}

export function secondsUntilNextWindow(): number {
  return QR_WINDOW_SECONDS - (Math.floor(Date.now() / 1000) % QR_WINDOW_SECONDS);
}

export function generateQRSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hmacForWindow(uid: string, iecdId: string, secret: string, slot: number): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${uid}:${iecdId}:${slot}`)
    .digest("hex")
    .substring(0, 24);
}

export function buildDynamicQRPayload(uid: string, iecdId: string, secret: string): string {
  const ts = currentWindowSlot();
  const h = hmacForWindow(uid, iecdId, secret, ts);
  const payload: QRPayload = { uid, iid: iecdId, ts, h };
  return JSON.stringify(payload);
}

export async function generateDynamicQRDataURL(uid: string, iecdId: string, secret: string): Promise<string> {
  return QRCode.toDataURL(buildDynamicQRPayload(uid, iecdId, secret), {
    errorCorrectionLevel: "H",
    width: 400,
    margin: 3,
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });
}

export function verifyDynamicQRPayload(
  rawPayload: string,
  storedSecret: string
): { valid: boolean; uid?: string; iecdId?: string } {
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
      if (isValid) return { valid: true, uid: payload.uid, iecdId: payload.iid };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Legacy aliases
export function buildQRPayload(uid: string, iecdId: string, secret: string): string {
  return buildDynamicQRPayload(uid, iecdId, secret);
}
export async function generateQRDataURL(uid: string, iecdId: string, secret: string): Promise<string> {
  return generateDynamicQRDataURL(uid, iecdId, secret);
}
export function verifyQRPayload(rawPayload: string, storedSecret: string) {
  return verifyDynamicQRPayload(rawPayload, storedSecret);
}