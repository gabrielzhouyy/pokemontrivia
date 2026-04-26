"use client";

// Client-only admin auth. The threat model is "kid can't accidentally
// stumble in" — not "remote attacker can't crack it." The hash + session
// flag both live in localStorage; this is fine for a local-only prototype.

const KEY_HASH = "pmc:admin:hash";
const KEY_SESSION = "pmc:admin:session";

async function sha256(s: string): Promise<string> {
  if (typeof window === "undefined") return "";
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function adminPasswordExists(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(KEY_HASH);
}

export async function setAdminPassword(password: string): Promise<void> {
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  const hash = await sha256(password);
  localStorage.setItem(KEY_HASH, hash);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = localStorage.getItem(KEY_HASH);
  if (!stored) return false;
  const hash = await sha256(password);
  return hash === stored;
}

export function startAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_SESSION, "1");
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY_SESSION) === "1";
}

export function endAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_SESSION);
}

// Reset entire admin: clear password + session + all overrides. Useful if
// the dad forgets the password and needs to re-enroll.
export function resetAdmin(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_HASH);
  localStorage.removeItem(KEY_SESSION);
  localStorage.removeItem("pmc:admin:subjects");
  localStorage.removeItem("pmc:admin:adhoc");
}
