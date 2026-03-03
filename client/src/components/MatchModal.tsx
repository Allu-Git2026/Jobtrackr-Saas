import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  initialJD: string;
  initialResume: string;

  // Text-only mode fallback (still supported)
  onSave: (payload: {
    jobDescriptionText: string;
    resumeText: string;
  }) => Promise<void>;

  loading: boolean;

  // Parent result (optional). We'll also support local result here.
  result: any;
};

function safeJson(value: any) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [String(value)];
    } catch {
      return [String(value)];
    }
  }
  return [String(value)];
}

export default function MatchModal(props: Props) {
  const { open, onClose, title, initialJD, initialResume, loading, result } =
    props;

  const [jdText, setJdText] = useState(initialJD || "");
  const [resumeText, setResumeText] = useState(initialResume || "");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);

  const [localError, setLocalError] = useState<string>("");
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localResult, setLocalResult] = useState<any>(null);

  useEffect(() => {
    setJdText(initialJD || "");
    setResumeText(initialResume || "");
    setResumeFile(null);
    setJdFile(null);
    setLocalError("");
    setLocalResult(null);
    setLocalLoading(false);
  }, [open, initialJD, initialResume]);

  const shownResult = result || localResult;

  const clearResumeFile = () => setResumeFile(null);
  const clearJdFile = () => setJdFile(null);
  const clearResumeText = () => setResumeText("");
  const clearJdText = () => setJdText("");

  const canGenerate = useMemo(() => {
    return (
      (!!resumeFile || resumeText.trim().length > 0) &&
      (!!jdFile || jdText.trim().length > 0)
    );
  }, [resumeFile, resumeText, jdFile, jdText]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-black/70 p-6 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-xs text-white/60">
              Provide Resume + JD using any combination of file/text.
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            type="button"
          >
            Close
          </button>
        </div>

        {/* Upload row */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm font-semibold">Resume file (optional)</div>
            <div className="mt-2 text-xs text-white/60">PDF / DOCX / TXT</div>

            <input
              className="mt-3 w-full text-sm"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />

            {resumeFile ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="truncate text-xs text-white/70">
                  {resumeFile.name}
                </div>
                <button
                  onClick={clearResumeFile}
                  className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] hover:bg-white/10"
                  type="button"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="mt-2 text-xs text-white/40">No file selected</div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm font-semibold">
              Job description file (optional)
            </div>
            <div className="mt-2 text-xs text-white/60">PDF / DOCX / TXT</div>

            <input
              className="mt-3 w-full text-sm"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setJdFile(e.target.files?.[0] || null)}
            />

            {jdFile ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="truncate text-xs text-white/70">
                  {jdFile.name}
                </div>
                <button
                  onClick={clearJdFile}
                  className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] hover:bg-white/10"
                  type="button"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="mt-2 text-xs text-white/40">No file selected</div>
            )}
          </div>
        </div>

        {/* Paste text */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Resume text (optional)</div>
              <button
                type="button"
                onClick={clearResumeText}
                className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] hover:bg-white/10"
              >
                Clear
              </button>
            </div>

            <textarea
              className="mt-3 h-40 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-white outline-none placeholder:text-white/30"
              placeholder="Paste resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">JD text (optional)</div>
              <button
                type="button"
                onClick={clearJdText}
                className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] hover:bg-white/10"
              >
                Clear
              </button>
            </div>

            <textarea
              className="mt-3 h-40 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-white outline-none placeholder:text-white/30"
              placeholder="Paste job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 text-xs text-white/70">
          ✅ Need: Resume (file OR text) + JD (file OR text)
        </div>

        {localError ? (
          <div className="mt-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {localError}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            disabled={loading || localLoading || !canGenerate}
            onClick={async () => {
              try {
                setLocalError("");
                setLocalResult(null);
                setLocalLoading(true);

                const appId = (window as any).__MATCH_APP_ID;
                if (!appId) {
                  setLocalError(
                    "Missing application id. Close the modal and open again."
                  );
                  return;
                }

                // ✅ Build multipart form (supports file/text combos)
                const form = new FormData();

                // These MUST match multer fields in backend:
                // upload.fields([{ name: "resume" }, { name: "jd" }])
                if (resumeFile) form.append("resume", resumeFile);
                if (jdFile) form.append("jd", jdFile);

                // Always include text fields; backend can fallback to these
                form.append("resumeText", resumeText || "");
                form.append("jobDescriptionText", jdText || "");

                // ✅ Correct endpoint based on your server.ts mounting:
                // app.use("/api/applications", matchRoutes)
                const res = await api.post(
                  `/applications/${appId}/match-file`,
                  form,
                  {
                    headers: { "Content-Type": "multipart/form-data" },
                  }
                );

                // Backend returns { ai: ... }
                setLocalResult(res.data?.ai || null);
              } catch (e: any) {
                setLocalError(
                  e?.response?.data?.message || "Failed to generate match"
                );
              } finally {
                setLocalLoading(false);
              }
            }}
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            type="button"
          >
            {loading || localLoading ? "Generating..." : "Generate Match"}
          </button>

          <div className="text-xs text-white/60">
            Any combo works: file+file, file+text, text+file, text+text.
          </div>
        </div>

        {/* RESULT */}
        {shownResult ? (
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-200">
                Score: {shownResult.score ?? shownResult.aiMatchScore ?? "-"}
                /100
              </span>
              <span className="text-xs text-white/70">
                {shownResult.summary ??
                  shownResult.aiMatchSummary ??
                  "Match generated."}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs font-semibold text-white">
                  Strengths
                </div>
                <ul className="mt-2 space-y-1 text-xs text-white/70">
                  {safeJson(shownResult.strengths ?? shownResult.aiStrengths).map(
                    (x: string, idx: number) => (
                      <li key={idx}>• {x}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs font-semibold text-white">Gaps</div>
                <ul className="mt-2 space-y-1 text-xs text-white/70">
                  {safeJson(shownResult.gaps ?? shownResult.aiGaps).map(
                    (x: string, idx: number) => (
                      <li key={idx}>• {x}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs font-semibold text-white">
                  Missing Keywords
                </div>
                <ul className="mt-2 space-y-1 text-xs text-white/70">
                  {safeJson(
                    shownResult.missing_keywords ??
                      shownResult.missingKeywords ??
                      shownResult.aiMissingKeywords
                  ).map((x: string, idx: number) => (
                    <li key={idx}>• {x}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setLocalResult(null);
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                type="button"
              >
                Clear Result
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}