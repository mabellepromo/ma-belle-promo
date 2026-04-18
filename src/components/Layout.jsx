import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import FooterSection from "./FooterSection";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
      <FooterSection />
    </div>
  );
}