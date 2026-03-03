import { useState } from "react";
import { api } from "../api";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("123456");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const googleLogin = () => {
    window.location.href = "http://localhost:5001/api/auth/google";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      if (mode === "register") {
        const res = await api.post("/auth/register", {
          name: name.trim(),
          email: email.trim(),
          password,
        });

        localStorage.setItem("token", res.data.token);
        window.location.href = "/applications";
        return;
      }

      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", res.data.token);
      window.location.href = "/applications";
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl">
        <div className="text-3xl font-semibold tracking-tight text-white">
          <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
            JobTrackr
          </span>
        </div>
        <div className="mt-1 text-sm text-white/60">
          {mode === "login" ? "Login to continue" : "Create your account"}
        </div>

        <div className="mt-5 flex gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
          <button
            className={`flex-1 rounded-2xl px-3 py-2 text-xs font-semibold ${
              mode === "login" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
            }`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`flex-1 rounded-2xl px-3 py-2 text-xs font-semibold ${
              mode === "register" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
            }`}
            onClick={() => setMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <button
          onClick={googleLogin}
          type="button"
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
        >
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <div className="text-xs text-white/40">or</div>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}