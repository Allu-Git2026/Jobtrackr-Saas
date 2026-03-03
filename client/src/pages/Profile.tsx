import { useEffect, useState } from "react";
import { api } from "../api";

type Me = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function Profile() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setMe(res.data))
      .catch((e) => setError(e?.response?.data?.message || "Failed to load profile"));
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!me) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "48px auto" }}>
      <h2>My Profile</h2>

      <div style={{ border: "1px solid #333", borderRadius: 10, padding: 16 }}>
        <p><b>Name:</b> {me.name}</p>
        <p><b>Email:</b> {me.email}</p>
        <p><b>User ID:</b> {me.id}</p>
        <p><b>Joined:</b> {new Date(me.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}