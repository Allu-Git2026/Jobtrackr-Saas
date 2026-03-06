import { useState } from "react";
import { api } from "../api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Google login
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  // Email login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      window.location.href = "/applications";
    } catch (err: any) {
      alert(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        <h1 className="text-3xl font-bold mb-6 text-center">JobTrackr</h1>

        <button
          onClick={handleGoogleLogin}
          className="w-full mb-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition"
        >
          Continue with Google
        </button>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded-lg bg-black border border-white/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded-lg bg-black border border-white/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
