"use client";
// Client-side storage layer. After Drop 4b this is a thin async wrapper
// around /api/profile. Same exported names as before so callers don't
// need updating beyond awaiting the calls.

import {
  type Profile,
  type OwnedPokemon,
  DEFAULT_PRI_LEVEL,
  newProfile as newProfileObj,
} from "./profile-types";
import { syncSubjectsFromCloud } from "./subjects";
import { syncBankFromCloud } from "./questions";

export type { Profile, OwnedPokemon };
export { DEFAULT_PRI_LEVEL };

const LEGACY_KEY_PREFIX = "pmc:profile:";

// ---------- Auth-flow helpers (used by /login and /admin/login) ----------

export async function login(
  username: string,
  pin: string,
  priLevel?: number,
): Promise<Profile | null> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, pin, priLevel }),
  });
  if (!res.ok) return null;
  await maybeMigrateLocalProfile(username);
  return loadCurrentProfile();
}

export async function register(
  username: string,
  pin: string,
  priLevel?: number,
): Promise<Profile | null> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, pin, priLevel }),
  });
  if (!res.ok) return null;
  await maybeMigrateLocalProfile(username);
  return loadCurrentProfile();
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUsername(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) return null;
  const j = (await res.json()) as { session: { username: string; role: string } | null };
  return j.session?.username ?? null;
}

// ---------- Profile read/write ----------

export async function loadCurrentProfile(): Promise<Profile | null> {
  if (typeof window === "undefined") return null;
  const res = await fetch("/api/profile", { cache: "no-store" });
  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) return null;
  const j = (await res.json()) as { profile: Profile };
  // Refresh admin overrides into localStorage so cross-device admin edits
  // (subjects + bank questions) take effect on this device. Best-effort —
  // failures here don't block the profile load.
  void syncSubjectsFromCloud();
  void syncBankFromCloud();
  return j.profile;
}

export async function saveProfile(profile: Profile): Promise<void> {
  await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
}

// ---------- Migration: upload any pre-existing localStorage profile ----------

// On first cloud login for a username, look for a legacy localStorage
// profile under that name and seed the cloud with it. Idempotent: cleared
// after upload so subsequent logins skip this path.
async function maybeMigrateLocalProfile(username: string): Promise<void> {
  if (typeof window === "undefined") return;
  const key = LEGACY_KEY_PREFIX + username.toLowerCase();
  const raw = localStorage.getItem(key);
  if (!raw) return;
  let local: Profile;
  try {
    local = JSON.parse(raw) as Profile;
  } catch {
    return;
  }

  // Fetch current cloud profile. If it has any meaningful content
  // (caught Pokemon or stats > 0), don't overwrite.
  const current = await loadCurrentProfile();
  if (current && (current.caught.length > 0 || current.stats.totalAnswered > 0)) {
    localStorage.removeItem(key);
    return;
  }
  // Strip the legacy `pin` field — server uses bcrypt hash, not raw pin.
  const safe: Profile = { ...local, pin: "", username };
  await saveProfile(safe);
  localStorage.removeItem(key);
}

export const newProfile = newProfileObj;
