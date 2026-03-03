import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

export default function Layout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <Outlet />
    </div>
  );
}
