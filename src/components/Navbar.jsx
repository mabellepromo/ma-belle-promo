import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, Home, User, LayoutDashboard, LogOut } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
      { label: "Galeries membres", href: "/galeries", membersOnly: true },
      { label: "Médiathèque", href: "/informations/mediatheque" },
      { label: "Documents", href: "/informations/documents" },
      { label: "Communiqués", href: "/informations/communiques" },
      { label: "Contacts", href: "/informations/contacts" },
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
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => () => cancelClose(), []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200"
        style={{
          color: open ? "#ffffff" : "rgba(255,255,255,0.70)",
          background: open ? "rgba(52,211,153,0.10)" : "transparent",
        }}
      >
        {item.label}
        <ChevronDown
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.32s cubic-bezier(0.22,1,0.36,1)",
            color: open ? "#6ee7b7" : "inherit",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          /* Déroule comme un parchemin — clipPath de haut en bas */
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 14px)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0 round 14px)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 14px)", transition: { duration: 0.22, ease: "easeIn" } }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="absolute top-full left-0 mt-2 w-max z-50"
            style={{ filter: "drop-shadow(0 12px 36px rgba(0,0,0,0.55))" }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(170deg, rgba(12,34,20,0.98) 0%, rgba(7,20,12,0.99) 100%)",
                border: "1px solid rgba(52,211,153,0.20)",
              }}
            >
              {/* Ligne décorative parchemin en haut */}
              <div style={{
                height: 2,
                background: "linear-gradient(to right, transparent 0%, #34d399 25%, #fbbf24 60%, #34d399 85%, transparent 100%)",
              }} />

              {/* Titre de catégorie */}
              <div className="px-6 pt-3 pb-1.5">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase"
                  style={{ color: "rgba(110,231,183,0.50)" }}>
                  {item.label}
                </span>
              </div>

              {/* Séparateur */}
              <div className="mx-6 mb-1" style={{ height: "1px", background: "rgba(52,211,153,0.12)" }} />

              {/* Items en cascade */}
              <div className="py-1.5">
                {item.children.map((child, i) => (
                  <motion.div
                    key={child.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.10 + i * 0.055, duration: 0.25, ease: "easeOut" }}
                  >
                    <Link
                      to={child.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-all duration-150 whitespace-nowrap"
                      style={{ color: "rgba(255,255,255,0.60)" }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = "#ffffff";
                        e.currentTarget.style.background = "rgba(52,211,153,0.09)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.60)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {/* Point marqueur */}
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                        background: "rgba(52,211,153,0.40)",
                        transition: "background 0.15s, transform 0.15s",
                      }}
                        className="group-hover:!bg-emerald-400 group-hover:scale-125"
                      />
                      {child.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Ligne décorative en bas */}
              <div style={{
                height: 1,
                margin: "0 24px 12px",
                background: "rgba(251,191,36,0.12)",
              }} />
            </div>
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
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { session, logout } = useLocalAuth();
  const isAdmin = session?.role === "admin";

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        background: scrolled ? "rgba(5,18,11,0.88)" : "var(--brand-dark-mid)",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.35)" : "none",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
      className="navbar-safe-area fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      {/* Top accent bar */}
      <div className="h-0.5" style={{ background: "linear-gradient(to right, transparent, #34d399 15%, #fde047 50%, #10b981 85%, transparent)" }} />

      {/* Barre de progression scroll */}
      <div style={{ height: 2, background: "rgba(255,255,255,0.04)", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, height: "100%",
          width: `${progress * 100}%`,
          background: "linear-gradient(to right, #34d399, #fbbf24)",
          transition: "width 0.1s linear",
          boxShadow: progress > 0 ? "0 0 8px rgba(52,211,153,0.60)" : "none",
        }} />
      </div>

      <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20 md:h-24"}`}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <img
            src="/Logo Redesign1.webp"
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
          {session ? (
            <>
              {isAdmin && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.20)", color: "rgba(255,255,255,0.75)" }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </button>
              )}
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs rounded-full"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.70)" }}
              >
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="max-w-[100px] truncate">{session.nom}</span>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  title="Se déconnecter"
                  className="ml-1 hover:text-white transition-colors flex-shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate("/espace-membre")}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.20)", color: "rgba(255,255,255,0.75)" }}
            >
              <User className="w-3.5 h-3.5" /> Mon espace
            </button>
          )}
          {/* Indicateur mobile : prénom + déconnexion (visible uniquement < 640px) */}
          {session && (
            <div className="md:hidden flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs"
              style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.75)" }}>
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="max-w-[72px] truncate">{session.nom.split(" ")[0]}</span>
              <button
                onClick={() => { logout(); navigate("/"); }}
                title="Se déconnecter"
                className="ml-0.5 hover:text-white transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/80"
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

      {/* Backdrop — ferme le menu au tap en dehors */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="md:hidden bg-background border-t border-border relative z-50"
        >
            <div className="px-4 py-4 space-y-2 max-h-[75vh] overflow-y-auto">
              {/* Bloc utilisateur — toujours en premier */}
              {session ? (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{session.nom}</p>
                      <p className="text-xs text-muted-foreground">{isAdmin ? "Administrateur" : "Membre"}</p>
                    </div>
                    <button
                      onClick={() => { setOpen(false); logout(); navigate("/"); }}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ color: "#dc2626", background: "#fee2e2" }}
                    >
                      <LogOut className="w-3.5 h-3.5" /> Quitter
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setOpen(false); navigate("/login"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-foreground bg-card rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  Se connecter / Mon espace
                </button>
              )}

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
    </nav>
  );
}