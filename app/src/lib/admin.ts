"use client";

export async function adminPasswordExists(): Promise<boolean> {
  // Check by attempting a login with no credentials. The endpoint returns
  // { enroll: true } when no admin row exists yet, otherwise an error.
  const res = await fetch("/api/auth/admin-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  await endAdminSession();
  if (typeof window !== "undefined") {
    localStorage.removeItem("pmc:admin:subjects");
  }
}
