import { useEffect } from "react";

export default function OAuthSuccess() {
  useEffect(() => {
    const hash = window.location.hash;
    const queryString = hash.includes("?") ? hash.split("?")[1] : "";
    const params = new URLSearchParams(queryString);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/#/applications";
      return;
    }

    window.location.href = "/#/login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      Logging you in...
    </div>
  );
}
