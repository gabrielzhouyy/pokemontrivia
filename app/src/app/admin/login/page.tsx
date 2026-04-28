"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  adminPasswordExists,
  isAdminAuthenticated,
  setAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "first-run" | "login">("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (await isAdminAuthenticated()) {
        router.replace("/admin");
        return;
      }
      setMode((await adminPasswordExists()) ? "login" : "first-run");
    })();
  }, [router]);

  async function handleFirstRun(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords don't match");
    setBusy(true);
    try {
      await setAdminPassword(password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set password");
      setBusy(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const ok = await verifyAdminPassword(password);
    if (ok) {
      router.replace("/admin");
    } else {
      setError("Wrong password");
      setPassword("");
      setBusy(false);
    }
  }

  if (mode === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-gray-900 mb-3"
        >
          ← Back to player sign in
        </Link>
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🧓</div>
          <h1 className="text-2xl font-extrabold">Professor Oak</h1>
          <p className="text-sm text-gray-600 mt-1">
            {mode === "first-run" ? "Set up admin password" : "Admin sign in"}
          </p>
        </div>

        {mode === "first-run" ? (
          <form onSubmit={handleFirstRun}>
            <label className="block text-sm font-bold mb-1">Choose a password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full text-lg p-3 border-2 border-gray-300 rounded-2xl focus:border-red-400 outline-none mb-3"
              placeholder="••••••••"
            />
            <label className="block text-sm font-bold mb-1">Confirm</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full text-lg p-3 border-2 border-gray-300 rounded-2xl focus:border-red-400 outline-none mb-3"
              placeholder="••••••••"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-2xl active:scale-95 transition"
            >
              {busy ? "Setting up…" : "Create admin"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <label className="block text-sm font-bold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full text-lg p-3 border-2 border-gray-300 rounded-2xl focus:border-red-400 outline-none mb-3"
              placeholder="••••••••"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-2xl active:scale-95 transition"
            >
              {busy ? "Checking…" : "Sign in"}
            </button>
          </form>
        )}

        {error && <p className="text-red-500 text-center mt-3 font-bold">{error}</p>}
      </div>
    </main>
  );
}
