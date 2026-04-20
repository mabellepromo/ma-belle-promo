import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import FooterSection from "./FooterSection";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Logo tampon fixe en filigrane sur toutes les pages */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
        <img
          src="/Logo Redesign1.png"
          alt=""
          aria-hidden="true"
          className="w-[900px] h-[900px] object-contain select-none"
          style={{ opacity: 0.035, filter: "grayscale(100%) contrast(1.8)" }}
        />
      </div>
      <Navbar />
      <main className="relative z-10 flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
      <FooterSection />
    </div>
  );
}