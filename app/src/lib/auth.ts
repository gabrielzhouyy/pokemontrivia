// Server-side auth helpers. Sessions are HMAC-signed cookies carrying the
// user id + role. No JWT lib — just Node crypto. The signing secret comes
// from SESSION_SECRET env var.

import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const COOKIE_NAME = "pmc_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

export type SessionPayload = {
  userId: number;
  username: string;
  role: "player" | "admin";
};

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function encode(p: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(p)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (sign(body) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSession(payload: SessionPayload): Promise<void> {
  const c = await cookies();
  c.set(COOKIE_NAME, encode(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  const raw = c.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decode(raw);
}

export async function clearSession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function requireSession(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return s;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const s = await requireSession();
  if (s.role !== "admin") throw Object.assign(new Error("Forbidden"), { status: 403 });
  return s;
}

export const hashPassword = (s: string) => bcrypt.hash(s, 10);
export const verifyPassword = (s: string, hash: string) => bcrypt.compare(s, hash);
