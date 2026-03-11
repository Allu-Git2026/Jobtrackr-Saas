import { useEffect } from "react";

export default function OAuthSuccess() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/applications";
      return;
    }

    window.location.href = "/login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      Logging you in...
    </div>
  );
}
