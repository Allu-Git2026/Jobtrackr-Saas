// client/src/pages/Applications.tsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import MatchModal from "../components/MatchModal";
import Navbar from "../components/Navbar";

type Application = {
  id: string;
  company: string;
  roleTitle: string;
  status: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
  priority: "Low" | "Medium" | "High";
  jobUrl?: string | null;
  location?: string | null;
  notes?: string | null;
  followUpAt?: string | null;
  createdAt: string;

  // AI fields
  resumeText?: string | null;
  jobDescriptionText?: string | null;
  aiMatchScore?: number | null;
  aiMatchSummary?: string | null;
  aiMissingKeywords?: string | null;
  aiStrengths?: string | null;
  aiGaps?: string | null;
  aiLastMatchedAt?: string | null;
};

const columns = ["Saved", "Applied", "Interview", "Offer", "Rejected"] as const;
type ColStatus = (typeof columns)[number];

type ViewMode = "kanban" | "table" | "both";

/**
 * Role title suggestions (industry-ready).
 * You can still type a custom value too.
 */
const ROLE_TITLES: string[] = [
  "Software Engineer",
  "Software Developer",
  "Frontend Developer",
  "Front-End Developer",
  "UI Developer",
  "UI Engineer",
  "Web Developer",
  "React Developer",
  "React.js Developer",
  "Next.js Developer",
  "Angular Developer",
  "Vue.js Developer",
  "Full Stack Developer",
  "Full-Stack Developer",
  "Backend Developer",
  "Back-End Developer",
  "Node.js Developer",
  "Express.js Developer",
  "Java Developer",
  "Spring Boot Developer",
  "Python Developer",
  "Django Developer",
  "Ruby on Rails Developer",
  ".NET Developer",
  "C# Developer",
  "C++ Developer",
  "Mobile Developer",
  "Android Developer",
  "iOS Developer",
  "React Native Developer",
  "Flutter Developer",
  "DevOps Engineer",
  "Cloud Engineer",
  "AWS Engineer",
  "Azure Engineer",
  "GCP Engineer",
  "SRE (Site Reliability Engineer)",
  "QA Engineer",
  "Test Automation Engineer",
  "SDET",
  "Data Engineer",
  "Data Analyst",
  "Business Analyst",
  "Machine Learning Engineer",
  "AI Engineer",
  "GenAI Engineer",
  "Security Engineer",
  "Cybersecurity Engineer",
  "Platform Engineer",
  "Systems Engineer",
  "Solutions Engineer",
  "Technical Lead",
  "Team Lead",
  "Engineering Manager",
];

function formatFollowUp(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function isFollowUpDueSoon(iso?: string | null) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;

  // "months also is fine" -> show due badge for anything within next 30 days
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return t <= now + thirtyDays;
}

function PriorityPill({ p }: { p: Application["priority"] }) {
  const cls =
    p === "High"
      ? "bg-rose-500/15 text-rose-200 border-rose-500/30"
      : p === "Medium"
        ? "bg-indigo-500/15 text-indigo-200 border-indigo-500/30"
        : "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}
    >
      {p}
    </span>
  );
}

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([]);

  // create form fields
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [status, setStatus] = useState<ColStatus>("Saved");
  const [priority, setPriority] = useState<Application["priority"]>("Medium");
  const [jobUrl, setJobUrl] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // filters
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | ColStatus>("All");
  const [filterPriority, setFilterPriority] = useState<
    "All" | "Low" | "Medium" | "High"
  >("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "company">(
    "newest",
  );

  // view mode toggle
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  // AI Match modal state
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchApp, setMatchApp] = useState<Application | null>(null);
  const [matchResult, setMatchResult] = useState<any>(null);

  const load = async () => {
    const res = await api.get("/applications");
    setApps(res.data);
  };

  useEffect(() => {
    load().catch((e) =>
      setError(e?.response?.data?.message || "Failed to load"),
    );
  }, []);

  const stats = useMemo(() => {
    return {
      total: apps.length,
      applied: apps.filter((a) => a.status === "Applied").length,
      interview: apps.filter((a) => a.status === "Interview").length,
      offer: apps.filter((a) => a.status === "Offer").length,
      rejected: apps.filter((a) => a.status === "Rejected").length,
    };
  }, [apps]);

  const visibleApps = useMemo(() => {
    return apps
      .filter((a) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          a.company.toLowerCase().includes(q) ||
          a.roleTitle.toLowerCase().includes(q) ||
          (a.location || "").toLowerCase().includes(q);

        const matchesStatus =
          filterStatus === "All" || a.status === filterStatus;
        const matchesPriority =
          filterPriority === "All" || a.priority === filterPriority;

        return matchesQuery && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === "company") return a.company.localeCompare(b.company);
        if (sortBy === "oldest")
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [apps, query, filterStatus, filterPriority, sortBy]);

  const groupedByStatus = useMemo(() => {
    const map: Record<ColStatus, Application[]> = {
      Saved: [],
      Applied: [],
      Interview: [],
      Offer: [],
      Rejected: [],
    };
    for (const a of visibleApps) map[a.status].push(a);
    return map;
  }, [visibleApps]);

  const canAdd =
    company.trim().length > 0 && roleTitle.trim().length > 0 && !saving;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!company.trim() || !roleTitle.trim()) {
      setError("Company and Role Title are required");
      return;
    }

    try {
      setSaving(true);
      const followUpISO = followUpAt
        ? new Date(followUpAt).toISOString()
        : null;

      await api.post("/applications", {
        company: company.trim(),
        roleTitle: roleTitle.trim(),
        status,
        priority,
        jobUrl: jobUrl.trim() ? jobUrl.trim() : null,
        location: location.trim() ? location.trim() : null,
        notes: notes.trim() ? notes.trim() : null,
        followUpAt: followUpISO,
      });

      setCompany("");
      setRoleTitle("");
      setStatus("Saved");
      setPriority("Medium");
      setJobUrl("");
      setLocation("");
      setNotes("");
      setFollowUpAt("");

      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setError("");
    try {
      await api.delete(`/applications/${id}`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to delete");
    }
  };

  const updateStatus = async (id: string, newStatus: ColStatus) => {
    setError("");
    try {
      await api.put(`/applications/${id}`, { status: newStatus });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update status");
    }
  };

  // ✅ AI Match handlers
  const openMatch = (app: Application) => {
    (window as any).__MATCH_APP_ID = app.id; // used by upload endpoint if you kept it
    setMatchApp(app);
    setMatchResult(null);
    setMatchOpen(true);
  };

  const saveMatch = async (payload: {
    jobDescriptionText: string;
    resumeText: string;
  }) => {
    if (!matchApp) return;
    setMatchLoading(true);
    setError("");
    try {
      const res = await api.post(`/applications/${matchApp.id}/match`, payload);
      // server returns { message, application, ai } in our earlier setup
      setMatchResult(res.data.ai);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to generate AI match");
    } finally {
      setMatchLoading(false);
    }
  };

  const showKanban = viewMode === "kanban" || viewMode === "both";
  const showTable = viewMode === "table" || viewMode === "both";

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6">
          <div className="text-4xl font-semibold tracking-tight text-white">
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              JobTrackr
            </span>
          </div>
          <div className="mt-1 text-sm text-white/60">
            AI-powered job application tracker.
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xl font-semibold text-white">Applications</div>

            {/* ✅ View Toggle */}
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
              {[
                ["kanban", "Kanban"],
                ["table", "Table"],
                ["both", "Both"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewMode(key as ViewMode)}
                  className={`rounded-2xl px-3 py-2 text-xs font-semibold ${
                    viewMode === key
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* CREATE FORM */}
          <form
            onSubmit={create}
            className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
              <input
                className="md:col-span-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />

              {/* ✅ Role Title dropdown suggestions (datalist) */}
              <div className="md:col-span-2">
                <input
                  list="roleTitleOptions"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                  placeholder="Role Title"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                />
                <datalist id="roleTitleOptions">
                  {ROLE_TITLES.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ColStatus)}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              >
                {columns.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <input
                className="md:col-span-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                placeholder="Job URL (optional)"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
              <input
                className="md:col-span-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <textarea
                className="md:col-span-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />

              <input
                type="datetime-local"
                value={followUpAt}
                onChange={(e) => setFollowUpAt(e.target.value)}
                className="md:col-span-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              />

              <button
                type="submit"
                disabled={!canAdd}
                className="md:col-span-6 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </form>

          {/* STATS */}
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              ["Total", stats.total],
              ["Applied", stats.applied],
              ["Interview", stats.interview],
              ["Offer", stats.offer],
              ["Rejected", stats.rejected],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-3xl border border-white/10 bg-black/20 p-4 shadow-sm"
              >
                <div className="text-xs text-white/60">{label}</div>
                <div className="mt-1 text-3xl font-semibold text-white">
                  {value}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {/* FILTERS */}
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-3xl border border-white/10 bg-black/20 p-3">
            <input
              className="min-w-[220px] flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none"
            >
              <option value="All">All Status</option>
              {columns.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none"
            >
              <option value="All">All Priority</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="company">Sort: Company</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilterStatus("All");
                setFilterPriority("All");
                setSortBy("newest");
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              Reset
            </button>
          </div>

          {/* ✅ KANBAN VIEW */}
          {showKanban && (
            <div className="mt-6">
              <div className="mb-3 text-sm font-semibold text-white/80">
                Kanban View
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                {columns.map((col) => (
                  <div
                    key={col}
                    className="rounded-3xl border border-white/10 bg-black/20 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">
                        {col}
                      </div>
                      <div className="rounded-full bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/70">
                        {groupedByStatus[col].length}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {groupedByStatus[col].length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/50">
                          No items.
                        </div>
                      ) : (
                        groupedByStatus[col].map((a) => (
                          <div
                            key={a.id}
                            className="rounded-2xl border border-white/10 bg-black/30 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-sm font-semibold text-white">
                                  {a.company}
                                </div>
                                <div className="text-xs text-white/60">
                                  {a.roleTitle}
                                </div>
                                {a.location ? (
                                  <div className="mt-1 text-[11px] text-white/45">
                                    {a.location}
                                  </div>
                                ) : null}
                              </div>
                              <PriorityPill p={a.priority} />
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <select
                                value={a.status}
                                onChange={(e) =>
                                  updateStatus(a.id, e.target.value as ColStatus)
                                }
                                className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] text-white outline-none"
                              >
                                {columns.map((c) => (
                                  <option key={c}>{c}</option>
                                ))}
                              </select>

                              <button
                                onClick={() => openMatch(a)}
                                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white hover:bg-white/10"
                              >
                                Resume Match
                              </button>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-[11px] text-white/60">
                                Follow-up:{" "}
                                <span className="text-white/80">
                                  {formatFollowUp(a.followUpAt)}
                                </span>
                              </div>
                              {isFollowUpDueSoon(a.followUpAt) && (
                                <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-[11px] font-semibold text-indigo-200">
                                  Due Soon
                                </span>
                              )}
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-[11px] text-white/60">
                                AI:{" "}
                                {typeof a.aiMatchScore === "number" ? (
                                  <span className="font-semibold text-indigo-200">
                                    {a.aiMatchScore}/100
                                  </span>
                                ) : (
                                  <span className="text-white/45">
                                    Not generated
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => remove(a.id)}
                                className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2 text-[11px] font-semibold text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ TABLE VIEW */}
          {showTable && (
            <div className="mt-8">
              <div className="mb-3 text-sm font-semibold text-white/80">
                Table View
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-white/[0.04] text-white/70">
                      <tr>
                        <th className="px-4 py-3">Company</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Follow-up</th>
                        <th className="px-4 py-3">AI Match</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {visibleApps.length === 0 ? (
                        <tr>
                          <td
                            className="px-4 py-10 text-center text-white/50"
                            colSpan={7}
                          >
                            No applications yet.
                          </td>
                        </tr>
                      ) : (
                        visibleApps.map((a) => (
                          <tr
                            key={a.id}
                            className="text-white/90 hover:bg-white/[0.03]"
                          >
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white">
                                {a.company}
                              </div>
                              {a.location ? (
                                <div className="text-xs text-white/50">
                                  {a.location}
                                </div>
                              ) : null}
                            </td>

                            <td className="px-4 py-3">{a.roleTitle}</td>

                            <td className="px-4 py-3">
                              <select
                                value={a.status}
                                onChange={(e) =>
                                  updateStatus(a.id, e.target.value as ColStatus)
                                }
                                className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none"
                              >
                                {columns.map((c) => (
                                  <option key={c}>{c}</option>
                                ))}
                              </select>
                            </td>

                            <td className="px-4 py-3">{a.priority}</td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-white/80">
                                  {formatFollowUp(a.followUpAt)}
                                </span>
                                {isFollowUpDueSoon(a.followUpAt) && (
                                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-200">
                                    Due Soon
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              {typeof a.aiMatchScore === "number" ? (
                                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-200">
                                  {a.aiMatchScore}/100
                                </span>
                              ) : (
                                <span className="text-xs text-white/50">
                                  Not generated
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openMatch(a)}
                                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                                >
                                  Resume Match
                                </button>

                                <button
                                  onClick={() => remove(a.id)}
                                  className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2 text-xs font-semibold text-white"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ AI Match Modal (fixed props) */}
        <MatchModal
          open={matchOpen}
          onClose={() => setMatchOpen(false)}
          title={
            matchApp ? `${matchApp.company} — ${matchApp.roleTitle}` : "Resume Match"
          }
          initialJD={matchApp?.jobDescriptionText || ""}
          initialResume={matchApp?.resumeText || ""}
          onSave={saveMatch}
          loading={matchLoading}
          result={matchResult}
        />
      </div>
    </>
  );
}