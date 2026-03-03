import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErr("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", { name: name.trim(), email: email.trim(), password });

      // after register, go to login
      nav("/login");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl text-white"
      >
        <div className="text-2xl font-semibold">Register</div>
        <div className="mt-1 text-sm text-white/60">Create your JobTrackr account</div>

        {err ? (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {err}
          </div>
        ) : null}

        <input
          className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-indigo-500/90 px-4 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50"
          type="submit"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => nav("/login")}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
}