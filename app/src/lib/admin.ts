"use client";

// Drop 4c: admin auth moved from localStorage to the cloud API.
// /admin/login posts to /api/auth/admin-login which sets the same session
// cookie as players (with role='admin'). Auth state is now "do I have a
// valid admin cookie?" — checked via /api/auth/me.

export async function adminPasswordExists(): Promise<boolean> {
  // Check by attempting a login with no credentials. The endpoint returns
  // { enroll: true } when no admin row exists yet, otherwise an error.
  const res = await fetch("/api/auth/admin-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Empty body — server will see no password, return enroll status.
    body: JSON.stringify({ password: "x" }),
  });
  if (!res.ok) return true; // a 401 means an admin exists and the password is wrong
  const j = (await res.json()) as { enroll?: boolean; ok?: boolean };
  return !j.enroll;
}

export async function setAdminPassword(password: string): Promise<void> {
  const res = await fetch("/api/auth/admin-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, enroll: true }),
  });
  if (!res.ok) {
    const j = (await res.json()) as { error?: string };
    throw new Error(j.error ?? "Failed to enroll admin");
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const res = await fetch("/api/auth/admin-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

// startAdminSession is implicit: /api/auth/admin-login sets the cookie
// already. Kept as a no-op so existing call sites compile.
export function startAdminSession(): void {}

export async function isAdminAuthenticated(): Promise<boolean> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) return false;
  const j = (await res.json()) as { session: { role: string } | null };
  return j.session?.role === "admin";
}

export async function endAdminSession(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function resetAdmin(): Promise<void> {
  // No "delete admin user" endpoint yet — this is a stop-gap that just
  // logs out and clears local overrides. Admin row stays in DB (Drop 4d
  // can add a confirm-prompted DELETE endpoint if needed).
  await endAdminSession();
  if (typeof window !== "undefined") {
    localStorage.removeItem("pmc:admin:subjects");
    localStorage.removeItem("pmc:admin:adhoc");
  }
}
