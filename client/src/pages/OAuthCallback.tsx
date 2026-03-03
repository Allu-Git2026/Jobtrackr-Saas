import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      nav("/applications", { replace: true });
    } else {
      nav("/login?oauth=fail", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Logging you in...
    </div>
  );
}