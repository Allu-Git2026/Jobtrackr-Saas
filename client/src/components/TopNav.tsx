import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../api";

type Me = { id: string; name: string; email: string };

export default function TopNav() {
  const [me, setMe] = useState<Me | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setMe(res.data))
      .catch(() => setMe(null));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkBase =
    "px-4 py-2 rounded-full text-sm font-semibold transition border border-white/10";
  const linkActive = "bg-white/10 text-white";
  const linkInactive = "bg-white/5 text-white/70 hover:bg-white/10";

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold text-white">
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              JobTrackr
            </span>
          </div>
          <div className="hidden text-xs text-white/50 md:block">
            Track applications, follow-ups, AI resume match
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/applications"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Applications
          </NavLink>
          <NavLink
            to="/followups"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Follow-ups
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Profile
          </NavLink>
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 md:block">
            {me ? (
              <div className="leading-tight">
                <div className="font-semibold text-white">{me.name}</div>
                <div className="text-white/60">{me.email}</div>
              </div>
            ) : (
              <div className="text-white/60">Not signed in</div>
            )}
          </div>

          <button
            onClick={logout}
            className="rounded-2xl bg-indigo-600/90 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
