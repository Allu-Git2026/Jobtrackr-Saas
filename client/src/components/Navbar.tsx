import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api";

type Me = {
  id: string;
  email: string;
  name?: string | null;
};

const FOLLOWUP_COUNT_DAYS = 30; // ✅ change to 90 if you want 3 months count

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [me, setMe] = useState<Me | null>(null);
  const [followUpCount, setFollowUpCount] = useState<number>(0);

  const isOnFollowUps = useMemo(
    () => location.pathname.startsWith("/followups"),
    [location.pathname],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await api.get("/auth/me");
        setMe(meRes.data);

        const appsRes = await api.get("/applications");
        const now = Date.now();
        const windowMs = FOLLOWUP_COUNT_DAYS * 24 * 60 * 60 * 1000;

        const upcoming = (appsRes.data || []).filter((a: any) => {
          if (!a.followUpAt) return false;
          const t = new Date(a.followUpAt).getTime();
          if (Number.isNaN(t)) return false;
          return t >= now && t <= now + windowMs;
        });

        setFollowUpCount(upcoming.length);
      } catch {
        setMe(null);
        setFollowUpCount(0);
      }
    };

    load();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div
          className="cursor-pointer select-none text-lg font-semibold text-white"
          onClick={() => navigate("/applications")}
          title="Go to Home"
        >
          JobTrackr
        </div>

        <div className="flex items-center gap-3">
          {me ? (
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80 md:flex">
              <span className="font-semibold text-white">{me.name || "User"}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/70">{me.email}</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => navigate("/followups")}
            className={`relative rounded-2xl border px-4 py-2 text-sm font-semibold hover:bg-white/10 ${
              isOnFollowUps
                ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-200"
                : "border-white/10 bg-white/5 text-white/85"
            }`}
            title={`FollowUps (next ${FOLLOWUP_COUNT_DAYS} days)`}
          >
            FollowUps
            {followUpCount > 0 && (
              <span className="ml-2 rounded-full bg-indigo-500/25 px-2 py-0.5 text-[11px] font-bold text-indigo-200">
                {followUpCount}
              </span>
            )}
          </button>

          <button
            onClick={logout}
            className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}