"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadCurrentProfile } from "@/lib/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const p = await loadCurrentProfile();
      if (!p) router.replace("/login");
      else if (!p.starterId) router.replace("/starter");
      else router.replace("/pokedex");
    })();
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-2xl font-bold">Loading…</div>
    </div>
  );
}
