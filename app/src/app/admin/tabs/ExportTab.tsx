"use client";
import { exportAdhocAll, SEEDED_AGES } from "@/lib/adhoc";
import { getAdminSubjectsOverride } from "@/lib/subjects";
import { listAllProfiles } from "@/lib/storage";

function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportTab() {
  const subjects = getAdminSubjectsOverride();
  const adhoc = exportAdhocAll();
  const profiles = listAllProfiles();

  return (
    <div>
      <h2 className="text-xl font-extrabold mb-3">Export</h2>
      <p className="text-sm text-gray-600 mb-4">
        Download admin overrides as JSON files. Commit them into the repo to make changes
        permanent across rebuilds.
      </p>

      <div className="space-y-3">
        <div className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="font-bold">subjects.json</div>
            <div className="text-xs text-gray-500">
              {subjects ? `${subjects.subjects.length} subjects` : "(no override — using bundled)"}
            </div>
          </div>
          <button
            onClick={() => subjects && downloadJson("subjects.json", subjects)}
            disabled={!subjects}
            className="bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:text-gray-400 px-4 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
          >
            Download
          </button>
        </div>

        {SEEDED_AGES.flatMap((age) =>
          [1, 2, 3, 4].map((tier) => {
            const bank = adhoc[`age-${age}`]?.[String(tier)] ?? [];
            return (
              <div
                key={`${age}-${tier}`}
                className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className="font-bold">age-{age}/ad-hoc/tier-{tier}.json</div>
                  <div className="text-xs text-gray-500">
                    {bank.length} question{bank.length === 1 ? "" : "s"}
                  </div>
                </div>
                <button
                  onClick={() =>
                    downloadJson(`age-${age}-adhoc-tier-${tier}.json`, bank)
                  }
                  disabled={bank.length === 0}
                  className="bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:text-gray-400 px-4 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
                >
                  Download
                </button>
              </div>
            );
          }),
        )}

        <div className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="font-bold">All profiles</div>
            <div className="text-xs text-gray-500">{profiles.length} profile(s) on this device</div>
          </div>
          <button
            onClick={() => downloadJson("profiles.json", profiles)}
            disabled={profiles.length === 0}
            className="bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:text-gray-400 px-4 py-2 rounded-2xl text-sm font-bold active:scale-95 transition"
          >
            Download
          </button>
        </div>
      </div>

      <h3 className="font-extrabold mt-6 mb-2">How to make these permanent</h3>
      <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
        <li>Download <code>subjects.json</code> → replace <code>app/data/subjects.json</code> in the repo.</li>
        <li>Download an ad-hoc bank → replace <code>app/data/questions/age-N/ad-hoc/tier-T.json</code> with the same name.</li>
        <li>Commit and push. Once the kid pulls/refreshes, the bundled JSON kicks in everywhere.</li>
      </ol>
    </div>
  );
}
