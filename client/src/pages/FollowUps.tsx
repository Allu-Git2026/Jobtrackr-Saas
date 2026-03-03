import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../api";

type Application = {
  id: string;
  company: string;
  roleTitle: string;
  status: string;
  priority: string;
  followUpAt?: string | null;
  jobUrl?: string | null;
  location?: string | null;
};

function fmt(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

const RANGE_OPTIONS = [
  { label: "Next 7 days", days: 7 },
  { label: "Next 30 days", days: 30 },
  { label: "Next 3 months (90 days)", days: 90 },
  { label: "Next 6 months (180 days)", days: 180 },
  { label: "Next 12 months (365 days)", days: 365 },
] as const;

export default function FollowUps() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [error, setError] = useState("");

  const [rangeDays, setRangeDays] = useState<number>(90); // ✅ default = 3 months

  const load = async () => {
    const res = await api.get("/applications");
    setApps(res.data || []);
  };

  useEffect(() => {
    load().catch((e) =>
      setError(e?.response?.data?.message || "Failed to load followups"),
    );
  }, []);

  const upcoming = useMemo(() => {
    const now = Date.now();
    const windowMs = rangeDays * 24 * 60 * 60 * 1000;

    return apps
      .filter((a) => a.followUpAt)
      .map((a) => ({ ...a, t: new Date(a.followUpAt as string).getTime() }))
      .filter((a) => !Number.isNaN(a.t))
      .filter((a) => a.t >= now && a.t <= now + windowMs)
      .sort((a, b) => a.t - b.t);
  }, [apps, rangeDays]);

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-3xl font-semibold text-white">FollowUps</div>
            <div className="mt-1 text-sm text-white/60">
              Upcoming follow-ups for your selected window.
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Range selector */}
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value))}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none"
              title="FollowUps range"
            >
              {RANGE_OPTIONS.map((o) => (
                <option key={o.days} value={o.days}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* Back button */}
            <button
              onClick={() => navigate("/applications")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              ← Back
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl">
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
              No follow-ups due in this window.
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a: any) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {a.company}
                      </div>
                      <div className="text-sm text-white/60">{a.roleTitle}</div>
                      {a.location ? (
                        <div className="mt-1 text-xs text-white/45">
                          {a.location}
                        </div>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-white/60">Follow-up</div>
                      <div className="text-sm font-semibold text-indigo-200">
                        {fmt(a.followUpAt)}
                      </div>
                    </div>
                  </div>

                  {a.jobUrl ? (
                    <div className="mt-3">
                      <a
                        href={a.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        Open Job Link
                      </a>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}