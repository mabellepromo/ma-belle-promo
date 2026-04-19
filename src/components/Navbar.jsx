import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, Home, User, LayoutDashboard } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalAuth } from "@/lib/LocalAuth";

const navItems = [
  {
    label: "L'Association",
    children: [
      { label: "Notre Credo", href: "/association/credo" },
      { label: "Notre Ambition", href: "/association/ambition" },
      { label: "Notre Équipe", href: "/association/equipe" },
      { label: "Nos Sponsors", href: "/association/sponsors" },
    ],
  },
  {
    label: "Activités",
    children: [
      { label: "Événements", href: "/activites/evenements" },
      { label: "Projets", href: "/activites/projets" },
      { label: "Programmes", href: "/activites/programmes" },
    ],
  },
  {
    label: "Implications",
    children: [
      { label: "Adhérents", href: "/annuaire" },
      { label: "Adhésion", href: "/implications/adhesion" },
      { label: "Cotisation", href: "/implications/cotisation" },
      { label: "Nous Soutenir", href: "/implications/soutenir" },
    ],
  },
  {
    label: "Informations",
    children: [
      { label: "Actualités", href: "/informations/actualites" },
      { label: "Blog & Ressources", href: "/blog" },
      { label: "Galeries membres", href: "/galeries", membersOnly: true },
      { label: "Médiathèque", href: "/informations/mediatheque" },
      { label: "Documents", href: "/informations/documents" },
      { label: "Contacts", href: "/informations/contacts" },
      { label: "Communiqués", href: "/informations/communiques" },
    ],
  },
];

function DesktopDropdown({ item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const closeTimer = useRef(-1);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  // Clean up timer on unmount
  useEffect(() => () => cancelClose(), []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium transition-colors duration-150"
        style={{ color: open ? "#ffffff" : "rgba(255,255,255,0.70)" }}
      >
        {item.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="absolute top-full left-0 mt-1 w-52 rounded-lg shadow-xl py-1 z-50 border"
            style={{ background: "hsl(150,30%,8%)", borderColor: "rgba(255,255,255,0.10)" }}
          >
            {item.children.map((child) => (
              <Link
                key={child.label}
                to={child.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.65)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#ffffff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileMenuItem({ item, onClose }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground bg-card hover:bg-muted transition-colors"
      >
        <span>{item.label}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-muted/40"
          >
            {item.children.map((child) => (
              <button
                key={child.label}
                onClick={() => { onClose(); navigate(child.href); }}
                className="flex items-start gap-3 w-full text-left px-5 py-2.5 hover:bg-muted transition-colors border-t border-border/50"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{child.label}</div>
                  {child.desc && <div className="text-xs text-muted-foreground mt-0.5">{child.desc}</div>}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { session } = useLocalAuth();
  const isAdmin = session?.role === "admin";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{ background: scrolled ? "hsl(150,30%,7%)" : "hsl(150,30%,10%)" }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-lg"
    >
      {/* Top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-emerald-400 via-yellow-300 to-emerald-500" />

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <img
            src="https://media.base44.com/images/public/69da5bf6442b31e7eee54888/42e641694_LogoRedesign1.png"
            alt="Ma Belle Promo"
            className="w-10 h-10 rounded-full object-cover shadow-md group-hover:shadow-primary/30 transition-shadow"
          />
          <div className="hidden sm:block">
            <div className="font-heading text-base font-bold leading-tight tracking-tight" style={{ color: "#e2f5ed" }}>Ma Belle Promo</div>
            <div className="text-[10px] tracking-widest uppercase leading-tight" style={{ color: "rgba(255,255,255,0.40)" }}>FDD-MBP · Togo</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <DesktopDropdown key={item.label} item={item} />
          ))}
        </div>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/don")}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full hover:opacity-90 active:scale-95 transition-all tracking-wide uppercase"
            style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#000" }}
          >
            ♥ Faire un don
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate("/dashboard")}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.20)", color: "rgba(255,255,255,0.75)" }}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </button>
          )}
          {!isAdmin && (
            <button
              onClick={() => navigate("/espace-membre")}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.20)", color: "rgba(255,255,255,0.75)" }}
            >
              <User className="w-3.5 h-3.5" /> Mon espace
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2 max-h-[75vh] overflow-y-auto">
              {/* Home */}
              <button
                onClick={() => { setOpen(false); navigate("/"); }}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-foreground bg-card rounded-xl border border-border hover:bg-muted transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Home className="w-3.5 h-3.5 text-white" />
                </div>
                Accueil
              </button>
              {navItems.map((item) => (
                <MobileMenuItem key={item.label} item={item} onClose={() => setOpen(false)} />
              ))}
              {isAdmin && (
                <button
                  onClick={() => { setOpen(false); navigate("/dashboard"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                    <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                  </div>
                  Tableau de bord
                </button>
              )}
              <button
                onClick={() => { setOpen(false); navigate("/implications/soutenir"); }}
                className="w-full mt-2 px-5 py-3.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold rounded-xl tracking-wide"
              >
                ♥ Faire un don
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}