"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { endAdminSession, isAdminAuthenticated, resetAdmin } from "@/lib/admin";
import UsersTab from "./tabs/UsersTab";
import SubjectsTab from "./tabs/SubjectsTab";
import AdhocTab from "./tabs/AdhocTab";
import ExportTab from "./tabs/ExportTab";

type Tab = "users" | "subjects" | "adhoc" | "export";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "users", label: "Users", emoji: "👥" },
  { id: "subjects", label: "Subjects", emoji: "📚" },
  { id: "adhoc", label: "General questions", emoji: "✏️" },
  { id: "export", label: "Export", emoji: "📦" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!(await isAdminAuthenticated())) {
        router.replace("/admin/login");
        return;
      }
      setReady(true);
    })();
  }, [router]);

  if (!ready) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold">🧓 Professor Oak</h1>
          <p className="text-sm text-gray-600">Admin dashboard</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (
                confirm(
                  "Reset admin? This clears your password AND all admin overrides (subjects, general questions). Player profiles are kept.",
                )
              ) {
                (async () => {
                  await resetAdmin();
                  router.replace("/admin/login");
                })();
              }
            }}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
          >
            Reset admin
          </button>
          <button
            onClick={() => {
              (async () => {
                await endAdminSession();
                router.replace("/admin/login");
              })();
            }}
            className="bg-red-200 hover:bg-red-300 px-3 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-2xl font-bold transition active:scale-95 ${
              tab === t.id
                ? "bg-red-500 text-white"
                : "bg-white hover:bg-yellow-100 border border-gray-200"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </nav>

      <section className="bg-white rounded-2xl shadow p-4 sm:p-6">
        {tab === "users" && <UsersTab />}
        {tab === "subjects" && <SubjectsTab />}
        {tab === "adhoc" && <AdhocTab />}
        {tab === "export" && <ExportTab />}
      </section>
    </main>
  );
}
