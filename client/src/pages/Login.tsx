import { useState } from "react";
import { api } from "../api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      if (mode === "register") {
        const res = await api.post("/auth/register", {
          name,
          email,
          password,
        });

        localStorage.setItem("token", res.data.token);
        window.location.href = "/#/applications";
        return;
      }

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      window.location.href = "/#/applications";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h1 className="text-3xl font-bold text-center mb-2">JobTrackr</h1>
        <p className="text-center text-white/60 mb-6">
          AI-powered job application tracker
        </p>

        <div className="flex rounded-xl border border-white/10 p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
              mode === "login"
                ? "bg-white text-black"
                : "text-white hover:bg-white/10"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
              mode === "register"
                ? "bg-white text-black"
                : "text-white hover:bg-white/10"
            }`}
          >
            Register
          </button>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full mb-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition"
        >
          Continue with Google
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Name"
              className="p-3 rounded-lg bg-black border border-white/20 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded-lg bg-black border border-white/20 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded-lg bg-black border border-white/20 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}